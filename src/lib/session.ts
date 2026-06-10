'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  id: string
  phone: string | null
  name: string
  identity: string
  tokenLevel: string
  tokenScore: number
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user || null)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
    setLoading(false)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
      window.location.href = '/'
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useUserId(): string | null {
  const { user } = useAuth()
  return user?.id || null
}

export function useRequireAuth(): string {
  const { user } = useAuth()
  if (!user) throw new Error('Requires authenticated user')
  return user.id
}