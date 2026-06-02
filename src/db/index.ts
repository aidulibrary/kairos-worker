import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

// 定义 D1 数据库类型
type D1Database = any

// 获取 D1 绑定（兼容 OpenNext 和原生 Worker 环境）
function getD1Binding(): D1Database | null {
  // 方法 1: 通过 @opennextjs/cloudflare 的 context
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    const ctx = getCloudflareContext()
    if (ctx?.env?.DB) return ctx.env.DB
  } catch {}

  // 方法 2: 通过 globalThis 直接访问
  try {
    if ((globalThis as any).DB) return (globalThis as any).DB
  } catch {}

  return null
}

// 创建数据库连接
function createDb() {
  const d1 = getD1Binding()
  if (d1) {
    // Cloudflare Workers 环境：使用 D1
    return drizzleD1(d1, { schema })
  }

  // 本地开发环境：使用 libsql (SQLite 文件)
  const c = createClient({
    url: process.env.DATABASE_URL || 'file:./kairos.db',
  })
  return drizzleLibsql(c, { schema })
}

export const db = createDb()
export * from './schema'
