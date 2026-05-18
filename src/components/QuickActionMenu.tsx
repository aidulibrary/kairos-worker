'use client'

import { useState, useRef, useEffect } from 'react'
import { PenLine } from 'lucide-react'
import { useRouter } from 'next/navigation'

const menuItems = [
  { label: '开启一个新的Kairos', href: '/creator' },
  { label: '更新我的信物', href: '/arriver' },
  { label: '发现附近', href: '/descender' },
  { label: '展示服务', href: '/facilitator' },
]

export function QuickActionMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 50 }}>
      {open && (
        <div className="flex flex-col gap-1 mb-3" style={{ animation: 'kairos-approach 0.25s ease' }}>
          {menuItems.map((item) => (
            <button key={item.href} onClick={() => { setOpen(false); router.push(item.href) }}
              className="px-4 py-2.5 text-left rounded-[var(--radius-button)] transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.10)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', whiteSpace: 'nowrap' }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-center transition-all duration-200"
        style={{ width: 56, height: 56, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))', boxShadow: '0 0 20px rgba(232,185,74,0.25)', border: 'none', cursor: 'pointer' }}>
        <PenLine size={22} color="oklch(0.15 0.02 75)" />
      </button>
    </div>
  )
}