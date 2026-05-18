import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'

export default function FacilitatorPage() {
  const hasNoServices = true
  const hasNoCases = true
  const hasNoOrders = true

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between px-8 py-10">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--kairo-between)',
              border: '2px solid var(--kairo-facilitator)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--kairo-facilitator)',
              }}
            >
              F
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1
                style={{
                  fontFamily: 'var(--font-chinese-heading)',
                  fontSize: 'var(--text-h2)',
                  fontWeight: 700,
                  color: 'var(--kairo-speak)',
                }}
              >
                助成者
              </h1>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(94, 194, 162, 0.15)',
                  border: '1px solid var(--kairo-facilitator)',
                  color: 'var(--kairo-facilitator)',
                  fontFamily: 'var(--font-chinese-body)',
                  fontSize: '10px',
                }}
              >
                已验证
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ color: i <= 4 ? 'var(--kairo-glimmer)' : 'var(--kairo-emerging)', fontSize: '14px' }}>
                  ★
                </span>
              ))}
              <span
                style={{
                  fontFamily: 'var(--font-chinese-body)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--kairo-whisper)',
                  marginLeft: '4px',
                }}
              >
                4.0
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-chinese-body)',
                fontSize: 'var(--text-small)',
                color: 'var(--kairo-whisper)',
              }}
            >
              你的手艺，是Kairos的骨骼。
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 px-8 pb-6" style={{ gap: 'var(--space-breath)' }}>
        <div className="flex flex-col flex-1 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-h3)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--kairo-speak)',
                }}
              >
                服务清单
              </h2>
              <button
                className="px-3 py-1 rounded-[var(--radius-button)] transition-all duration-200"
                style={{
                  background:
                    'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))',
                  color: 'oklch(0.15 0.02 75)',
                  fontFamily: 'var(--font-chinese-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                添加服务
              </button>
            </div>

            {hasNoServices ? (
              <GlassCard className="flex items-center justify-center py-12">
                <p
                  style={{
                    fontFamily: 'var(--font-chinese-body)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--kairo-murmur)',
                  }}
                >
                  你还没有写下你能做什么。
                </p>
              </GlassCard>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h3)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--kairo-speak)',
              }}
            >
              合作案例
            </h2>
            {hasNoCases ? (
              <GlassCard className="flex items-center justify-center py-12">
                <p
                  style={{
                    fontFamily: 'var(--font-chinese-body)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--kairo-murmur)',
                  }}
                >
                  还没有合作记录。
                </p>
              </GlassCard>
            ) : null}
          </div>
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
            接单记录
          </h3>
          <WindLine />
          {hasNoOrders ? (
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
                还没有新的合作请求。
              </p>
            </div>
          ) : null}
        </GlassCard>
      </div>
    </div>
  )
}