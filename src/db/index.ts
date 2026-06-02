import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

// Cloudflare Workers D1-only 版本
// @libsql/client 已彻底移除（不兼容 Workers 运行时）
// 本地开发用 wrangler dev --remote 测试 D1

function getDb(env?: any) {
  // 优先从 getCloudflareContext 获取（OpenNext 环境）
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    const ctx = getCloudflareContext()
    if (ctx?.env?.DB) return drizzle(ctx.env.DB, { schema })
  } catch {}

  // 回退：从参数 env 获取（原生 Worker fetch handler）
  if (env?.DB) return drizzle(env.DB, { schema })

  // 本地 dev：wrangler 注入的 globalThis
  if ((globalThis as any).DB) return drizzle((globalThis as any).DB, { schema })

  throw new Error('D1 binding "DB" not found. Ensure D1 is bound in wrangler.toml and Cloudflare Dashboard.')
}

// 延迟创建，避免启动时调用 getCloudflareContext 导致循环依赖
let _db: ReturnType<typeof drizzle> | null = null
export function getDatabase(env?: any) {
  if (!_db) _db = getDb(env)
  return _db
}

// 兼容旧的 import { db } 用法（自动检测）
export const db = getDatabase()
export * from './schema'
