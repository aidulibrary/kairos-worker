interface TokenDetailProps {
  score: number
  level: string
  expoCount: number
  goodRate: number
}

export function TokenDetail({ score, level, expoCount, goodRate }: TokenDetailProps) {
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (score / 100) * circumference
  const arcColor = score < 40 ? 'var(--kairo-descender)' : score < 70 ? 'var(--kairo-glimmer)' : 'var(--kairo-facilitator)'
  const levels = ['WANDERER', 'WALKER', 'CRAFTER', 'MASTER', 'FLAMEKEEPER']
  const currentIndex = levels.indexOf(level)
  return (
    <div className="flex flex-col gap-4 p-5" style={{ minWidth: 280 }}>
      <div className="flex items-center gap-5">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--kairo-between)" strokeWidth="6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={arcColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          <text x="50" y="46" textAnchor="middle" fill="var(--kairo-speak)" fontSize="20" fontFamily="var(--font-mono)" fontWeight="600">{score}</text>
          <text x="50" y="62" textAnchor="middle" fill="var(--kairo-whisper)" fontSize="10" fontFamily="var(--font-chinese-body)">信物分</text>
        </svg>
        <div className="flex flex-col gap-1.5">
          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-whisper)' }}>参展 {expoCount} 次</span>
          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-whisper)' }}>好评 {(goodRate * 100).toFixed(0)}%</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)' }}>评级之路</span>
        <div className="flex gap-1">
          {levels.map((l, i) => { const isDone = i <= currentIndex; return <div key={l} className="flex-1 h-1 rounded-full transition-colors duration-300" style={{ background: isDone ? 'var(--kairo-glimmer)' : 'var(--kairo-between)' }} /> })}
        </div>
        <div className="flex justify-between">
          {levels.map((l) => <span key={l} style={{ fontSize: '9px', fontFamily: 'var(--font-chinese-body)', color: l === level ? 'var(--kairo-glimmer)' : 'var(--kairo-murmur)' }}>{['旅人','行者','匠者','师者','薪者'][levels.indexOf(l)]}</span>)}
        </div>
      </div>
    </div>
  )
}