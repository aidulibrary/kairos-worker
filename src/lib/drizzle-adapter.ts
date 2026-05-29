// @ts-nocheck
/**
 * Drizzle ORM → Prisma API 兼容适配器
 * 最小化改造现有 API Routes，只需替换 import 源即可使用真实数据库
 */
import { eq, like, inArray, desc, asc, and, or } from 'drizzle-orm'
import { db } from '../db/index'
import {
  users, vendors, services, markets, booths, plazaPosts, conversations,
} from '../db/schema'

type Obj = Record<string, unknown>

// ── 工具函数 ──

function buildWhere(table: any, where?: Obj): any {
  if (!where) return undefined
  const conditions: any[] = []
  for (const [key, val] of Object.entries(where)) {
    if (val === undefined || val === null) continue
    if (typeof val === 'object' && val !== null) {
      if ('contains' in val) {
        conditions.push(like(table[key as keyof typeof table], `%${val.contains}%`))
      } else if ('in' in val) {
        const arr = val.in as unknown[]
        if (arr.length > 0) conditions.push(inArray(table[key as keyof typeof table], arr))
      } else {
        // Nested relation where - skip for now, handled separately
      }
    } else {
      conditions.push(eq(table[key as keyof typeof table], val))
    }
  }
  return conditions.length === 1 ? conditions[0] : conditions.length > 1 ? and(...conditions) : undefined
}

function buildOrderBy(table: any, orderBy?: Obj | Obj[]): any[] {
  if (!orderBy) return []
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy]
  return orders.flatMap(o =>
    Object.entries(o).map(([key, dir]) =>
      dir === 'desc' ? desc(table[key as keyof typeof table]) : asc(table[key as keyof typeof table])
    )
  )
}

function uid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}
function now(): string { return new Date().toISOString() }

// ── 表映射 ──

const tableMap: Record<string, { table: any; pk: string }> = {
  user: { table: users, pk: 'id' },
  vendor: { table: vendors, pk: 'id' },
  service: { table: services, pk: 'id' },
  market: { table: markets, pk: 'id' },
  booth: { table: booths, pk: 'id' },
  plazaPost: { table: plazaPosts, pk: 'id' },
  conversation: { table: conversations, pk: 'id' },
}

// ── 适配器工厂 ──

function createAdapter(modelName: string) {
  const { table } = tableMap[modelName]
  if (!table) throw new Error(`Unknown model: ${modelName}`)
  const pk = tableMap[modelName].pk

  return {
    findMany: async (args?: { where?: Obj; orderBy?: Obj | Obj[]; include?: Obj; take?: number }) => {
      const w = buildWhere(table, args?.where)
      const ob = buildOrderBy(table, args?.orderBy)
      let query = db.select().from(table)
      if (w) query = query.where(w as any) as any
      if (ob.length) query = query.orderBy(...ob) as any
      if (args?.take) query = query.limit(args.take) as any
      const rows = await query
      // include 关系在查询后手动拼接
      if (args?.include && rows.length > 0) {
        return resolveIncludes(modelName, rows as any[], args.include)
      }
      return rows
    },

    findUnique: async (args: { where: Obj; include?: Obj }) => {
      const w = buildWhere(table, args.where)
      if (!w) return null
      const rows = await db.select().from(table).where(w as any).limit(1)
      if (rows.length === 0) return null
      if (args.include) {
        const resolved = await resolveIncludes(modelName, rows as any[], args.include)
        return resolved[0] || null
      }
      return rows[0] || null
    },

    create: async (args: { data: Obj }): Promise<any> => {
      const data = { id: uid(), createdAt: now(), updatedAt: now(), ...args.data }
      await db.insert(table).values(data as any)
      return data
    },

    update: async (args: { where: Obj; data: Obj }) => {
      const w = buildWhere(table, args.where)
      if (!w) throw new Error(`${modelName} not found`)
      const updated = { ...args.data, updatedAt: now() }
      await db.update(table).set(updated).where(w as any)
      const rows = await db.select().from(table).where(w as any).limit(1)
      return rows[0] || null
    },

    delete: async (args: { where: Obj }) => {
      const w = buildWhere(table, args.where)
      if (!w) return { count: 0 }
      await db.delete(table).where(w as any)
      return { count: 1 }
    },

    deleteMany: async (args: { where: Obj }) => {
      const w = buildWhere(table, args.where)
      if (!w) return { count: 0 }
      const before = (await db.select().from(table).where(w as any)).length
      await db.delete(table).where(w as any)
      return { count: before }
    },
  }
}

// ── include 关系解析 ──

async function resolveIncludes(modelName: string, rows: any[], include: Obj): Promise<any[]> {
  const results = []
  for (const row of rows) {
    const enriched = { ...row }
    for (const [key, val] of Object.entries(include)) {
      if (!val) continue
      const nested = typeof val === 'object' ? val as Obj : null

      if (key === 'user' && 'userId' in row) {
        const u = await db.select().from(users).where(eq(users.id, row.userId as string)).limit(1)
        enriched.user = u[0] || null
      }
      if (key === 'creator' && 'creatorId' in row) {
        const u = await db.select().from(users).where(eq(users.id, row.creatorId as string)).limit(1)
        enriched.creator = u[0] || null
      }
      if (key === 'vendor' && 'vendorId' in row) {
        const v = row.vendorId
          ? (await db.select().from(vendors).where(eq(vendors.id, row.vendorId as string)).limit(1))[0]
          : null
        if (v && nested?.include) {
          enriched.vendor = (await resolveIncludes('vendor', [v], nested.include))[0]
        } else {
          enriched.vendor = v || null
        }
      }
      if (key === 'market' && 'marketId' in row) {
        const m = await db.select().from(markets).where(eq(markets.id, row.marketId as string)).limit(1)
        enriched.market = m[0] || null
      }
      if (key === 'booths') {
        const bs = await db.select().from(booths).where(eq(booths.marketId, row.id as string))
        if (nested?.include) {
          enriched.booths = await resolveIncludes('booth', bs as any[], nested.include)
        } else {
          enriched.booths = bs
        }
      }
    }
    results.push(enriched)
  }
  return results
}

// ── 导出（最小改动：变量名 prisma → 兼容适配器） ──

const prisma = {
  user: createAdapter('user'),
  vendor: createAdapter('vendor'),
  service: createAdapter('service'),
  market: createAdapter('market'),
  booth: createAdapter('booth'),
  plazaPost: createAdapter('plazaPost'),
  conversation: createAdapter('conversation'),
}

export default prisma
