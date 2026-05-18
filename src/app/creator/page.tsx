import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { TokenBadge } from '@/components/TokenBadge'
import { PerceiverChat } from '@/components/PerceiverChat'

export default function CreatorPage() {
  const hasNoMarkets = true

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-start justify-between px-8 py-10" style={{ gap: 'var(--space-breath)' }}>
        <div className="flex flex-col gap-2">
          <h1
            style={{
              fontFamily: 'var(--font-chinese-heading)',
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              color: 'var(--kairo-speak)',
            }}
          >
            欢迎回来，创造者
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-chinese-body)',
              fontSize: 'var(--text-body)',
              color: 'var(--kairo-whisper)',
            }}
          >
            万物正在等待你的召唤。
          </p>
        </div>
        <TokenBadge level="CRAFTER" size="md" />
      </div>

      <div className="flex flex-1 px-8" style={{ gap: 'var(--space-breath)' }}>
        <div className="flex flex-col flex-1 gap-4 pb-6" style={{ maxWidth: 'calc(100% - 296px)' }}>
          <div className="flex items-center gap-3">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h3)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--kairo-speak)',
              }}
            >
              我的市集
            </h2>
            <WindLine className="flex-1 max-w-48" />
          </div>

          {hasNoMarkets ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4">
              <p
                className="text-center"
                style={{
                  fontFamily: 'var(--font-chinese-heading)',
                  fontSize: 'var(--text-h3)',
                  color: 'var(--kairo-whisper)',
                }}
              >
                你还没有创造过Kairos。
              </p>
              <p
                className="text-center"
                style={{
                  fontFamily: 'var(--font-chinese-body)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--kairo-murmur)',
                  lineHeight: 1.6,
                }}
              >
                当你准备好时，感觉者会在这里等你。
              </p>
            </div>
          ) : null}
        </div>

        <GlassCard className="flex flex-col gap-4 p-5 shrink-0" style={{ width: 280 }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--kairo-speak)',
            }}
          >
            召集记录
          </h3>
          <WindLine />
          <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-chinese-body)',
                fontSize: 'var(--text-small)',
                color: 'var(--kairo-murmur)',
                lineHeight: 1.6,
              }}
            >
              还没有发出过召唤。
            </p>
          </div>
        </GlassCard>
      </div>

      <PerceiverChat identity="CREATOR" />
    </div>
  )
}