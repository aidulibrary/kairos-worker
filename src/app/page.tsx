import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { QuickActionMenu } from '@/components/QuickActionMenu'

const hasNoWind = true
const hasNoLanterns = true
const hasNoForum = true
const hasNoMemoirs = true

export default function PlazaPage() {
  return (
    <div className="flex flex-col flex-1">
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
              animation: 'kairos-approach 0.8s ease',
            }}
          >
            万物正在靠近。
          </h1>
          <p
            className="text-center"
            style={{
              fontFamily: 'var(--font-chinese-body)',
              fontSize: 'var(--text-h3)',
              color: 'var(--kairo-whisper)',
            }}
          >
            此刻，一些Kairos正在成形。
          </p>
        </div>

        <div className="relative z-10 flex gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-center items-center gap-3 px-6 py-8 rounded-[var(--radius-card)]"
              style={{
                width: 240,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-chinese-heading)',
                  fontSize: 'var(--text-h3)',
                  color: 'var(--kairo-murmur)',
                }}
              >
                等待中
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-chinese-body)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--kairo-murmur)',
                }}
              >
                第一个Kairos
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2
            style={{
              fontFamily: 'var(--font-chinese-heading)',
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              color: 'var(--kairo-speak)',
            }}
          >
            风信
          </h2>
          <WindLine className="flex-1 max-w-64" />
        </div>

        {hasNoWind ? (
          <GlassCard className="flex flex-col items-center justify-center py-16 gap-3">
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-chinese-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--kairo-whisper)',
                lineHeight: 1.7,
              }}
            >
              还没有风吹过来。
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
              当第一个Kairos成形时，风信会最先知道。
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-2 gap-4">{}</div>
        )}
      </section>

      <section className="px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2
            style={{
              fontFamily: 'var(--font-chinese-heading)',
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              color: 'var(--kairo-speak)',
            }}
          >
            灯火
          </h2>
          <WindLine className="flex-1 max-w-64" />
        </div>

        {hasNoLanterns ? (
          <GlassCard className="flex flex-col items-center justify-center py-16 gap-3">
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-chinese-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--kairo-whisper)',
                lineHeight: 1.7,
              }}
            >
              还没有灯火被传下来。
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
              当第一个创造者分享他的Kairos时，这里将被点亮。
            </p>
          </GlassCard>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {}
          </div>
        )}
      </section>

      <section className="px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2
              style={{
                fontFamily: 'var(--font-chinese-heading)',
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                color: 'var(--kairo-speak)',
              }}
            >
              几·坛
            </h2>
            <WindLine className="max-w-48" />
          </div>
          <button
            className="px-4 py-2 rounded-[var(--radius-button)] transition-all duration-200 hover:-translate-y-[1px]"
            style={{
              background: 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))',
              color: 'oklch(0.15 0.02 75)',
              fontFamily: 'var(--font-chinese-body)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            发起讨论
          </button>
        </div>

        {hasNoForum ? (
          <GlassCard className="flex items-center justify-center py-16">
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-chinese-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--kairo-whisper)',
                lineHeight: 1.7,
              }}
            >
              还没有人说话。当第一个问题被提出时，几·坛就活了。
            </p>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-3">{}</div>
        )}
      </section>

      <section className="px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2
            style={{
              fontFamily: 'var(--font-chinese-heading)',
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              color: 'var(--kairo-speak)',
            }}
          >
            相逢记
          </h2>
          <WindLine className="flex-1 max-w-64" />
        </div>

        {hasNoMemoirs ? (
          <GlassCard className="flex items-center justify-center py-16">
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-chinese-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--kairo-whisper)',
                lineHeight: 1.7,
              }}
            >
              还没有相逢被记下。
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-3 gap-4">{}</div>
        )}
      </section>

      <QuickActionMenu />
    </div>
  )
}