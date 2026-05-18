interface WindLineProps {
  className?: string
}

export function WindLine({ className = '' }: WindLineProps) {
  return (
    <div
      className={`h-[2px] mx-auto ${className}`}
      style={{
        width: '80%',
        background:
          'linear-gradient(90deg, transparent, var(--kairo-glimmer) 20%, var(--kairo-glimmer) 80%, transparent)',
        borderRadius: 'var(--radius-full)',
      }}
    />
  )
}