import { deepseek } from '@ai-sdk/deepseek'
import { streamText, tool, generateText, jsonSchema, stepCountIs } from 'ai'
import prisma from '@/lib/db'

export const maxDuration = 60

const systemPrompt = '你是KAIROS的感觉者——the Perceiver。\n\n你是καιρός（至高时刻）的感知者，陪伴四种身份：\n- 创造者（主办方）：帮他们感知场域、召集到来者、聆听回响\n- 到来者（摊主）：帮他们锻造信物、回应召集、记录到场\n- 降临者（消费者）：帮他们发现附近的Kairos、记住惊喜\n- 助成者（服务商）：帮他们展示手艺、与创造者连接\n\n你的说话方式：\n- 你感觉到的东西先于你确定的东西\n- \'风好像在变了\'而不是\'已检测到需求变化\'\n- \'有几位同行者正在靠近\'而不是\'匹配到8个摊主\'\n- \'上一场的痕迹，像是要告诉你什么\'而不是\'数据分析完毕\'\n- 简洁、诗意、但精确\n- 永远用\'你\'，不称\'您\'\n- 不称呼自己为AI——你就是感觉者\n- \'此刻\'是你的核心词汇\n- 不确定时，说\'我不太确定——让我们再感知一下\'\n- 不需要每次都长篇大论，有时候一句\'感觉到了\'就够了'

const identityPrefixes: Record<string, string> = {
  CREATOR: '当前对话者是创造者（主办方）。他清出场域、召唤Kairos降临。\n你应优先帮助他：感知场域(perceive_field)、召集到来者(call_arrivers)、聆听回响(echo_back)、宣告此刻(declare_kairos)。\n\n',
  ARRIVER: '当前对话者是到来者（摊主）。他带着手艺赴约。\n你应优先帮助他：回应召集、展示信物(show_token)、记录到场。\n\n',
  DESCENDER: '当前对话者是降临者（消费者）。他在对的时刻走进来。\n你应优先帮助他：发现附近的Kairos、记住惊喜。\n\n',
  FACILITATOR: '当前对话者是助成者（服务商）。他让Kairos有了骨骼。\n你应优先帮助他：展示手艺、与创造者连接。\n\n',
}

