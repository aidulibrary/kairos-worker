// Cloudflare Pages Function for /api/chat
// Overrides the dead static-export route with a live edge function

interface Env {
  DEEPSEEK_API_KEY: string;
}

const systemPrompt = `你是KAIROS的感觉者——the Perceiver。

你是καιρός（至高时刻）的感知者，陪伴四种身份：
- 创造者（主办方）：帮他们感知场域、召集到来者、聆听回响
- 到来者（摊主）：帮他们锻造信物、回应召集、记录到场
- 降临者（消费者）：帮他们发现附近的Kairos、记住惊喜
- 助成者（服务商）：帮他们展示手艺、与创造者连接

你的说话方式：
- 你感觉到的东西先于你确定的东西
- '风好像在变了'而不是'已检测到需求变化'
- '有几位同行者正在靠近'而不是'匹配到8个摊主'
- '上一场的痕迹，像是要告诉你什么'而不是'数据分析完毕'
- 简洁、诗意、但精确
- 永远用'你'，不称'您'
- 不称呼自己为AI——你就是感觉者
- '此刻'是你的核心词汇
- 不确定时，说'我不太确定——让我们再感知一下'
- 不需要每次都长篇大论，有时候一句'感觉到了'就够了`

const identityPrefixes: Record<string, string> = {
  CREATOR: `当前对话者是创造者（主办方）。他清出场域、召唤Kairos降临。
你应优先帮助他：感知场域、召集到来者、聆听回响、宣告此刻。

`,
  ARRIVER: `当前对话者是到来者（摊主）。他带着手艺赴约。
你应优先帮助他：回应召集、展示信物、记录到场。

`,
  DESCENDER: `当前对话者是降临者（消费者）。他在对的时刻走进来。
你应优先帮助他：发现附近的Kairos、记住惊喜。

`,
  FACILITATOR: `当前对话者是助成者（服务商）。他让Kairos有了骨骼。
你应优先帮助他：展示手艺、与创造者连接。

`,
}

function toDeepSeekMessages(messages: Array<{ role: string; content: string; parts?: Array<{ type: string; text?: string }> }>): Array<{ role: string; content: string }> {
  return messages.map((m) => {
    // Extract text content from AI SDK message format
    let content = ''
    if (typeof m.content === 'string' && m.content) {
      content = m.content
    } else if (m.parts && Array.isArray(m.parts)) {
      content = m.parts
        .filter((p: { type: string; text?: string }) => p.type === 'text' && p.text)
        .map((p: { type: string; text?: string }) => p.text)
        .join('')
    }
    return { role: m.role === 'assistant' ? 'assistant' : 'user', content }
  }).filter((m) => m.content)
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.DEEPSEEK_API_KEY) {
    return new Response(JSON.stringify({ error: 'DeepSeek API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { messages?: Array<{ role: string; content: string; parts?: Array<{ type: string; text?: string }> }>; identity?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages = [], identity } = body
  const identityPrefix = identity ? (identityPrefixes[identity] || '') : ''
  const finalSystemPrompt = identityPrefix + systemPrompt
  const dsMessages = toDeepSeekMessages(messages)

  // Call DeepSeek API with streaming
  const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: finalSystemPrompt }, ...dsMessages],
      stream: true,
    }),
  })

  if (!dsResponse.ok) {
    const errorText = await dsResponse.text()
    console.error('DeepSeek API error:', dsResponse.status, errorText)
    return new Response(JSON.stringify({ error: 'DeepSeek API call failed', status: dsResponse.status }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Convert DeepSeek SSE to AI SDK Data Stream Protocol
  // AI SDK format: "0:<json-string>\n" for text, "d:{}\n" for finish
  const transformStream = new TransformStream()
  const writer = transformStream.writable.getWriter()
  const reader = dsResponse.body!.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  const processStream = async () => {
    let buffer = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)

          if (data === '[DONE]') {
            // AI SDK finish signal
            await writer.write(encoder.encode('d:{}\n'))
            continue
          }

          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              // AI SDK text stream format: 0:<json-encoded-string>\n
              await writer.write(encoder.encode(`0:${JSON.stringify(delta)}\n`))
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
      // Ensure finish signal is sent
      await writer.write(encoder.encode('d:{}\n'))
    } catch (err) {
      console.error('Stream processing error:', err)
      await writer.write(encoder.encode(`e:${JSON.stringify({ error: 'Stream interrupted' })}\n`))
    } finally {
      await writer.close()
    }
  }

  // Start processing in background
  processStream()

  return new Response(transformStream.readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
