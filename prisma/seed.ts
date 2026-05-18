import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 清空已有数据...')
  await prisma.plazaPost.deleteMany()
  await prisma.booth.deleteMany()
  await prisma.market.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.service.deleteMany()
  await prisma.user.deleteMany()
  console.log('🌱 开始播种 KAIROS 种子数据...\n')

  // ── 感觉者系统账号 ──
  await prisma.user.create({
    data: {
      id: 'perceiver-system',
      phone: 'system-perceiver',
      name: '感觉者',
      identity: 'CREATOR',
      tokenLevel: 'FLAMEKEEPER',
      tokenScore: 100,
    },
  })
  console.log('✅ 感觉者系统账号')

  // ── 创造者 3人 ──
  const creators = [
    { phone: '13800000001', name: '南风市集' },
    { phone: '13800000002', name: '隅田川手工季' },
    { phone: '13800000003', name: '野集' },
  ]
  const creatorUsers: { id: string; name: string; phone: string }[] = []
  for (const c of creators) {
    const u = await prisma.user.create({
      data: { phone: c.phone, name: c.name, identity: 'CREATOR' },
    })
    creatorUsers.push({ id: u.id, name: c.name, phone: c.phone })
  }
  console.log(`✅ 创造者 ${creators.length}人: ${creators.map((c) => c.name).join('、')}`)

  // ── 到来者 20人 ──
  const categories = ['咖啡', '手作', '美食', '文创', '植物', '古着']
  const cities = ['北京', '上海', '广州', '成都', '杭州']
  const tokenLevels = ['FLAMEKEEPER', 'MASTER', 'CRAFTER', 'WALKER']
  const creditScoreRanges = [
    [95, 100],
    [80, 94],
    [60, 79],
    [40, 59],
  ]

  const arrivers: { userId: string; vendorId: string; name: string; phone: string; category: string; city: string; tokenLevel: string; creditScore: number }[] = []

  for (let tier = 0; tier < 4; tier++) {
    for (let i = 0; i < 5; i++) {
      const idx = tier * 5 + i
      const phone = `1380001${String(idx).padStart(4, '0')}`
      const name = `${cities[i]}${categories[tier % 6]}匠`
      const creditScore = creditScoreRanges[tier][0] + (i % (creditScoreRanges[tier][1] - creditScoreRanges[tier][0] + 1))
      const expoCount = tier === 0 ? 8 + i : tier === 1 ? 5 + i : tier === 2 ? 3 + i : 1 + i

      const u = await prisma.user.create({
        data: {
          phone,
          name,
          identity: 'ARRIVER',
          tokenLevel: tokenLevels[tier],
          tokenScore: Math.min(creditScore, 100),
        },
      })

      const vendor = await prisma.vendor.create({
        data: {
          userId: u.id,
          category: categories[tier % 6],
          city: cities[i],
          creditScore,
          expoCount,
          goodRate: creditScore > 80 ? 0.9 : creditScore > 60 ? 0.75 : 0.6,
          violations: tier === 3 ? 1 : 0,
          complaints: tier === 3 ? 1 : 0,
        },
      })

      arrivers.push({ userId: u.id, vendorId: vendor.id, name, phone, category: categories[tier % 6], city: cities[i], tokenLevel: tokenLevels[tier], creditScore })
    }
  }
  console.log(`✅ 到来者 20人 (S:5 / A:5 / B:5 / C:5)`)

  // ── 降临者 5人 ──
  const descenders: { id: string; name: string; phone: string }[] = []
  for (let i = 0; i < 5; i++) {
    const phone = `1380002${String(i).padStart(4, '0')}`
    const name = `行者${i + 1}号`
    const u = await prisma.user.create({
      data: { phone, name, identity: 'DESCENDER' },
    })
    descenders.push({ id: u.id, name, phone })
  }
  console.log(`✅ 降临者 5人`)

  // ── 助成者 2人 ──
  const fac1 = await prisma.user.create({
    data: {
      phone: '13800030001',
      name: '棚影搭建',
      identity: 'FACILITATOR',
    },
  })
  await prisma.service.create({
    data: { userId: fac1.id, category: '搭建', description: '帐篷、灯光、布景搭建' },
  })

  const fac2 = await prisma.user.create({
    data: {
      phone: '13800030002',
      name: '光尘摄影',
      identity: 'FACILITATOR',
    },
  })
  await prisma.service.create({
    data: { userId: fac2.id, category: '摄影', description: '市集纪实摄影' },
  })
  console.log('✅ 助成者 2人')

  // ── 市集 5个 ──
  const createBooths = async (marketId: string, count: number, assignedCount: number, assignedVendors: string[]) => {
    const booths = []
    for (let i = 0; i < count; i++) {
      const col = i % 5
      const row = Math.floor(i / 5)
      booths.push({
        marketId,
        number: `${i + 1}号位`,
        positionX: 50 + col * 160,
        positionY: 60 + row * 140,
        width: 140,
        height: 100,
        status: i < assignedCount ? 'occupied' : 'available',
        vendorId: i < assignedCount ? assignedVendors[i] : null,
      })
    }
    await prisma.booth.createMany({ data: booths })
  }

  // Market 1: 已发布
  const m1 = await prisma.market.create({
    data: {
      creatorId: creatorUsers[0].id,
      name: '春风集市',
      location: '北京·798艺术区',
      date: '2025-06-15',
      boothCount: 10,
      description: '春风十里，不如市集有你。咖啡、手作、设计——在798的旧厂房里，春天又一次降临。',
      layout: 'grid',
      status: 'published',
    },
  })
  await createBooths(m1.id, 10, 5, [arrivers[0].vendorId, arrivers[1].vendorId, arrivers[5].vendorId, arrivers[6].vendorId, arrivers[10].vendorId])

  // Market 2: 已发布
  const m2 = await prisma.market.create({
    data: {
      creatorId: creatorUsers[1].id,
      name: '夏夜工匠',
      location: '上海·M50创意园',
      date: '2025-07-20',
      boothCount: 10,
      description: '夏夜的长风穿过M50，工匠的手在灯光下像在跳舞。一场关于手艺的Kairos正在降临。',
      layout: 'circle',
      status: 'published',
    },
  })
  await createBooths(m2.id, 10, 5, [arrivers[2].vendorId, arrivers[3].vendorId, arrivers[7].vendorId, arrivers[8].vendorId, arrivers[11].vendorId])

  // Market 3: 进行中
  const m3 = await prisma.market.create({
    data: {
      creatorId: creatorUsers[2].id,
      name: '秋之果实',
      location: '成都·宽窄巷子',
      date: '2025-09-10',
      boothCount: 20,
      description: '秋天不是凋零的季节，是果实落地的季节。宽窄巷子的石板路，将要印上新的脚步。',
      layout: 'free',
      status: 'published',
    },
  })
  await createBooths(m3.id, 20, 10, arrivers.slice(0, 10).map((a) => a.vendorId))

  // Market 4: 已完成
  const m4 = await prisma.market.create({
    data: {
      creatorId: creatorUsers[0].id,
      name: '冬日烟火',
      location: '广州·红砖厂',
      date: '2025-01-05',
      boothCount: 15,
      description: '冬日的南方不下雪，但有烟火。红砖厂的旧烟囱下，手心的温暖比炉火更热。',
      layout: 'grid',
      status: 'finished',
    },
  })
  await createBooths(m4.id, 15, 15, arrivers.slice(0, 15).map((a) => a.vendorId))

  // Market 5: 已完成
  const m5 = await prisma.market.create({
    data: {
      creatorId: creatorUsers[1].id,
      name: '跨年庙会',
      location: '杭州·西湖天地',
      date: '2024-12-31',
      boothCount: 12,
      description: '新年的钟声在西湖上飘荡。庙会的灯笼照亮的不仅是夜，还有即将到来的Kairos。',
      layout: 'circle',
      status: 'finished',
    },
  })
  await createBooths(m5.id, 12, 12, arrivers.slice(0, 12).map((a) => a.vendorId))

  console.log('✅ 市集 5个 (2 published + 1 active + 2 finished)')

  // ── 广场帖子 ──
  const plazaPosts = [
    // 5 WIND 风信
    { userId: creatorUsers[0].id, type: 'WIND', content: `${creatorUsers[0].name}在北京·798艺术区开启了一个新的Kairos——「春风集市」。`, relatedMarketId: m1.id },
    { userId: creatorUsers[1].id, type: 'WIND', content: `${creatorUsers[1].name}在上海·M50创意园开启了一个新的Kairos——「夏夜工匠」。`, relatedMarketId: m2.id },
    { userId: creatorUsers[2].id, type: 'WIND', content: `${creatorUsers[2].name}在成都·宽窄巷子开启了一个新的Kairos——「秋之果实」。`, relatedMarketId: m3.id },
    { userId: creatorUsers[0].id, type: 'WIND', content: `${creatorUsers[0].name}在广州·红砖厂开启了「冬日烟火」——回首望去，那场Kairos的余温还在。`, relatedMarketId: m4.id },
    { userId: creatorUsers[1].id, type: 'WIND', content: `${creatorUsers[1].name}在杭州·西湖天地开启了「跨年庙会」——零点钟声响起的时候，我们都在一起。`, relatedMarketId: m5.id },
    // 3 LANTERN 灯火
    { userId: descenders[0].id, type: 'LANTERN', content: '春风集市上的手冲咖啡让我想起京都的老铺。那一杯的温度，至今还在指尖。', relatedMarketId: m1.id },
    { userId: descenders[1].id, type: 'LANTERN', content: 'M50的夏夜，一位老匠人用半小时教我怎么编竹篮。那只篮子里，现在装着我的夏天。', relatedMarketId: m2.id },
    { userId: descenders[2].id, type: 'LANTERN', content: '宽窄巷子的石板路很窄，但那个卖手作娃娃的摊子前，排了很长很长的队。', relatedMarketId: m3.id },
    // 5 FORUM 几·坛
    { userId: arrivers[0].userId, type: 'FORUM', content: '作为咖啡摊主，我想问问各位同行——你们觉得手冲和意式，哪种在市集上更受欢迎？', relatedMarketId: null },
    { userId: arrivers[5].userId, type: 'FORUM', content: '第一次来Kairos摆摊，有什么需要注意的吗？比如电源、遮阳、收款的建议？', relatedMarketId: null },
    { userId: descenders[3].id, type: 'FORUM', content: '作为一个经常逛市集的降临者，我最喜欢的是那些有故事的摊位。你们遇到的最难忘的摊主是谁？', relatedMarketId: null },
    { userId: creatorUsers[0].id, type: 'FORUM', content: '作为创造者，每次清出一个场域都像在等Kairos降临。大家是怎么选场地的？', relatedMarketId: null },
    { userId: arrivers[10].userId, type: 'FORUM', content: '手作品的定价一直是个难题。大家是怎么在心意和成本之间找到平衡的？', relatedMarketId: null },
    // 2 MEMOIR 相逢记
    { userId: creatorUsers[0].id, type: 'MEMOIR', content: `「冬日烟火」回响——\n\n那天广州降温，但红砖厂里聚集了15位摊主。咖啡的热气在冷空气中格外清晰。\n\n下午四点，阳光斜照进来。一位老奶奶在我的摊前站了很久，最后买了一枚手作戒指。她说：'这是我年轻时戴过的样式。'\n\n那一刻，Kairos降临了。`, relatedMarketId: m4.id },
    { userId: creatorUsers[1].id, type: 'MEMOIR', content: `「跨年庙会」回响——\n\n零点前的西湖天地，12个摊位围成一圈。有人在卖热红酒，有人在剪窗花。\n\n倒数的时候，所有人放下手中的活，一起望向湖面。烟花在头顶炸开，而手心的温度比烟花更持久。\n\n那一年的最后一秒，和这一年的第一秒之间——就是Kairos。`, relatedMarketId: m5.id },
  ]

  for (const post of plazaPosts) {
    await prisma.plazaPost.create({ data: post })
  }
  console.log('✅ 广场帖子: 5风信 + 3灯火 + 5几·坛 + 2相逢记 = 15条')

  // ── 统计 ──
  const userCount = await prisma.user.count()
  const vendorCount = await prisma.vendor.count()
  const marketCount = await prisma.market.count()
  const boothCount = await prisma.booth.count()
  const postCount = await prisma.plazaPost.count()

  console.log('\n📊 播种完成:')
  console.log(`   用户: ${userCount}`)
  console.log(`   摊主档案: ${vendorCount}`)
  console.log(`   市集: ${marketCount}`)
  console.log(`   摊位: ${boothCount}`)
  console.log(`   广场帖子: ${postCount}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 播种失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })