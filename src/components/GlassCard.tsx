import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 'var(--radius-card)',
        boxShadow:
          '0 0 0 1px rgba(255, 255, 255, 0.03), 0 2px 4px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.18)',
      }}
    >
      {children}
    </div>
  )
}