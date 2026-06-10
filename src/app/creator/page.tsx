'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { TokenBadge } from '@/components/TokenBadge'
import { PerceiverChat } from '@/components/PerceiverChat'
import { Plus, X, Edit3, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/session'

interface Market {
  id: string; name: string; location: string; date: string
  boothCount: number; description?: string | null
  status: string; creatorId: string
  booths?: { id: string; status: string; number: string; vendor?: { user?: { name?: string } | null } | null }[]
}

export default function CreatorPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [markets, setMarkets] = useState<Market[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Market | null>(null)
  const [form, setForm] = useState({ name: '', location: '', date: '', boothCount: 4, description: '' })
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const res = await fetch('/api/creator/markets')
    if (res.ok) setMarkets(await res.json())
  }

  useEffect(() => { load() }, [])

  if (authLoading) return <div className="flex flex-col items-center justify-center flex-1"><p style={{ fontFamily: 'var(--font-chinese-body)', color: 'var(--kairo-whisper)' }}>正在感知...</p></div>
  if (!user) { router.push('/auth'); return null }

  const openCreate = () => { setEditing(null); setForm({ name: '', location: '', date: '', boothCount: 4, description: '' }); setShowForm(true) }
  const openEdit = (m: Market) => { setEditing(m); setForm({ name: m.name, location: m.location, date: m.date, boothCount: m.boothCount, description: m.description || '' }); setShowForm(true) }

  const submit = async () => {
    if (!form.name || !form.location || !form.date) return
    setLoading(true)
    if (editing) {
      await fetch(`/api/creator/markets`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...form }),
      })
    } else {
      await fetch('/api/creator/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setShowForm(false); setEditing(null); await load(); setLoading(false)
  }

  const toggleStatus = async (m: Market) => {
    const newStatus = m.status === 'published' ? 'draft' : 'published'
    await fetch(`/api/creator/markets`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, status: newStatus }),
    })
    await load()
  }

  const deleteMarket = async (id: string) => {
    if (!confirm('确定要删除这个市集吗？')) return
    await fetch(`/api/creator/markets?id=${id}`, { method: 'DELETE' })
    await load()
  }

  const invitations = markets.flatMap(m =>
    (m.booths || []).filter(b => b.status === 'reserved').map(b => ({ ...b, marketName: m.name }))
  )

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-start justify-between px-8 py-10" style={{ gap: 'var(--space-breath)' }}>
        <div className="flex flex-col gap-2">
          <h1 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--kairo-speak)' }}>
            欢迎回来，主创
          </h1>
          <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)' }}>
            万物正在等待你的召唤。
          </p>
        </div>
        <TokenBadge level="FLAMEKEEPER" size="md" />
      </div>

      <div className="flex flex-1 px-8" style={{ gap: 'var(--space-breath)' }}>
        <div className="flex flex-col flex-1 gap-4 pb-6" style={{ maxWidth: 'calc(100% - 296px)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--kairo-speak)' }}>
                我的市集
              </h2>
              <WindLine className="flex-1 max-w-48" />
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-button)] transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))', color: 'oklch(0.15 0.02 75)', fontFamily: 'var(--font-chinese-body)', fontSize: '13px', fontWeight: 600 }}
            >
              <Plus size={16} /> 创建市集
            </button>
          </div>

          {markets.length > 0 ? (
            <div className="flex flex-col gap-3">
              {markets.map((m) => {
                const occupied = (m.booths || []).filter(b => b.status === 'occupied').length
                return (
                  <div key={m.id} className="group relative">
                    <a href={`/market/${m.id}`} className="block">
                      <GlassCard className="p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-[2px]">
                        <div className="flex flex-col flex-1 gap-1">
                          <span style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--kairo-speak)' }}>{m.name}</span>
                          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-whisper)' }}>{m.location} · {m.date}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 800, color: 'var(--kairo-glimmer)' }}>{occupied}/{m.boothCount}</span>
                          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)' }}>信位已驻</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full" style={{
                          background: m.status === 'published' ? 'rgba(94,194,162,0.12)' : 'rgba(232,185,74,0.12)',
                          border: `1px solid ${m.status === 'published' ? 'var(--kairo-facilitator)' : 'var(--kairo-glimmer)'}`,
                          color: m.status === 'published' ? 'var(--kairo-facilitator)' : 'var(--kairo-glimmer)',
                          fontFamily: 'var(--font-chinese-body)', fontSize: '11px',
                        }}>
                          {m.status === 'published' ? '已发布' : '成形中'}
                        </span>
                      </GlassCard>
                    </a>
                    {/* 操作按钮 */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={(e) => { e.preventDefault(); openEdit(m) }} className="p-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.1)' }} title="编辑">
                        <Edit3 size={14} style={{ color: 'var(--kairo-glimmer)' }} />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); toggleStatus(m) }} className="p-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.1)' }} title={m.status === 'published' ? '撤回' : '发布'}>
                        <span style={{ fontSize: '11px', color: 'var(--kairo-facilitator)', fontFamily: 'var(--font-chinese-body)' }}>{m.status === 'published' ? '↓' : '↑'}</span>
                      </button>
                      <button onClick={(e) => { e.preventDefault(); deleteMarket(m.id) }} className="p-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.1)' }} title="删除">
                        <Trash2 size={14} style={{ color: 'var(--kairo-ember)' }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4">
              <p className="text-center" style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h3)', color: 'var(--kairo-whisper)' }}>你还没有创造过Kairos。</p>
              <button onClick={openCreate} style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-glimmer)', textDecoration: 'underline' }}>
                点击这里，清出第一个场域。
              </button>
            </div>
          )}
        </div>

        <GlassCard className="flex flex-col gap-4 p-5 shrink-0" style={{ width: 280 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--kairo-speak)' }}>召集记录</h3>
          <WindLine />
          {invitations.length > 0 ? (
            <div className="flex flex-col gap-2">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--kairo-between)' }}>
                  <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-speak)' }}>{inv.vendor?.user?.name || '同行者'}</span>
                  <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '10px', color: 'var(--kairo-murmur)' }}>{inv.number}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
              <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>还没有发出过召唤。</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* 创建/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowForm(false)}>
          <GlassCard className="p-6 flex flex-col gap-4" style={{ width: 420 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--kairo-speak)' }}>{editing ? '编辑市集' : '创建市集'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} style={{ color: 'var(--kairo-whisper)' }} /></button>
            </div>
            <WindLine />
            {(['name', 'location', 'date'] as const).map((field) => (
              <div key={field} className="flex flex-col gap-1">
                <label style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-whisper)' }}>
                  {field === 'name' ? '市集名称' : field === 'location' ? '地点' : '日期'}
                </label>
                <input
                  type={field === 'date' ? 'date' : 'text'}
                  value={(form as any)[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="px-3 py-2 rounded-md outline-none"
                  style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}
                  placeholder={field === 'name' ? '如：风的第一次成形' : field === 'location' ? '如：北京·胡同深处' : ''}
                />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-whisper)' }}>摊位数量</label>
              <input type="number" min={1} max={50} value={form.boothCount}
                onChange={(e) => setForm({ ...form, boothCount: parseInt(e.target.value) || 4 })}
                className="px-3 py-2 rounded-md outline-none w-24"
                style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-whisper)' }}>描述</label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="px-3 py-2 rounded-md outline-none resize-none"
                style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}
              />
            </div>
            <button
              onClick={submit}
              disabled={loading}
              className="py-3 rounded-[var(--radius-button)] transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))', color: 'oklch(0.15 0.02 75)', fontFamily: 'var(--font-chinese-body)', fontSize: '15px', fontWeight: 600, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '正在成形……' : editing ? '保存修改' : '清出场域'}
            </button>
          </GlassCard>
        </div>
      )}

      <PerceiverChat identity="CREATOR" />
    </div>
  )
}