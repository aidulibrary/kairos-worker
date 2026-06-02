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

  // 构建时无 D1，返回链式 mock（兼容 Drizzle query builder）
  console.warn('D1 binding "DB" not found — using mock for build-time only')
  return createMockDb()
}

// Mock DB: 支持 Drizzle 无限链式调用，最终返回空数组
function createMockDb(): any {
  const handler: ProxyHandler<any> = {
    get(_, prop) {
      if (prop === 'then') return undefined // 防止被当作 Promise
      // 返回新的 mock 对象，支持 .select().from().where().all() 链式调用
      return new Proxy(() => [], {
        get: () => new Proxy(() => [], { get: () => new Proxy(() => [], handler) }),
        apply: () => [],
      })
    },
  }
  return new Proxy(() => ({}), handler)
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (resolveDb() as any)[prop]
  },
})

export * from './schema'
