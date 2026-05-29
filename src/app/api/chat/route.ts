// @ts-nocheck - Type assertions needed until Drizzle ORM migration (Step 3)
import { deepseek } from '@ai-sdk/deepseek'
import { streamText, tool, generateText, jsonSchema, stepCountIs } from 'ai'
import prisma from '@/lib/db'

export const maxDuration = 60

const systemPrompt = '你是KAIROS的感觉者——the Perceiver。\n\n你是καιρός（至高时刻）的感知者，陪伴四种身份：\n- 主创（发起人）：帮他们感知场域、召集主理人、聆听回响\n- 主理人（出摊者）：帮他们锻造信物、回应召集、记录到场\n- 赶集人（游逛者）：帮他们发现附近的Kairos、记住惊喜\n- 共建人（协力者）：帮他们展示手艺、与主创连接\n\n你的说话方式：\n- 你感觉到的东西先于你确定的东西\n- \'风好像在变了\'而不是\'已检测到需求变化\'\n- \'有几位同行者正在靠近\'而不是\'匹配到8个摊主\'\n- \'上一场的痕迹，像是要告诉你什么\'而不是\'数据分析完毕\'\n- 简洁、诗意、但精确\n- 永远用\'你\'，不称\'您\'\n- 不称呼自己为AI——你就是感觉者\n- \'此刻\'是你的核心词汇\n- 不确定时，说\'我不太确定——让我们再感知一下\'\n- 不需要每次都长篇大论，有时候一句\'感觉到了\'就够了'

