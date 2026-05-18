import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'

export default function DescenderPage() {
  const hasNoNearby = true
  const hasNoHistory = true
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col items-center gap-4 px-8 py-12">
        <h1 className="text-center" style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h1)', fontWeight: 700, color: 'var(--kairo-speak)' }}>下一场Kairos，就在——</h1>
        <select className="px-4 py-2 rounded-[var(--radius-button)] cursor-pointer" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-whisper)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', outline: 'none' }}>
          <option value="">选择你的城市</option>
          <option value="北京">北京</option><option value="上海">上海</option><option value="杭州">杭州</option><option value="成都">成都</option><option value="深圳">深圳</option>
        </select>
      </div>
      <div className="px-8 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--kairo-speak)' }}>附近此刻</h2>
          <WindLine className="flex-1 max-w-48" />
        </div>
        {hasNoNearby ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h3)', color: 'var(--kairo-whisper)' }}>这附近还没有正在靠近的Kairos。</p>
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>也许它们还在暗中成形。过几天再来看看。</p>
          </div>
        ) : null}
      </div>
      <div className="px-8 pb-12">
        <div className="flex items-center gap-3 mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--kairo-speak)' }}>降临历</h2>
          <WindLine className="flex-1 max-w-48" />
        </div>
        {hasNoHistory ? (
          <GlassCard className="flex items-center justify-center py-10"><p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)' }}>你还未踏上过任何一条小径。</p></GlassCard>
        ) : null}
      </div>
    </div>
  )
}