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

function createMockDb(): any {
  let proxy: any
  const handler: ProxyHandler<() => any> = {
    get(_target, prop) {
      if (prop === 'then') return undefined
      if (prop === Symbol.iterator) return function* () {}
      return proxy
    },
    apply() {
      return proxy  // 返回 proxied 版本，不是原始函数
    },
  }
  const mockFn = function () { return proxy }
  proxy = new Proxy(mockFn, handler)
  return proxy
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (resolveDb() as any)[prop]
  },
})

export * from './schema'
