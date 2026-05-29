// @ts-nocheck
// Drizzle ORM 数据库客户端
// 开发: SQLite 本地文件
// 生产: Cloudflare D1

import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

function createDb() {
  // Cloudflare Workers: 使用 D1 绑定
  if (typeof process !== 'undefined' && (process as any).env?.DB) {
    const { drizzle } = require('drizzle-orm/d1')
    return drizzle((process as any).env.DB, { schema })
  }

  // 本地开发: SQLite 文件
  const c = createClient({
    url: process.env.DATABASE_URL || 'file:./kairos.db',
  })
  return drizzleLibsql(c, { schema })
}

export const db = createDb()
export * from './schema'
