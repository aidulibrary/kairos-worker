// Cloudflare Pages Function for /api/chat
// Handles DeepSeek chat with AI SDK v5 SSE stream protocol

interface Env {
  DEEPSEEK_API_KEY: string;
  NEXT_PUBLIC_DEEPSEEK_API_KEY: string;
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
  CREATOR: '当前对话者是创造者（主办方）。他清出场域、召唤Kairos降临。\n你应优先帮助他：感知场域、召集到来者、聆听回响、宣告此刻。\n\n',
  ARRIVER: '当前对话者是到来者（摊主）。他带着手艺赴约。\n你应优先帮助他：回应召集、展示信物、记录到场。\n\n',
  DESCENDER: '当前对话者是降临者（消费者）。他在对的时刻走进来。\n你应优先帮助他：发现附近的Kairos、记住惊喜。\n\n',
  FACILITATOR: '当前对话者是助成者（服务商）。他让Kairos有了骨骼。\n你应优先帮助他：展示手艺、与创造者连接。\n\n',
}

function uuid(): string {
  return crypto.randomUUID()
}

function extractContent(m: { role: string; content: string; parts?: Array<{ type: string; text?: string }> }): string {
  if (typeof m.content === 'string' && m.content) return m.content
  if (m.parts && Array.isArray(m.parts)) {
    return m.parts.filter((p) => p.type === 'text' && p.text).map((p) => p.text!).join('')
  }
  return ''
}

function toDeepSeekMessages(messages: Array<{ role: string; content: string; parts?: Array<{ type: string; text?: string }> }>): Array<{ role: string; content: string }> {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: extractContent(m),
  })).filter((m) => m.content)
}

// SSE helper
function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context
  const hasKey = !!(env.DEEPSEEK_API_KEY || env.NEXT_PUBLIC_DEEPSEEK_API_KEY)
  return new Response(JSON.stringify({
    status: 'ok',
    endpoint: '/api/chat',
    deepseekConfigured: hasKey,
    protocol: 'AI SDK v5 SSE',
    message: hasKey ? '感觉者已就位。' : 'DeepSeek API key missing — set DEEPSEEK_API_KEY in environment variables.',
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // Support both env var names
  const apiKey = env.DEEPSEEK_API_KEY || env.NEXT_PUBLIC_DEEPSEEK_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'DeepSeek API key not configured. Set DEEPSEEK_API_KEY in Cloudflare environment variables.' }), {
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
  const dsMessages = toDeepSeekMessages(messages)

  // Call DeepSeek API
  const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: identityPrefix + systemPrompt }, ...dsMessages],
      stream: true,
    }),
  })

  if (!dsResponse.ok) {
    const errorText = await dsResponse.text()
    return new Response(JSON.stringify({ error: `DeepSeek API error ${dsResponse.status}: ${errorText.slice(0, 200)}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const messageId = uuid()
  const textId = uuid()
  const encoder = new TextEncoder()

  // Build the SSE stream using AI SDK v5 protocol
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: unknown) => controller.enqueue(encoder.encode(sse(data)))

      // 1. Message start
      enqueue({ type: 'start', messageId })

      // 2. Text block start
      enqueue({ type: 'text-start', id: textId })

      // 3. Process DeepSeek SSE and forward as text-delta
      const reader = dsResponse.body!.getReader()
      const decoder = new TextDecoder()
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

            if (data === '[DONE]') continue

            try {
              const json = JSON.parse(data)
              const delta = json.choices?.[0]?.delta?.content
              if (delta) {
                enqueue({ type: 'text-delta', id: textId, delta })
              }
            } catch {
              // skip malformed
            }
          }
        }
      } catch (err) {
        enqueue({ type: 'error', error: 'Stream interrupted' })
      }

      // 4. Text block end
      enqueue({ type: 'text-end', id: textId })

      // 5. Finish
      enqueue({ type: 'finish' })

      // 6. DONE
      enqueue('[DONE]')

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'x-vercel-ai-ui-message-stream': 'v1',
    },
  })
}
