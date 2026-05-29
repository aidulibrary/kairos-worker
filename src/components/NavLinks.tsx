'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessagesSquare, PenLine, Store, Compass, Wrench } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: typeof MessagesSquare
}

const navItems: NavItem[] = [
  { href: '/', label: '广场', icon: MessagesSquare },
  { href: '/creator', label: '主创室', icon: PenLine },
  { href: '/arriver', label: '主理坊', icon: Store },
  { href: '/descender', label: '赶集径', icon: Compass },
  { href: '/facilitator', label: '共建廊', icon: Wrench },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex items-center gap-1.5 px-3 py-2 group"
          >
            <Icon
              size={16}
              className="transition-colors duration-200"
              style={{
                color: isActive
                  ? 'var(--kairo-glimmer)'
                  : 'var(--kairo-whisper)',
              }}
            />
            <span
              className="text-[13px] transition-colors duration-200"
              style={{
                color: isActive
                  ? 'var(--kairo-glimmer)'
                  : 'var(--kairo-whisper)',
                fontFamily: 'var(--font-chinese-body)',
              }}
            >
              {item.label}
            </span>
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-[60%] rounded-full transition-all duration-200"
              style={{
                background: isActive
                  ? 'var(--kairo-glimmer)'
                  : 'transparent',
                opacity: isActive ? 1 : 0,
              }}
            />
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-[60%] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{
                background:
                  'linear-gradient(90deg, transparent, var(--kairo-glimmer), transparent)',
              }}
            />
          </Link>
        )
      })}
    </nav>
  )
}