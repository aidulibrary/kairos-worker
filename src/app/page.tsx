import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { QuickActionMenu } from '@/components/QuickActionMenu'
import PlazaPublishBtn from '@/components/PlazaPublishBtn'
import db from '@/lib/db'
import type { PlazaPost } from '@/lib/data'

// ─── Plaza Post Card ──────────────────────────────
function PostCard({ post, accent }: { post: PlazaPost; accent: string }) {
  return (
    <GlassCard className="p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-[2px]">
      <p style={{
        fontFamily: 'var(--font-chinese-body)',
        fontSize: '14px',
        color: 'var(--kairo-speak)',
        lineHeight: 1.7,
      }}>
        {post.content}
      </p>
      <div className="flex items-center justify-between">
        <span style={{
          fontFamily: 'var(--font-chinese-body)',
          fontSize: '11px',
          color: 'var(--kairo-murmur)',
        }}>
          {post.user?.name || '同行者'}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '10px',
          color: accent,
          background: `${accent}15`,
          padding: '2px 8px',
          borderRadius: '9999px',
          border: `1px solid ${accent}30`,
        }}>
          {post.type === 'WIND' ? '风信' : post.type === 'LANTERN' ? '灯火' : post.type === 'FORUM' ? '几·坛' : '相逢记'}
        </span>
      </div>
    </GlassCard>
  )
}

// ─── Plaza Page ───────────────────────────────────
export default async function PlazaPage() {
  const posts = await db.plazaPost.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } }) as unknown as PlazaPost[]

  const windPosts  = posts.filter((p: PlazaPost) => p.type === 'WIND')
  const lanternPosts = posts.filter((p: PlazaPost) => p.type === 'LANTERN')
  const forumPosts  = posts.filter((p: PlazaPost) => p.type === 'FORUM')
  const memoirPosts = posts.filter((p: PlazaPost) => p.type === 'MEMOIR')

  const markets = await db.market.findMany({ orderBy: { createdAt: 'desc' } }) as unknown as Array<{ id: string; name: string; location: string; date: string; status: string; boothCount: number; creator?: { name: string } }>
  const hasMarkets = markets.length > 0

  return (
    <div className="flex flex-col flex-1">
      {/* ── Hero ── */}
      <section
        className="flex flex-col items-center justify-center gap-6 px-8 py-16 relative overflow-hidden"
        style={{ background: 'var(--kairo-between)', minHeight: '60vh' }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, oklch(0.35 0.01 270) 0px, oklch(0.35 0.01 270) 1px, transparent 1px, transparent 40px)',
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <h1
            className="text-center"
            style={{
              fontFamily: 'var(--font-chinese-heading)',
              fontSize: 'var(--text-h0)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-approach), var(--kairo-ember))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            万物正在靠近。
          </h1>
          <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-h3)', color: 'var(--kairo-whisper)' }}>
            此刻，一些Kairos正在成形。
          </p>
        </div>

        {/* ── 成形中的市集 ── */}
        {hasMarkets && (
          <div className="relative z-10 flex gap-4 mt-8 flex-wrap justify-center">
            {markets.map((m) => (
              <a
                key={m.id}
                href={`/market/${m.id}`}
                className="flex flex-col justify-center items-center gap-3 px-6 py-8 rounded-[var(--radius-card)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg"
                style={{
                  width: 240,
                  background: 'var(--kairo-between)',
                  border: '1px solid var(--kairo-emerging)',
                }}
              >
                <div className="flex flex-col items-center gap-2" style={{ fontFamily: 'var(--font-chinese-body)' }}>
                  <span style={{ fontSize: 'var(--text-body)', color: 'var(--kairo-speak)', fontWeight: 600 }}>{m.name}</span>
                  <span style={{ fontSize: 'var(--text-small)', color: 'var(--kairo-whisper)' }}>{m.location}</span>
                  <span style={{ fontSize: '11px', color: 'var(--kairo-murmur)' }}>{m.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 800, color: 'var(--kairo-glimmer)' }}>{m.boothCount}</span>
                  <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)' }}>个信位</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ── 风信 WIND ── */}
      <section className="px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--kairo-speak)' }}>风信</h2>
            <WindLine className="flex-1 max-w-64" />
          </div>
          <PlazaPublishBtn postType="WIND" />
        </div>
        {windPosts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {windPosts.map((p) => <PostCard key={p.id} post={p} accent="var(--kairo-glimmer)" />)}
          </div>
        ) : (
          <GlassCard className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)', lineHeight: 1.7 }}>还没有风吹过来。</p>
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>当第一个Kairos成形时，风信会最先知道。</p>
          </GlassCard>
        )}
      </section>

      {/* ── 灯火 LANTERN ── */}
      <section className="px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--kairo-speak)' }}>灯火</h2>
          <WindLine className="flex-1 max-w-64" />
        </div>
        {lanternPosts.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {lanternPosts.map((p) => <div key={p.id} style={{ minWidth: 320 }}><PostCard post={p} accent="var(--kairo-arriver)" /></div>)}
          </div>
        ) : (
          <GlassCard className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)', lineHeight: 1.7 }}>还没有灯火被传下来。</p>
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>当第一个主创分享他的Kairos时，这里将被点亮。</p>
          </GlassCard>
        )}
      </section>

      {/* ── 几·坛 FORUM ── */}
      <section className="px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--kairo-speak)' }}>几·坛</h2>
            <WindLine className="max-w-48" />
          </div>
          <PlazaPublishBtn postType="FORUM" variant="gradient" />
        </div>
        {forumPosts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {forumPosts.map((p) => <PostCard key={p.id} post={p} accent="var(--kairo-facilitator)" />)}
          </div>
        ) : (
          <GlassCard className="flex items-center justify-center py-16">
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)', lineHeight: 1.7 }}>还没有人说话。当第一个问题被提出时，几·坛就活了。</p>
          </GlassCard>
        )}
      </section>

      {/* ── 相逢记 MEMOIR ── */}
      <section className="px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--kairo-speak)' }}>相逢记</h2>
          <WindLine className="flex-1 max-w-64" />
        </div>
        {memoirPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {memoirPosts.map((p) => <PostCard key={p.id} post={p} accent="var(--kairo-descender)" />)}
          </div>
        ) : (
          <GlassCard className="flex items-center justify-center py-16">
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)', lineHeight: 1.7 }}>还没有相逢被记下。</p>
          </GlassCard>
        )}
      </section>

      <QuickActionMenu />
    </div>
  )
}