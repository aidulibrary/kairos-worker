import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

/* ── Better Auth 核心用户表 ── */
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})

/* ── Better Auth 会话 ── */
export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id),
  token: text('token').notNull().unique(),
  expiresAt: text('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})

/* ── Better Auth 账户 ── */
export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: text('expiresAt'),
  password: text('password'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})

/* ── Better Auth 验证 ── */
export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: text('expiresAt').notNull(),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
})

/* ── KAIROS 用户（兼容旧 db-json） ── */
export const users = sqliteTable('KairosUser', {
  id: text('id').primaryKey(),
  phone: text('phone').unique(),
  name: text('name').notNull(),
  identity: text('identity').notNull().default('DESCENDER'),
  tokenLevel: text('tokenLevel').notNull().default('WANDERER'),
  tokenScore: integer('tokenScore').notNull().default(0),
  verifiedAt: text('verifiedAt'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})

/* ── 摊主档案 ── */
export const vendors = sqliteTable('Vendor', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => users.id),
  category: text('category').notNull(),
  style: text('style'),
  priceRange: text('priceRange'),
  city: text('city'),
  description: text('description'),
  logo: text('logo'),
  creditScore: integer('creditScore').notNull().default(60),
  expoCount: integer('expoCount').notNull().default(0),
  goodRate: real('goodRate').notNull().default(0.8),
  violations: integer('violations').notNull().default(0),
  complaints: integer('complaints').notNull().default(0),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})

/* ── 共建人服务 ── */
export const services = sqliteTable('Service', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => users.id),
  category: text('category').notNull(),
  description: text('description'),
  credentialUrl: text('credentialUrl'),
  projectCount: integer('projectCount').notNull().default(0),
  rating: real('rating').notNull().default(0),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})

/* ── 市集 ── */
export const markets = sqliteTable('Market', {
  id: text('id').primaryKey(),
  creatorId: text('creatorId').notNull().references(() => users.id),
  name: text('name').notNull(),
  location: text('location').notNull(),
  date: text('date').notNull(),
  boothCount: integer('boothCount').notNull(),
  description: text('description'),
  layout: text('layout'),
  status: text('status').notNull().default('draft'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})

/* ── 摊位 ── */
export const booths = sqliteTable('Booth', {
  id: text('id').primaryKey(),
  marketId: text('marketId').notNull().references(() => markets.id),
  vendorId: text('vendorId').references(() => vendors.id),
  number: text('number').notNull(),
  positionX: real('positionX').notNull(),
  positionY: real('positionY').notNull(),
  width: real('width').notNull(),
  height: real('height').notNull(),
  hasPower: integer('hasPower', { mode: 'boolean' }).notNull().default(false),
  status: text('status').notNull().default('available'),
})

/* ── 广场帖子 ── */
export const plazaPosts = sqliteTable('PlazaPost', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id),
  type: text('type').notNull(),
  content: text('content').notNull(),
  relatedMarketId: text('relatedMarketId'),
  createdAt: text('createdAt').notNull(),
})

/* ── 对话历史 ── */
export const conversations = sqliteTable('Conversation', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id),
  title: text('title'),
  messages: text('messages').notNull(),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
})
