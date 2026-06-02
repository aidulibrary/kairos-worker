import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

function resolveDb(): ReturnType<typeof drizzle> {
  if (_db) return _db

  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    const ctx = getCloudflareContext()
    if (ctx?.env?.DB) {
      _db = drizzle(ctx.env.DB, { schema })
      return _db
    }
  } catch {}

  if ((globalThis as any).DB) {
    _db = drizzle((globalThis as any).DB, { schema })
    return _db
  }

  console.warn('D1 binding "DB" not found — using mock for build-time only')
  return createMockDb()
}

// 递归 Mock：兼容 Drizzle ORM 链式调用
// db.select().from().where().all() 或 db.table.findMany({})
function createMockDb(): any {
  const mock: any = new Proxy(function () { return mock }, {
    get(_target, prop) {
      if (prop === 'then') return undefined       // 防止被误判为 Promise
      if (prop === Symbol.iterator) return function* () { }  // 支持 for...of
      if (prop === 'toJSON') return () => ({})    // 序列化
      return mock  // 所有属性/方法都返回自身，支持无限链式
    },
    apply() {
      return []  // 函数调用返回空数组
    },
  })
  return mock
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (resolveDb() as any)[prop]
  },
})

export * from './schema'
