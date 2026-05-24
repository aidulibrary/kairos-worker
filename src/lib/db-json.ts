// KAIROS JSON 数据库适配器 v2 — Cloudflare Pages 兼容
// 完整实现 chat route 所需的所有 Prisma 查询模式

import store, { User, Vendor, Service, Market, Booth, PlazaPost } from './data'

type Obj = Record<string, unknown>

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// ---- WHERE 匹配引擎 ----
function matchWhere<T extends Obj>(items: T[], where: Obj): T[] {
  return items.filter(item => matchOne(item, where))
}

function matchOne(item: Obj, where: Obj): boolean {
  for (const [key, val] of Object.entries(where)) {
    if (val === undefined || val === null) continue
    
    // 嵌套对象 where: { user: { tokenLevel: { in: [...] } } }
    if (isObj(val) && !('contains' in val) && !('in' in val) && !('equals' in val) && !('gt' in val) && !('lt' in val)) {
      const nestedItem = item[key]
      if (!isObj(nestedItem)) {
        // 需要 join 查询：从 store 中找关联数据
        const resolved = resolveRelation(item, key)
        if (!resolved) return false
        if (!matchOne(resolved, val)) return false
        continue
      }
      if (!matchOne(nestedItem, val)) return false
      continue
    }

    const itemVal = item[key]
    
    // { contains: '...' }
    if (isObj(val) && 'contains' in val) {
      const search = String(val.contains)
      if (typeof itemVal !== 'string' || !itemVal.includes(search)) return false
      continue
    }
    
    // { in: [...] }
    if (isObj(val) && 'in' in val) {
      const arr = val.in as unknown[]
      if (!arr.includes(itemVal)) return false
      continue
    }

    // 普通等值
    if (itemVal !== val) return false
  }
  return true
}

// 根据外键解析关联数据，用于嵌套 where
function resolveRelation(item: Obj, key: string): Obj | null {
  // key 映射到 (关联表, 本表外键字段, 关联表主键字段)
  const fkMap: Record<string, { table: Obj[]; localKey: string; remoteKey: string }> = {
    user:    { table: store.users as unknown as Obj[], localKey: 'userId', remoteKey: 'id' },
    vendor:  { table: store.vendors as unknown as Obj[], localKey: 'vendorId', remoteKey: 'id' },
    creator: { table: store.users as unknown as Obj[], localKey: 'creatorId', remoteKey: 'id' },
    market:  { table: store.markets as unknown as Obj[], localKey: 'marketId', remoteKey: 'id' },
  }
  const mapping = fkMap[key]
  if (!mapping) return null
  const fkVal = item[mapping.localKey]
  if (fkVal === undefined || fkVal === null) return null
  return mapping.table.find(r => r[mapping.remoteKey] === fkVal) || null
}

// ---- ORDER BY ----
function applyOrderBy<T extends Obj>(items: T[], orderBy: Obj | Obj[]): T[] {
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy]
  return [...items].sort((a, b) => {
    for (const order of orders) {
      for (const [key, dir] of Object.entries(order)) {
        const aVal = a[key] as string | number | undefined
        const bVal = b[key] as string | number | undefined
        if (aVal === bVal) continue
        if (aVal === undefined || bVal === undefined) continue
        const cmp = aVal < bVal ? -1 : 1
        return dir === 'desc' ? -cmp : cmp
      }
    }
    return 0
  })
}

// ---- INCLUDE 解析（支持嵌套） ----
function resolveInclude<T extends Obj>(items: T[], include: Obj): T[] {
  return items.map(item => resolveOne(item, include) as unknown as T)
}

function resolveOne(item: Obj, include: Obj): Obj {
  const result = { ...item }
  for (const [key, val] of Object.entries(include)) {
    if (!val) continue
    const nested = isObj(val) ? val : null
    
    if (key === 'user' && ('userId' in item || 'creatorId' in item)) {
      const uid = item.userId || item.creatorId
      result.user = store.users.find(u => u.id === uid) || null
    }
    if (key === 'creator' && 'creatorId' in item) {
      result.creator = store.users.find(u => u.id === (item as Obj).creatorId) || null
    }
    if (key === 'vendor' && 'vendorId' in item) {
      const v = store.vendors.find(v => v.id === (item as Obj).vendorId)
      if (v) {
        result.vendor = nested ? resolveOne(v as unknown as Obj, nested) : v
      }
    }
    if (key === 'market' && 'marketId' in item) {
      result.market = store.markets.find(m => m.id === (item as Obj).marketId) || null
    }
    if (key === 'booths') {
      if ('id' in item) {
        let booths: Obj[] = store.booths.filter(b => b.marketId === item.id) as unknown as Obj[]
        if (nested && nested.include) {
          booths = resolveInclude(booths, nested.include as Obj)
        }
        result.booths = booths
      }
    }
  }
  return result
}

// ---- UUID ----
function uid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function now(): string { return new Date().toISOString() }
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

