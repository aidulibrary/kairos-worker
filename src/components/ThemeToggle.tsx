'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('kairos-theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('kairos-theme', next)
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // Apply on mount
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-md transition-colors"
      style={{ background: 'var(--kairo-between)' }}
      title={theme === 'dark' ? '切换到浅色' : '切换到深色'}
    >
      {theme === 'dark'
        ? <Sun size={14} style={{ color: 'var(--kairo-glimmer)' }} />
        : <Moon size={14} style={{ color: 'var(--kairo-speak)' }} />
      }
    </button>
  )
}
