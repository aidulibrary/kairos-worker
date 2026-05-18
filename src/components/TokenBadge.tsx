interface TokenBadgeProps {
  level: 'WANDERER' | 'WALKER' | 'CRAFTER' | 'MASTER' | 'FLAMEKEEPER'
  size?: 'sm' | 'md' | 'lg'
}

const levelConfig: Record<string, { label: string; color: string; fill: string; glow: boolean; ring: boolean }> = {
  WANDERER: { label: '旅人', color: 'var(--kairo-whisper)', fill: 'none', glow: false, ring: false },
  WALKER: { label: '行者', color: 'var(--kairo-speak)', fill: 'rgba(242, 242, 242, 0.3)', glow: false, ring: false },
  CRAFTER: { label: '匠者', color: 'var(--kairo-glimmer)', fill: 'rgba(232, 185, 74, 0.4)', glow: false, ring: false },
  MASTER: { label: '师者', color: 'var(--kairo-glimmer)', fill: 'rgba(232, 185, 74, 0.6)', glow: true, ring: false },
  FLAMEKEEPER: { label: '薪者', color: 'var(--kairo-glimmer)', fill: 'rgba(232, 185, 74, 0.85)', glow: true, ring: true },
}

const sizeMap: Record<string, number> = { sm: 24, md: 36, lg: 48 }

export function TokenBadge({ level, size = 'md' }: TokenBadgeProps) {
  const px = sizeMap[size]
  const config = levelConfig[level]
  const strokeW = size === 'sm' ? 1.5 : 2

  return (
    <div className="relative inline-flex flex-col items-center gap-0.5 group">
      <svg width={px} height={px} viewBox="0 0 48 48" fill="none" className={config.glow ? 'drop-shadow-[0_0_8px_var(--kairo-glimmer)]' : ''}>
        {config.ring && <circle cx="24" cy="24" r="22" stroke="var(--kairo-glimmer)" strokeWidth="0.5" strokeDasharray="3 3" fill="none" opacity="0.4" />}
        <path d="M 26 6 C 18 10, 10 18, 8 40" stroke={config.color} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
        <path d="M 14 8 H 40 C 41 22, 36 34, 30 38" stroke={config.color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill={config.fill} />
        <circle cx="22" cy="20" r={size === 'sm' ? 2 : 2.5} fill={config.color} opacity={level === 'FLAMEKEEPER' ? 1 : level === 'WANDERER' ? 0.4 : 0.7} />
      </svg>
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-chinese-body)', color: config.color }}>{config.label}</span>
      </span>
    </div>
  )
}