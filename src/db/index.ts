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

// 递归 Mock：支持 Drizzle ORM 完整链式调用
// db.select().from(table).where().all() ← 无限链式，最终返回空数组
function createMockDb(): any {
  const mockFn = function () { return mockFn }
  const handler: ProxyHandler<typeof mockFn> = {
    get(_target, prop) {
      if (prop === 'then') return undefined
      if (prop === Symbol.iterator) return function* () {}
      if (prop === Symbol.toPrimitive) return () => ''
      return mockFn
    },
    apply(_target, _thisArg, _args) {
      return mockFn
    },
  }
  return new Proxy(mockFn, handler)
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (resolveDb() as any)[prop]
  },
})

export * from './schema'
