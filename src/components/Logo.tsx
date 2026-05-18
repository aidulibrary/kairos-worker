interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizeMap: Record<string, number> = {
  sm: 24,
  md: 40,
  lg: 64,
  xl: 96,
}

export function Logo({ size = 'md', showText = false }: LogoProps) {
  const px = sizeMap[size]

  if (size === 'sm') {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg
          width={px}
          height={px}
          viewBox="0 0 32 32"
          fill="none"
          aria-label="几之门"
        >
          <path
            d="M 18 4 L 6 22"
            stroke="var(--kairo-glimmer)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 10 8 L 26 6 L 24 20 L 16 26"
            stroke="var(--kairo-glimmer)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="14" r="1.5" fill="var(--kairo-glimmer)" opacity="0.7" />
        </svg>
        {showText && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '8px',
              letterSpacing: '0.12em',
              color: 'var(--kairo-glimmer)',
            }}
          >
            KAIROS
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={px}
        height={px}
        viewBox="0 0 64 64"
        fill="none"
        aria-label="几之门"
      >
        <defs>
          <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--kairo-approach)" />
            <stop offset="100%" stopColor="var(--kairo-glimmer)" />
          </linearGradient>
        </defs>
        <path
          d="M 36 8 C 24 14, 14 24, 12 52"
          stroke="url(#windGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 20 12 H 52 C 54 30, 48 44, 40 50"
          stroke="url(#windGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle
          cx="30"
          cy="28"
          r="2.5"
          fill="var(--kairo-glimmer)"
          opacity="0.85"
        />
      </svg>
      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: size === 'md' ? '10px' : size === 'lg' ? '13px' : '16px',
            letterSpacing: '0.12em',
            color: 'var(--kairo-glimmer)',
            textTransform: 'uppercase',
          }}
        >
          KAIROS
        </span>
      )}
    </div>
  )
}