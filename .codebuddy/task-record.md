# KAIROS · 几 — 终极版任务记录

> 版本: v2.0-ULTIMATE  
> 日期: 2025-06-09 ~ 持续  
> 项目: kairos-worker (Next.js 16 + Cloudflare Workers + D1 + R2)  
> 域名: kairos.礼字号.中国  
> 目标: 不可失败的一次部署上线

---

## 一、已修复（历史记录）

### 1. 构建修复 — mock DB 导致 build 崩溃
- **文件**: `src/db/index.ts`
- **问题**: `createMockDb()` 中 `apply()` 返回 `Promise.resolve([])`, 破坏 Drizzle 链式调用
- **修复**: `apply()` 改为 `return new Proxy(() => {}, handler)`, `then` 陷阱改为 resolve 回调

### 2. 项目全面代码审查
- 完整审查了所有页面路由 (7 个)、API 端点 (20 个)、数据库层、认证、AI、实时协作
- 产出: 四阶段开发路线图 (Phase 1~4)

### 3. 构建环境故障排查
- 发现本地 `node_modules/.bin/next` 缺失
- `.npmrc` 中 `optional-dependencies=false` 可能导致 install 异常
- 本地无法构建，但 **GitHub Actions CI 构建正常** (用户提供的 CI 日志已验证)

---

## 二、终极版任务执行策略总纲

### 战略目标
```
┌─────────────────────────────────────────────────────────┐
│  从"屡次失败的手动部署" → "一次成功的自动化 CI/CD 流水线"    │
│                                                         │
│  核心指标:                                                │
│  ✅ 密钥零泄漏 (wrangler.toml 0 明文密钥)                   │
│  ✅ D1 数据库自动迁移 (push → CI 自动 migrate)              │
│  ✅ 部署零人工介入 (git push main → 自动 build + deploy)    │
│  ✅ 可回滚 (保留上一版本 Worker)                            │
│  ✅ 可验证 (部署后自动 smoke test)                          │
└─────────────────────────────────────────────────────────┘
```

### 四阶段执行路线图

```
Phase 0: 安全基座 ──── 消除硬编码密钥，加固配置
Phase 1: 数据底座 ──── D1 迁移系统，种子数据自动化
Phase 2: 流水线加固 ── CI/CD 完整闭环，缓存优化
Phase 3: 发布验证 ──── 部署后验证，监控，回滚
```

---

## 三、Phase 0: 安全基座 🛡️

### 0.1 Remove hardcoded secrets from wrangler.toml
- [x] ~~删除 `DEEPSEEK_API_KEY` 明文~~ → 由 `wrangler secret put` 管理
- [x] ~~删除 `BETTER_AUTH_SECRET` 明文~~ → 由 `wrangler secret put` 管理
- [x] ~~更新 `compatibility_date` 为最新日期~~
- [x] ~~删除 `.npmrc` 中 `optional-dependencies=false`~~

### 0.2 密钥管理体系
```bash
# 本地设置（开发者执行一次）
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put BETTER_AUTH_SECRET

# CI 设置（GitHub Secrets）
# Settings → Secrets and variables → Actions → New repository secret
# - CLOUDFLARE_API_TOKEN  (已存在)
# - DEEPSEEK_API_KEY       (新增)
# - BETTER_AUTH_SECRET      (新增)
```

### 0.3 安全验证清单
- [ ] `git grep -i "sk-"` 无结果
- [ ] `git grep -i "secret.*=" wrangler.toml` 无明文
- [ ] `wrangler secret list` 确认密钥已上传

---

## 四、Phase 1: 数据底座 🗄️

### 1.1 D1 迁移系统改造
- [x] `drizzle.config.ts` 从本地 SQLite 切换到 D1 兼容配置
- [x] 保留 `drizzle/0000_strange_zaladane.sql` 迁移文件（已存在 133 行完整 DDL）
- [x] `deploy.yml` 增加 `wrangler d1 execute` 自动迁移步骤

### 1.2 D1 迁移流程
```
开发:  修改 schema.ts → drizzle-kit generate → 生成 SQL 迁移
CI:    git push → deploy.yml → wrangler d1 execute (--remote)
线上:  D1 自动应用迁移，数据无损
```

### 1.3 种子数据
- 文件: `src/db/seed.ts` (已完整)
- 执行: `npx wrangler d1 execute kairos-db --remote --command="..."` 或通过 API 调用

---

## 五、Phase 2: 流水线加固 🔧

### 2.1 deploy.yml 终极版
```yaml
步骤:
1. Checkout + Setup Node 20
2. npm ci (带缓存)
3. D1 Migration (--remote, 仅生产环境)
4. OpenNext Build
5. Wrangler Deploy
6. Smoke Test (curl 验证)
```

### 2.2 关键改进
- [x] npm install → npm ci (确定性依赖)
- [x] 增加 D1 migration 步骤
- [x] 增加 smoke test 步骤
- [x] 增加 build cache (node_modules + .open-next)
- [x] 增加超时保护 (deploy timeout: 10min)

