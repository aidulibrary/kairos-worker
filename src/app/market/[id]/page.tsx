import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { TokenBadge } from '@/components/TokenBadge'

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-col flex-1 px-8 py-10 gap-8">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1
            style={{
              fontFamily: 'var(--font-chinese-heading)',
              fontSize: 'var(--text-h1)',
              fontWeight: 700,
              color: 'var(--kairo-speak)',
            }}
          >
            市集详情
          </h1>
          <div className="flex items-center gap-4">
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--kairo-whisper)',
              }}
            >
              2026年6月 · 杭州
            </span>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(232, 185, 74, 0.12)',
                border: '1px solid var(--kairo-glimmer)',
                color: 'var(--kairo-glimmer)',
                fontFamily: 'var(--font-chinese-body)',
                fontSize: '11px',
              }}
            >
              召集中
            </span>
          </div>
        </div>
        <button
          className="px-6 py-3 rounded-[var(--radius-button)] transition-all duration-200 hover:-translate-y-[2px]"
          style={{
            background:
              'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))',
            color: 'oklch(0.15 0.02 75)',
            fontFamily: 'var(--font-chinese-body)',
            fontSize: 'var(--text-body)',
            fontWeight: 600,
            boxShadow: '0 0 20px rgba(232, 185, 74, 0.2)',
          }}
        >
          我感觉到它了
        </button>
      </div>

      <WindLine />

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h2
              className="mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--kairo-speak)',
              }}
            >
              场域预览
            </h2>
            <GlassCard className="p-6 flex items-center justify-center" style={{ minHeight: 240 }}>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-32 h-20 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'var(--kairo-between)',
                    border: '2px dashed var(--kairo-emerging)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--kairo-murmur)',
                    }}
                  >
                    Stage
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{
                        background: 'var(--kairo-between)',
                        border: '1px solid var(--kairo-emerging)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          color: 'var(--kairo-murmur)',
                        }}
                      >
                        {i}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          <div>
            <h2
              className="mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--kairo-speak)',
              }}
            >
              谁将到来
            </h2>
            <div className="flex flex-col gap-2">
              <GlassCard className="p-4 flex items-center gap-4">
                <TokenBadge level="CRAFTER" size="sm" />
                <div className="flex flex-col">
                  <span
                    style={{
                      fontFamily: 'var(--font-chinese-body)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--kairo-speak)',
                    }}
                  >
                    未见摊主
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-chinese-body)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--kairo-murmur)',
                    }}
                  >
                    摊位还在等待有缘人
                  </span>
                </div>
              </GlassCard>
            </div>
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
            场域信息
          </h3>
          <WindLine />
          <div className="flex flex-col gap-3">
            {[
              { label: '摊位', value: '4 个' },
              { label: '场地', value: '杭州·西湖' },
              { label: '日期', value: '2026年6月' },
              { label: '创造者', value: '风起' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span
                  style={{
                    fontFamily: 'var(--font-chinese-body)',
                    fontSize: '13px',
                    color: 'var(--kairo-murmur)',
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-chinese-body)',
                    fontSize: '13px',
                    color: 'var(--kairo-whisper)',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}