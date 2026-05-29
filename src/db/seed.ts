import { db, users, vendors, services, markets, booths, plazaPosts } from './index'

const now = '2026-05-28T00:00:00.000Z'

async function seed() {
  console.log('🌱 播种 KAIROS 种子数据...\n')

  // ── 用户 ──
  await db.insert(users).values([
    { id: 'u-seed-1', phone: '13800000001', name: '创世主创', identity: 'CREATOR', tokenLevel: 'FLAMEKEEPER', tokenScore: 500, verifiedAt: now, createdAt: now, updatedAt: now },
    { id: 'u-seed-2', phone: '13800000002', name: '风信主理人', identity: 'ARRIVER', tokenLevel: 'MASTER', tokenScore: 320, verifiedAt: now, createdAt: now, updatedAt: now },
    { id: 'u-seed-3', phone: '13800000003', name: '游历赶集人', identity: 'DESCENDER', tokenLevel: 'WALKER', tokenScore: 45, verifiedAt: now, createdAt: now, updatedAt: now },
    { id: 'u-seed-4', phone: '13800000004', name: '巧手共建人', identity: 'FACILITATOR', tokenLevel: 'CRAFTER', tokenScore: 180, verifiedAt: now, createdAt: now, updatedAt: now },
  ])
  console.log('✅ 用户 4人')

  await db.insert(vendors).values([
    { id: 'v-seed-1', userId: 'u-seed-2', category: '手工', style: '极简', priceRange: '50-200', city: '北京', description: '用风与火锻造信物', creditScore: 92, expoCount: 8, goodRate: 0.95, createdAt: now, updatedAt: now },
  ])
  console.log('✅ 摊主档案')

  await db.insert(services).values([
    { id: 's-seed-1', userId: 'u-seed-4', category: '影像记录', description: '为Kairos留下光的痕迹', projectCount: 12, rating: 4.8, createdAt: now, updatedAt: now },
  ])
  console.log('✅ 共建人服务')

  await db.insert(markets).values([
    { id: 'm-seed-1', creatorId: 'u-seed-1', name: '风的第一次成形', location: '北京·东城区胡同深处', date: '2026-06-15', boothCount: 8, description: '首次降临。万物正在靠近。', status: 'published', createdAt: now, updatedAt: now },
  ])
  console.log('✅ 市集 1个')

  await db.insert(booths).values([
    { id: 'b-seed-1', marketId: 'm-seed-1', vendorId: 'v-seed-1', number: '1号位', positionX: 100, positionY: 80, width: 120, height: 100, hasPower: true, status: 'occupied' },
    { id: 'b-seed-2', marketId: 'm-seed-1', vendorId: null, number: '2号位', positionX: 260, positionY: 80, width: 120, height: 100, hasPower: false, status: 'available' },
    { id: 'b-seed-3', marketId: 'm-seed-1', vendorId: null, number: '3号位', positionX: 420, positionY: 80, width: 120, height: 100, hasPower: false, status: 'reserved' },
  ])
  console.log('✅ 摊位 3个')

  await db.insert(plazaPosts).values([
    { id: 'p-seed-1', userId: 'u-seed-1', type: 'WIND', content: '第一次降临即将到来。风吹过的地方，都听见了。', relatedMarketId: 'm-seed-1', createdAt: now },
    { id: 'p-seed-2', userId: 'u-seed-2', type: 'LANTERN', content: '我准备好了信物——用三月的风和一月的霜锻的。', createdAt: now },
    { id: 'p-seed-3', userId: 'u-seed-3', type: 'MEMOIR', content: '上一次Kairos降临，我闻到了雨前泥土的味道。', createdAt: now },
    { id: 'p-seed-4', userId: 'u-seed-1', type: 'FORUM', content: '欢迎各位同行者。这里是广场——一切Kairos的起点。', createdAt: now },
  ])
  console.log('✅ 广场帖子 4条')

  console.log('\n📊 播种完成')
}

seed().catch(console.error)