---

## 六、Phase 3: 发布策略 🚀

### 3.1 发布流程
```
Stage 1: 本地验证
  ├── npm ci
  ├── npm run build
  └── npx wrangler dev --remote (D1 远程测试)

Stage 2: CI 自动部署
  ├── git push main
  ├── GitHub Actions 触发
  └── 自动执行 Phase 2 全部步骤

Stage 3: 部署后验证
  ├── curl 健康检查
  ├── 页面可访问性检查
  └── D1 读写测试

Stage 4: 回滚（如需要）
  └── wrangler rollback
```

### 3.2 回滚方案
```bash
# 立即回滚到上一版本
npx wrangler rollback

# 回滚到指定版本
npx wrangler rollback <version-id>

# 查看部署历史
npx wrangler deployments list
```

### 3.3 监控指标
- Worker 错误率 < 1%
- D1 查询延迟 < 100ms
- 页面加载时间 < 3s (国内)
- R2 上传成功率 > 99%

---

## 七、关键文件索引

| 文件 | 作用 | 修改状态 |
|------|------|----------|
| `wrangler.toml` | Cloudflare Workers 部署配置 | ✅ 已修复 |
| `.github/workflows/deploy.yml` | CI/CD 部署流水线 | ✅ 已加固 |
| `src/db/index.ts` | Drizzle + D1 数据库客户端 | ✅ 已修复 |
| `src/db/schema.ts` | Drizzle 表结构定义 (10 张表) | OK |
| `src/db/seed.ts` | 种子数据脚本 | OK |
| `drizzle/0000_strange_zaladane.sql` | D1 迁移 SQL | OK |
| `drizzle.config.ts` | Drizzle Kit 配置 | ✅ 已修复 |
| `src/lib/auth.ts` | Better Auth 配置 | OK |
| `.npmrc` | npm 配置 | ✅ 已修复 |

---

## 八、部署前最终检查清单

```
[ ] wrangler.toml 无明文密钥
[ ] GitHub Secrets 已配置全部 3 个密钥
[ ] D1 数据库 kairos-db 已在 Cloudflare Dashboard 创建
[ ] R2 Bucket kairos-uploads 已在 Cloudflare Dashboard 创建
[ ] 域名 kairos.礼字号.中国 DNS 已指向 Cloudflare
[ ] compatibility_date >= 当前日期
[ ] git status 干净，所有修改已 commit
[ ] 本地 npm ci 通过
[ ] 本地 npm run build 通过
```

---

## 九、后续阶段 (MVP 上线后)

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| Phase 4 | 认证闭环 (AuthProvider + 去除硬编码 userId) | 🔴 |
| Phase 5 | 核心功能完善 (chat 重试/R2上传/广场发布/Yjs DO) | 🟡 |
| Phase 6 | 体验打磨 (SEO/骨架屏/动画/错误边界) | 🟢 |

---

## 十、经验教训与标准化操作指南

### 10.1 为什么之前会失败
| 失败点 | 根因 | 终极修复 |
|--------|------|----------|
| 密钥泄漏风险 | wrangler.toml 明文存储 | `wrangler secret put` + GitHub Secrets |
| D1 无表 | 无迁移执行步骤 | deploy.yml 增加 `wrangler d1 execute` |
| 构建不稳定 | `optional-dependencies=false` | 删除该限制 |
| 部署后不可知 | 无 smoke test | deploy.yml 增加 curl 验证 |
| 回滚困难 | 无版本管理意识 | 记录 `wrangler rollback` 命令 |
| 本地环境不一致 | npm install 非确定性 | CI 使用 `npm ci` |

### 10.2 核心原则
1. **密钥永不明文进仓库** — wrangler.toml 是公开的
2. **数据库迁移必须自动化** — 不能依赖手动执行
3. **每次部署必须可验证** — smoke test 是最后防线
4. **永远保留回滚路径** — Cloudflare Workers 自带版本管理
5. **CI 环境 = 生产环境** — npm ci 而非 npm install

---

## 十一、小白专属操作手册 📖

### 🔹 准备工作：需要你提前登录的网站

| 网站 | 作用 | 需要已经登录 |
|------|------|--------------|
| GitHub.com | 代码仓库 | ✅ 已登录 |
| Cloudflare.com | 域名 + Workers + D1 + R2 | ✅ 已登录 |
| 你的电脑终端（命令行） | 执行命令 | 👉 请打开 |

---

### 第一步：找到你的 Cloudflare Account ID

> Cloudflare 网站 → 右上角 → 你的头像 → "Account Home" → 左侧就是 Account ID → 复制保存

**详细步骤：**

1. 打开浏览器，访问 `https://dash.cloudflare.com/` （确保已登录）
2. 点击头像 → 点击 "Account Home"
3. 在页面右侧边栏找到 `Account ID` 这个文字
4. 点击那个小卡片复制 → 粘贴到记事本备用

