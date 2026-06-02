import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

// Cloudflare Workers D1-only 版本
// @libsql/client 已移除（不兼容 Workers 运行时）

let _db: ReturnType<typeof drizzle> | null = null

function resolveDb(): ReturnType<typeof drizzle> {
  if (_db) return _db

  // 1. getCloudflareContext（OpenNext 环境）
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    const ctx = getCloudflareContext()
    if (ctx?.env?.DB) {
      _db = drizzle(ctx.env.DB, { schema })
      return _db
    }
  } catch {}

  // 2. globalThis（原生 Worker / wrangler dev）
  if ((globalThis as any).DB) {
    _db = drizzle((globalThis as any).DB, { schema })
    return _db
  }

  throw new Error('D1 binding "DB" not found')
}

// Proxy: 每次访问 db.xxx() 时才解析 D1 绑定
// 避免模块加载时 getCloudflareContext 不可用的时序问题
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (resolveDb() as any)[prop]
  },
})

export * from './schema'