// ============ Prisma 兼容 API ============
const db = {
  user: {
    create: async (args: { data: Partial<User> }) => {
      const u: User = {
        id: uid(), phone: args.data.phone || null, name: args.data.name || '未名同行者',
        identity: args.data.identity || 'DESCENDER', tokenLevel: 'WANDERER',
        tokenScore: 0, verifiedAt: null, createdAt: now(), updatedAt: now(),
      }
      store.users.push(u)
      return clone(u)
    },
    findMany: async (args?: { where?: Obj; orderBy?: Obj; include?: Obj }) => {
      let items = [...store.users] as unknown as Obj[]
      if (args?.where) items = matchWhere(items, args.where)
      if (args?.orderBy) items = applyOrderBy(items, args.orderBy)
      if (args?.include) items = resolveInclude(items, args.include)
      return clone(items)
    },
  },

  vendor: {
    findUnique: async (args: { where: Obj; include?: Obj }) => {
      const items = matchWhere(store.vendors as unknown as Obj[], args.where)
      if (items.length === 0) return null
      let result = items[0]
      if (args.include) result = resolveOne(result, args.include)
      return clone(result)
    },
    findMany: async (args?: { where?: Obj; orderBy?: Obj; take?: number; include?: Obj }) => {
      let items = [...store.vendors] as unknown as Obj[]
      if (args?.where) items = matchWhere(items, args.where)
      if (args?.orderBy) items = applyOrderBy(items, args.orderBy)
      if (args?.take) items = items.slice(0, args.take)
      if (args?.include) items = resolveInclude(items, args.include)
      return clone(items)
    },
  },

  service: {
    findUnique: async (args: { where: Obj }) => {
      const items = matchWhere(store.services as unknown as Obj[], args.where)
      return items.length > 0 ? clone(items[0]) : null
    },
    update: async (args: { where: Obj; data: Partial<Service> }) => {
      const items = matchWhere(store.services as unknown as Obj[], args.where)
      if (items.length === 0) throw new Error('服务未找到')
      const idx = store.services.findIndex(s => s.id === items[0].id)
      Object.assign(store.services[idx], args.data, { updatedAt: now() })
      return clone(store.services[idx])
    },
  },

  market: {
    findMany: async (args?: { where?: Obj; orderBy?: Obj; include?: Obj }) => {
      let items = [...store.markets] as unknown as Obj[]
      if (args?.where) items = matchWhere(items, args.where)
      if (args?.orderBy) items = applyOrderBy(items, args.orderBy)
      if (args?.include) items = resolveInclude(items, args.include)
      return clone(items)
    },
    findUnique: async (args: { where: Obj; include?: Obj }) => {
      const items = matchWhere(store.markets as unknown as Obj[], args.where)
      if (items.length === 0) return null
      let result = items[0]
      if (args.include) result = resolveOne(result, args.include)
      return clone(result)
    },
    update: async (args: { where: Obj; data: Obj }) => {
      const items = matchWhere(store.markets as unknown as Obj[], args.where)
      if (items.length === 0) throw new Error('市集未找到')
      const idx = store.markets.findIndex(m => m.id === items[0].id)
      Object.assign(store.markets[idx], args.data, { updatedAt: now() })
      return clone(store.markets[idx])
    },
  },

  booth: {
    findMany: async (args?: { where?: Obj; include?: Obj; orderBy?: Obj }) => {
      let items = [...store.booths] as unknown as Obj[]
      if (args?.where) items = matchWhere(items, args.where)
      if (args?.orderBy) items = applyOrderBy(items, args.orderBy)
      if (args?.include) items = resolveInclude(items, args.include)
      return clone(items)
    },
    create: async (args: { data: Partial<Booth> & { marketId: string; number: string; positionX: number; positionY: number; width: number; height: number; status: string; hasPower?: boolean } }) => {
      const b: Booth = {
        id: uid(),
        marketId: args.data.marketId,
        vendorId: args.data.vendorId || null,
        number: args.data.number,
        positionX: args.data.positionX,
        positionY: args.data.positionY,
        width: args.data.width || 120,
        height: args.data.height || 100,
        hasPower: args.data.hasPower ?? false,
        status: args.data.status || 'available',
      }
      store.booths.push(b)
      return clone(b)
    },
    deleteMany: async (args: { where: Obj }) => {
      const before = store.booths.length
      store.booths = store.booths.filter(b => !matchOne(b as unknown as Obj, args.where))
      return { count: before - store.booths.length }
    },
  },

  plazaPost: {
    findMany: async (args?: { where?: Obj; orderBy?: Obj; take?: number; include?: Obj }) => {
      let items = [...store.plazaPosts] as unknown as Obj[]
      if (args?.where) items = matchWhere(items, args.where)
      if (args?.orderBy) items = applyOrderBy(items, args.orderBy)
      if (args?.take) items = items.slice(0, args.take)
      if (args?.include) items = resolveInclude(items, args.include)
      return clone(items)
    },
    create: async (args: { data: Partial<PlazaPost> }) => {
      const post: PlazaPost = {
        id: uid(), userId: args.data.userId || '', type: args.data.type || 'WIND',
        content: args.data.content || '', relatedMarketId: args.data.relatedMarketId || null,
        createdAt: now(),
      }
      store.plazaPosts.push(post)
      return clone(post)
    },
  },

  conversation: {
    findMany: async (args?: { where?: Obj; orderBy?: Obj }) => {
      let items = [...store.conversations] as unknown as Obj[]
      if (args?.where) items = matchWhere(items, args.where)
      if (args?.orderBy) items = applyOrderBy(items, args.orderBy)
      return clone(items)
    },
  },
}

export default db