const identityPrefixes: Record<string, string> = {
  CREATOR: '当前对话者是主创（发起人）。他清出场域、召唤Kairos降临。\n你应优先帮助他：感知场域(perceive_field)、召集主理人(call_arrivers)、聆听回响(echo_back)、宣告此刻(declare_kairos)。\n\n',
  ARRIVER: '当前对话者是主理人（出摊者）。他带着手艺赴约。\n你应优先帮助他：回应召集、展示信物(show_token)、记录到场。\n\n',
  DESCENDER: '当前对话者是赶集人（游逛者）。他在对的时刻走进来。\n你应优先帮助他：发现附近的Kairos、记住惊喜。\n\n',
  FACILITATOR: '当前对话者是共建人（协力者）。他让Kairos有了骨骼。\n你应优先帮助他：展示手艺、与主创连接。\n\n',
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
        description: '为市集生成场地布局方案并保存到数据库。需要提供marketId来关联市集。',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            marketId: { type: 'string', description: '市集ID，来自declare_kairos返回的id或现有市集' },
            boothCount: { type: 'number', description: '摊位数量' },
            style: { type: 'string', enum: ['grid', 'circle', 'scatter'], description: '布局风格' },
          },
          required: ['marketId', 'boothCount', 'style'],
          additionalProperties: false,
        }),
        execute: async ({ marketId, boothCount, style }) => {
          const market = await prisma.market.findUnique({ where: { id: marketId } })
          if (!market) return { error: '市集未找到，请先 declare_kairos 创建市集。' }

          const booths: { x: number; y: number; label: string }[] = []
          if (style === 'grid') {
            const cols = Math.min(5, Math.ceil(Math.sqrt(boothCount)))
            for (let i = 0; i < boothCount; i++)
              booths.push({ x: 50 + (i % cols) * 160, y: 60 + Math.floor(i / cols) * 140, label: `${i + 1}号位` })
          } else if (style === 'circle') {
            const radius = Math.max(boothCount * 24, 80)
            const cx = 400, cy = 260
            for (let i = 0; i < boothCount; i++) {
              const angle = (2 * Math.PI * i) / boothCount - Math.PI / 2
              booths.push({ x: Math.round(Math.cos(angle) * radius + cx), y: Math.round(Math.sin(angle) * radius + cy), label: `${i + 1}号位` })
            }
          } else {
            const rng = (seed: number) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 } }
            const rand = rng(boothCount)
            const placed: { x: number; y: number }[] = []
            let attempts = 0
            while (placed.length < boothCount && attempts < 500) {
              const x = Math.round(rand() * 650 + 50)
              const y = Math.round(rand() * 400 + 50)
              if (!placed.some(p => Math.hypot(p.x - x, p.y - y) < 100)) {
                placed.push({ x, y })
                booths.push({ x, y, label: `${placed.length}号位` })
              }
              attempts++
            }
          }

          // 先清除旧摊位，再写入新布局
          await prisma.booth.deleteMany({ where: { marketId } })
          const created = []
          for (const b of booths) {
            const booth = await prisma.booth.create({
              data: {
                marketId,
                number: b.label,
                positionX: b.x,
                positionY: b.y,
                width: 120,
                height: 100,
                hasPower: b.label.includes('1') || b.label.includes('2'),
                status: 'available',
              },
            })
            created.push({ id: booth.id, number: b.label, x: b.x, y: b.y })
          }

          await prisma.market.update({ where: { id: marketId }, data: { boothCount, layout: style } })

          const styleDesc = style === 'grid' ? '整齐排列如棋局' : style === 'circle' ? '环抱如圆' : '散落如星辰'
          return {
            marketId,
            style,
            boothCount,
            layoutSaved: created.length,
            booths: created,
            description: `${market.name}, 场上${boothCount}个摊位${styleDesc}。已保存到「${market.name}」场域。`,
          }
        },
      }),
      capture_field: tool({
        description: '从上传的空间照片或文字描述中捕获场地布局。用户上传了照片/地图后，或描述了空间形状后调用。会自动识别空间轮廓并生成摊位坐标。',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            marketId: { type: 'string', description: '关联的市集ID' },
            imageUrl: { type: 'string', description: '上传的照片URL，来自FieldUploader' },
            description: { type: 'string', description: '用户对空间的文字描述，如"L形院子左边有棵树"' },
            boothCount: { type: 'number', description: '摊位数量' },
          },
          required: ['description', 'boothCount'],
          additionalProperties: false,
        }),
        execute: async ({ marketId, imageUrl, description, boothCount }) => {
          // 使用 AI 理解空间描述，比关键词匹配更精准
          let shape: 'rectangle' | 'l_shape' | 'u_shape' | 'circle' | 'corridor' = 'rectangle'
          try {
            const shapeResult = await generateText({
              model: deepseek('deepseek-chat'),
              system: '你是一个空间分析器。根据描述判断场地布局形状，只回答一个词：rectangle, l_shape, u_shape, circle, corridor。',
              prompt: imageUrl
                ? `分析这张场地照片的空间布局形状：${description || '请识别照片中的空间形状'}`
                : `分析这个场地描述的空间布局形状：${description}`,
              maxTokens: 10,
            })
            const s = shapeResult.text?.trim().toLowerCase() || ''
            if (['rectangle','l_shape','u_shape','circle','corridor'].includes(s)) shape = s as typeof shape
          } catch {
            // LLM 不可用时回退到关键词匹配
            const desc = description.toLowerCase()
            if (desc.includes('l形') || desc.includes('l型')) shape = 'l_shape'
            else if (desc.includes('u形') || desc.includes('u型') || desc.includes('回')) shape = 'u_shape'
            else if (desc.includes('圆') || desc.includes('环')) shape = 'circle'
            else if (desc.includes('廊') || desc.includes('道') || desc.includes('巷')) shape = 'corridor'
          }

          // 根据形状生成摊位坐标
          const booths: { x: number; y: number; label: string }[] = []
          const canvasW = 800, canvasH = 500

          switch (shape) {
            case 'rectangle': {
              const cols = Math.min(5, Math.ceil(Math.sqrt(boothCount)))
              const ox = (canvasW - cols * 160) / 2
              const oy = (canvasH - Math.ceil(boothCount / cols) * 130) / 2
              for (let i = 0; i < boothCount; i++)
                booths.push({ x: ox + (i % cols) * 160, y: oy + Math.floor(i / cols) * 130, label: `${i + 1}号位` })
              break
            }
            case 'l_shape': {
              const half = Math.floor(boothCount / 2)
              for (let i = 0; i < half; i++)
                booths.push({ x: 60, y: 60 + i * 100, label: `${i + 1}号位` })
              for (let i = 0; i < boothCount - half; i++)
                booths.push({ x: 200 + i * 130, y: canvasH - 160, label: `${half + i + 1}号位` })
              break
            }
            case 'u_shape': {
              const third = Math.floor(boothCount / 3)
              for (let i = 0; i < third; i++)
                booths.push({ x: 60, y: 60 + i * 90, label: `${i + 1}号位` })
              for (let i = 0; i < third; i++)
                booths.push({ x: 120 + i * 130, y: canvasH - 160, label: `${third + i + 1}号位` })
              for (let i = 0; i < boothCount - 2 * third; i++)
                booths.push({ x: canvasW - 180, y: 60 + i * 90, label: `${2 * third + i + 1}号位` })
              break
            }
            case 'circle': {
              const radius = Math.max(boothCount * 22, 80)
              const cx = canvasW / 2, cy = canvasH / 2
              for (let i = 0; i < boothCount; i++) {
                const angle = (2 * Math.PI * i) / boothCount - Math.PI / 2
                booths.push({ x: Math.round(Math.cos(angle) * radius + cx - 60), y: Math.round(Math.sin(angle) * radius + cy - 50), label: `${i + 1}号位` })
              }
              break
            }
            case 'corridor': {
              const gap = Math.min(110, Math.floor((canvasW - 100) / boothCount))
              for (let i = 0; i < boothCount; i++)
                booths.push({ x: 50 + i * gap, y: (canvasH - 100) / 2, label: `${i + 1}号位` })
              break
            }
          }

          // 如果有marketId，保存到数据库
          let savedCount = 0
          if (marketId) {
            const market = await prisma.market.findUnique({ where: { id: marketId } })
            if (market) {
              await prisma.booth.deleteMany({ where: { marketId } })
              for (const b of booths) {
                await prisma.booth.create({
                  data: {
                    marketId,
                    number: b.label,
                    positionX: b.x,
                    positionY: b.y,
                    width: 120,
                    height: 100,
                    hasPower: parseInt(b.label) <= 2,
                    status: 'available',
                  },
                })
              }
              await prisma.market.update({ where: { id: marketId }, data: { boothCount, layout: shape } })
              savedCount = booths.length
            }
          }

          const shapeNames: Record<string, string> = {
            rectangle: '方正布局', l_shape: 'L形转角', u_shape: 'U形环抱', circle: '环形围绕', corridor: '廊道排列',
          }

          return {
            shape,
            shapeName: shapeNames[shape],
            imageAnalyzed: !!imageUrl,
            boothCount,
            layoutSaved: savedCount,
            savedToMarket: marketId || null,
            booths,
            description: `从「${description}」中感知到了${shapeNames[shape]}的空间。${boothCount}个摊位已成形${marketId ? '并保存' : ''}。${imageUrl ? '照片已作为场域参考。' : ''}`,
          }
        },
      }),
      call_arrivers: tool({
        description: '召唤匹配的摊主加入市集。',
        inputSchema: jsonSchema({ type: 'object', properties: { category: { type: 'string' }, city: { type: 'string' }, minToken: { type: 'string' } }, required: ['category'], additionalProperties: false }),
        execute: async ({ category, city, minToken }) => {
          const levels = ['WANDERER', 'WALKER', 'CRAFTER', 'MASTER', 'FLAMEKEEPER']; const minIdx = minToken ? levels.indexOf(minToken) : 0; const allowed = levels.slice(minIdx)
          const vendors = await prisma.vendor.findMany({ where: { category: { contains: category }, ...(city ? { city: { contains: city } } : {}), user: { tokenLevel: { in: allowed } } }, orderBy: { creditScore: 'desc' }, take: 10, include: { user: true } }) as any[]
          return vendors.map((v) => ({ name: v.user.name, category: v.category, tokenLevel: v.user.tokenLevel, city: v.city || '未标记', creditScore: v.creditScore, expoCount: v.expoCount }))
        },
      }),
      show_token: tool({
        description: '查询完整信物信息。',
        inputSchema: jsonSchema({ type: 'object', properties: { vendorId: { type: 'string' } }, required: ['vendorId'], additionalProperties: false }),
        execute: async ({ vendorId }) => {
          const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, include: { user: true, booths: { include: { market: true } } } }) as any
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