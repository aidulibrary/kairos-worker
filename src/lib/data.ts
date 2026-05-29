// KAIROS JSON 数据层 — Cloudflare Pages 兼容
// 替代 Prisma/SQLite，数据内联为模块（构建时打包进 Worker）

export interface User {
  id: string
  phone: string | null
  name: string
  identity: string
  tokenLevel: string
  tokenScore: number
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  userId: string
  category: string
  style: string | null
  priceRange: string | null
  city: string | null
  description: string | null
  logo: string | null
  creditScore: number
  expoCount: number
  goodRate: number
  violations: number
  complaints: number
  createdAt: string
  updatedAt: string
  user?: User
  booths?: (Booth & { market?: Market })[]
}

export interface Service {
  id: string
  userId: string
  category: string
  description: string | null
  credentialUrl: string | null
  projectCount: number
  rating: number
  createdAt: string
  updatedAt: string
}

export interface Market {
  id: string
  creatorId: string
  name: string
  location: string
  date: string
  boothCount: number
  description: string | null
  layout: string | null
  status: string
  createdAt: string
  updatedAt: string
  creator?: User
  booths?: (Booth & { vendor?: Vendor & { user?: User } })[]
}

export interface Booth {
  id: string
  marketId: string
  vendorId: string | null
  number: string
  positionX: number
  positionY: number
  width: number
  height: number
  hasPower: boolean
  status: string
  market?: Market
  vendor?: Vendor
}

export interface PlazaPost {
  id: string
  userId: string
  type: string
  content: string
  relatedMarketId: string | null
  createdAt: string
  user?: User
}

export interface Conversation {
  id: string
  userId: string
  title: string | null
  messages: string
  createdAt: string
  updatedAt: string
  user?: User
}

interface Store {
  users: User[]
  vendors: Vendor[]
  services: Service[]
  markets: Market[]
  booths: Booth[]
  plazaPosts: PlazaPost[]
  conversations: Conversation[]
}

const now = '2026-05-18T00:00:00.000Z'

const store: Store = {
  users: [
    { id: 'u-seed-1', phone: '13800000001', name: '创世主创', identity: 'CREATOR', tokenLevel: 'FLAMEKEEPER', tokenScore: 500, verifiedAt: now, createdAt: now, updatedAt: now },
    { id: 'u-seed-2', phone: '13800000002', name: '风信主理人', identity: 'ARRIVER', tokenLevel: 'MASTER', tokenScore: 320, verifiedAt: now, createdAt: now, updatedAt: now },
    { id: 'u-seed-3', phone: '13800000003', name: '游历赶集人', identity: 'DESCENDER', tokenLevel: 'WALKER', tokenScore: 45, verifiedAt: now, createdAt: now, updatedAt: now },
    { id: 'u-seed-4', phone: '13800000004', name: '巧手共建人', identity: 'FACILITATOR', tokenLevel: 'CRAFTER', tokenScore: 180, verifiedAt: now, createdAt: now, updatedAt: now },
  ],
  vendors: [
    { id: 'v-seed-1', userId: 'u-seed-2', category: '手工', style: '极简', priceRange: '50-200', city: '北京', description: '用风与火锻造信物', logo: null, creditScore: 92, expoCount: 8, goodRate: 0.95, violations: 0, complaints: 0, createdAt: now, updatedAt: now },
  ],
  services: [
    { id: 's-seed-1', userId: 'u-seed-4', category: '影像记录', description: '为Kairos留下光的痕迹', credentialUrl: null, projectCount: 12, rating: 4.8, createdAt: now, updatedAt: now },
  ],
  markets: [
    { id: 'm-seed-1', creatorId: 'u-seed-1', name: '风的第一次成形', location: '北京·东城区胡同深处', date: '2026-06-15', boothCount: 8, description: '首次降临。万物正在靠近。', layout: null, status: 'published', createdAt: now, updatedAt: now },
  ],
  booths: [
    { id: 'b-seed-1', marketId: 'm-seed-1', vendorId: 'v-seed-1', number: '1号位', positionX: 100, positionY: 80, width: 120, height: 100, hasPower: true, status: 'occupied' },
    { id: 'b-seed-2', marketId: 'm-seed-1', vendorId: null, number: '2号位', positionX: 260, positionY: 80, width: 120, height: 100, hasPower: false, status: 'available' },
    { id: 'b-seed-3', marketId: 'm-seed-1', vendorId: null, number: '3号位', positionX: 420, positionY: 80, width: 120, height: 100, hasPower: false, status: 'reserved' },
  ],
  plazaPosts: [
    { id: 'p-seed-1', userId: 'u-seed-1', type: 'WIND', content: '第一次降临即将到来。风吹过的地方，都听见了。', relatedMarketId: 'm-seed-1', createdAt: now },
    { id: 'p-seed-2', userId: 'u-seed-2', type: 'LANTERN', content: '我准备好了信物——用三月的风和一月的霜锻的。', relatedMarketId: null, createdAt: now },
    { id: 'p-seed-3', userId: 'u-seed-3', type: 'MEMOIR', content: '上一次Kairos降临，我闻到了雨前泥土的味道。', relatedMarketId: null, createdAt: now },
    { id: 'p-seed-4', userId: 'u-seed-1', type: 'FORUM', content: '欢迎各位同行者。这里是广场——一切Kairos的起点。', relatedMarketId: null, createdAt: now },
  ],
  conversations: [],
}

export default store