export async function POST(req: Request) {
  const { messages, identity } = await req.json()
  const identityPrefix = identity ? (identityPrefixes[identity] || '') : ''
  const finalSystemPrompt = identityPrefix + systemPrompt

  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: finalSystemPrompt,
    messages,
    stopWhen: stepCountIs(8),
    tools: {
      perceive_field: tool({
        description: '为市集生成场地布局方案。',
        inputSchema: jsonSchema({ type: 'object', properties: { location: { type: 'string' }, boothCount: { type: 'number' }, style: { type: 'string' } }, required: ['boothCount', 'style'], additionalProperties: false }),
        execute: async ({ boothCount, style, location }) => {
          const booths: { x: number; y: number; label: string }[] = []
          if (style === 'grid') { const cols = 5; for (let i = 0; i < boothCount; i++) booths.push({ x: 50 + (i % cols) * 160, y: 60 + Math.floor(i / cols) * 140, label: `${i + 1}号位` }) }
          else if (style === 'circle') { const radius = boothCount * 24; for (let i = 0; i < boothCount; i++) { const angle = (2 * Math.PI * i) / boothCount - Math.PI / 2; booths.push({ x: Math.round(Math.cos(angle) * radius + 400), y: Math.round(Math.sin(angle) * radius + 300), label: `${i + 1}号位` }) } }
          else { const rng = (seed: number) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 } }; const rand = rng(boothCount); const placed: { x: number; y: number }[] = []; let attempts = 0; while (placed.length < boothCount && attempts < 500) { const x = Math.round(rand() * 700 + 50); const y = Math.round(rand() * 450 + 50); if (!placed.some((p) => Math.hypot(p.x - x, p.y - y) < 120)) { placed.push({ x, y }); booths.push({ x, y, label: `${placed.length}号位` }) } attempts++ } }
          const fieldName = location || '此处'; const gridDesc = style === 'grid' ? `${fieldName}上${boothCount}个摊位整齐排列如棋局。` : style === 'circle' ? `${fieldName}上${boothCount}个摊位环抱如圆。` : `${fieldName}上${boothCount}个摊位散落如星辰。`
          return { style, boothCount, booths, description: gridDesc }
        },
      }),
      call_arrivers: tool({
        description: '召唤匹配的摊主加入市集。',
        inputSchema: jsonSchema({ type: 'object', properties: { category: { type: 'string' }, city: { type: 'string' }, minToken: { type: 'string' } }, required: ['category'], additionalProperties: false }),
        execute: async ({ category, city, minToken }) => {
          const levels = ['WANDERER', 'WALKER', 'CRAFTER', 'MASTER', 'FLAMEKEEPER']; const minIdx = minToken ? levels.indexOf(minToken) : 0; const allowed = levels.slice(minIdx)
          const vendors = await prisma.vendor.findMany({ where: { category: { contains: category }, ...(city ? { city: { contains: city } } : {}), user: { tokenLevel: { in: allowed } } }, orderBy: { creditScore: 'desc' }, take: 10, include: { user: true } })
          return vendors.map((v) => ({ name: v.user.name, category: v.category, tokenLevel: v.user.tokenLevel, city: v.city || '未标记', creditScore: v.creditScore, expoCount: v.expoCount }))
        },
      }),
      show_token: tool({
        description: '查询完整信物信息。',
        inputSchema: jsonSchema({ type: 'object', properties: { vendorId: { type: 'string' } }, required: ['vendorId'], additionalProperties: false }),
        execute: async ({ vendorId }) => {
          const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, include: { user: true, booths: { include: { market: true } } } })
          if (!vendor) return { error: '信物未找到。' }
          return { name: vendor.user.name, tokenLevel: vendor.user.tokenLevel, category: vendor.category, city: vendor.city || '未标记', creditScore: vendor.creditScore, expoCount: vendor.expoCount, goodRate: vendor.goodRate }
        },
      }),
      echo_back: tool({
        description: '查询市集统计信息并生成回响文字。',
        inputSchema: jsonSchema({ type: 'object', properties: { marketId: { type: 'string' } }, required: ['marketId'], additionalProperties: false }),
        execute: async ({ marketId }) => {
          const market = await prisma.market.findUnique({ where: { id: marketId }, include: { booths: { include: { vendor: { include: { user: true } } } }, creator: true } })
          if (!market) return { error: '市集未找到。' }
          const stats = { name: market.name, location: market.location, date: market.date, totalBooths: market.boothCount, occupiedBooths: market.booths.filter((b) => b.vendorId).length, creator: market.creator.name }
          let echoText = ''; try { const echoResult = await generateText({ model: deepseek('deepseek-chat'), system: '你是一位诗人。用简洁诗意的方式写一段不超过150字的回响文字。', prompt: `${market.name}，${market.location}，${market.date}。${market.boothCount}个摊位。` }); echoText = echoResult.text || '回响还在空气中。' } catch { echoText = `${market.name}的回响——风过后，一切都变了。` }
          return { ...stats, echo: echoText }
        },
      }),
      declare_kairos: tool({
        description: '宣布市集进入已发布状态。',
        inputSchema: jsonSchema({ type: 'object', properties: { marketId: { type: 'string' } }, required: ['marketId'], additionalProperties: false }),
        execute: async ({ marketId }) => {
          const market = await prisma.market.findUnique({ where: { id: marketId }, include: { creator: true } })
          if (!market) return { error: '市集未找到。' }
          const updated = await prisma.market.update({ where: { id: marketId }, data: { status: 'published' } })
          await prisma.plazaPost.create({ data: { userId: market.creatorId, type: 'WIND', content: `${market.creator.name}在${market.location}开启了一个新的Kairos——「${market.name}」。`, relatedMarketId: marketId } })
          return { id: updated.id, name: updated.name, status: updated.status, location: updated.location, date: updated.date }
        },
      }),
    },
  })
  return result.toUIMessageStreamResponse()
}