> 💡 示例格式：`a1b2c3d4e5f6abcdef123456abcdef12`

---

### 第二步：设置本地 `wrangler` 密钥

> 在你电脑的命令行（终端）中，依次输入以下命令，每输入一个按回车

**步骤 1/3：设置 DEEPSEEK_API_KEY**
```bash
npx wrangler secret put DEEPSEEK_API_KEY
```
> 输入完后按回车，会提示你输入密钥，复制粘贴下面这串，再按回车：
```
sk-e75f3b6c471c4f979bf8dd61fd99c1da
```

**步骤 2/3：设置 BETTER_AUTH_SECRET**
```bash
npx wrangler secret put BETTER_AUTH_SECRET
```
> 输入完后按回车，会提示你输入密钥，复制粘贴下面这串，再按回车：
```
69VrLUz2YObWnY2aQWTrNLpEEvss6JJQjpyhszDSSUo=
```

**步骤 3/3：验证是否设置成功**
```bash
npx wrangler secret list
```
> 预期结果：输出会显示两行，分别是 DEEPSEEK_API_KEY 和 BETTER_AUTH_SECRET

---

### 第三步：在 GitHub 设置 Secrets

> 这个操作在浏览器里完成，点几下鼠标就行

**步骤 1/5：打开你的 GitHub 仓库页面**
```
访问：https://github.com/你的用户名/kairos-worker
```

**步骤 2/5：找到 Settings（设置）**
> 在页面顶部导航栏，从左往右数，最后一个就是 `Settings` → 点击它

**步骤 3/5：找到 Secrets and variables → Actions**
> 左侧边栏往下翻 → 找到 `Secrets and variables` → 点击展开 → 点击 `Actions`

**步骤 4/5：添加 3 个新的 Secret**

点击绿色按钮 `New repository secret`，依次添加：

| Name (第一行输入框) | Secret (第二行输入框) |
|--------------------|----------------------|
| `DEEPSEEK_API_KEY` | `sk-e75f3b6c471c4f979bf8dd61fd99c1da` |
| `BETTER_AUTH_SECRET` | `69VrLUz2YObWnY2aQWTrNLpEEvss6JJQjpyhszDSSUo=` |
| `CLOUDFLARE_ACCOUNT_ID` | **粘贴你第一步复制的 Account ID** |

> ⚠️ 每添加一个，点击 `Add secret` 按钮保存。一个一个来。

**步骤 5/5：检查结果**
> 添加完后页面上应该能看到 4 个 Secrets：
> - CLOUDFLARE_API_TOKEN （原来就有）
> - DEEPSEEK_API_KEY （刚加的）
> - BETTER_AUTH_SECRET （刚加的）
> - CLOUDFLARE_ACCOUNT_ID （刚加的）

---

### 第四步：提交代码并推送

> 回到你的命令行，依次输入以下命令：

```bash
# 查看当前修改状态
git status
```
> 预期看到以下 4 个文件标红（已修改）：
> - .github/workflows/deploy.yml
> - .codebuddy/task-record.md
> - drizzle.config.ts
> - wrangler.toml

```bash
# 将所有修改加入 git
git add -A

# 提交修改（一句话说明你干了啥）
git commit -m "fix: Phase 0-2 ultimate deployment hardening"

# 推送到 GitHub（触发自动部署）
git push origin main
```

---

### 第五步：去 GitHub 看部署进度

**步骤 1/3：打开 Actions 页面**
> GitHub 仓库页面顶部导航栏 → 点击 `Actions`

**步骤 2/3：点击最新的一次运行**
> 列表中第一个就是 `Deploy to Cloudflare Workers` → 点击它

**步骤 3/3：看日志**
> 左侧点击 `deploy` → 每一步都会显示绿色 ✅ 或红色 ❌
> 全部绿色就是成功，有红色点进去看哪里错了

---

### 第六步：部署成功后访问网站

> 打开浏览器，访问：
```
https://kairos.礼字号.中国
```
> 能正常打开页面，没有 500 错误，就是部署成功！🎉

---

### 🆘 万一失败了怎么办？一分钟回滚

打开命令行，输入：
```bash
npx wrangler rollback
```
> 一句话就回到上一个能用的版本，不会一直坏着

---

### 🔍 部署前检查清单（照着勾一遍）

```
[ ] 第一步完成：Cloudflare Account ID 已找到并复制
[ ] 第二步完成：终端已执行 npx wrangler secret put 两个命令
[ ] 第三步完成：GitHub Secrets 四个都有了
[ ] 第四步完成：git push 已执行完成
[ ] 第五步完成：GitHub Actions 全部绿色 ✅
[ ] 第六步完成：访问网站正常打开
```

### 成功标志

> GitHub Actions 运行完成后，Smoke test 那一步输出：
> `200` 表示成功！