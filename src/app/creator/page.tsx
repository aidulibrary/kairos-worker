import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { TokenBadge } from '@/components/TokenBadge'
import { PerceiverChat } from '@/components/PerceiverChat'
import db from '@/lib/db'
import type { Market } from '@/lib/data'

export default async function CreatorPage() {
  const markets = await db.market.findMany({
    where: { status: { in: ['draft', 'published'] } },
    include: { creator: true, booths: { include: { vendor: { include: { user: true } } } } },
    orderBy: { createdAt: 'desc' },
  }) as unknown as Market[]

  const invitations = markets.flatMap(m =>
    (m.booths || []).filter(b => b.status === 'reserved').map(b => ({ ...b, marketName: m.name }))
  )

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-start justify-between px-8 py-10" style={{ gap: 'var(--space-breath)' }}>
        <div className="flex flex-col gap-2">
          <h1 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--kairo-speak)' }}>
            欢迎回来，创造者
          </h1>
          <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)' }}>
            万物正在等待你的召唤。
          </p>
        </div>
        <TokenBadge level="FLAMEKEEPER" size="md" />
      </div>

      <div className="flex flex-1 px-8" style={{ gap: 'var(--space-breath)' }}>
        <div className="flex flex-col flex-1 gap-4 pb-6" style={{ maxWidth: 'calc(100% - 296px)' }}>
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--kairo-speak)' }}>
              我的市集
            </h2>
            <WindLine className="flex-1 max-w-48" />
          </div>

          {markets.length > 0 ? (
            <div className="flex flex-col gap-3">
              {markets.map((m) => {
                const occupied = (m.booths || []).filter(b => b.status === 'occupied').length
                const total = m.boothCount
                return (
                  <a key={m.id} href={`/market/${m.id}`}>
                    <GlassCard className="p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-[2px]">
                      <div className="flex flex-col flex-1 gap-1">
                        <span style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--kairo-speak)' }}>{m.name}</span>
                        <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-whisper)' }}>{m.location} · {m.date}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 800, color: 'var(--kairo-glimmer)' }}>{occupied}/{total}</span>
                        <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)' }}>信位已驻</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full" style={{
                        background: m.status === 'published' ? 'rgba(94,194,162,0.12)' : 'rgba(232,185,74,0.12)',
                        border: `1px solid ${m.status === 'published' ? 'var(--kairo-facilitator)' : 'var(--kairo-glimmer)'}`,
                        color: m.status === 'published' ? 'var(--kairo-facilitator)' : 'var(--kairo-glimmer)',
                        fontFamily: 'var(--font-chinese-body)', fontSize: '11px',
                      }}>
                        {m.status === 'published' ? '已发布' : '成形中'}
                      </span>
                    </GlassCard>
                  </a>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4">
              <p className="text-center" style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h3)', color: 'var(--kairo-whisper)' }}>你还没有创造过Kairos。</p>
              <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>当你准备好时，感觉者会在这里等你。</p>
            </div>
          )}
        </div>

        <GlassCard className="flex flex-col gap-4 p-5 shrink-0" style={{ width: 280 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--kairo-speak)' }}>召集记录</h3>
          <WindLine />
          {invitations.length > 0 ? (
            <div className="flex flex-col gap-2">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--kairo-between)' }}>
                  <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-speak)' }}>{inv.vendor?.user?.name || '同行者'}</span>
                  <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '10px', color: 'var(--kairo-murmur)' }}>{inv.number}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
              <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>还没有发出过召唤。</p>
            </div>
          )}
        </GlassCard>
      </div>

      <PerceiverChat identity="CREATOR" />
    </div>
  )
}
