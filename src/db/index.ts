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

  // 构建时没有 D1，返回 mock 避免 next build 崩溃
  // 运行时 Worker 里一定有 D1 绑定，不会走到这里
  console.warn('D1 binding "DB" not found — using mock for build-time only')
  return new Proxy({} as any, {
    get: () => () => [],
  }) as any
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (resolveDb() as any)[prop]
  },
})

export * from './schema'
