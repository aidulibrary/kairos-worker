'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { PerceiverChat } from '@/components/PerceiverChat'
import { Edit3, Star } from 'lucide-react'
import { useAuth } from '@/lib/session'

export default function FacilitatorPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [services, setServices] = useState<any[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ description: '', category: '' })

  const load = async () => {
    if (!user) return
    const res = await fetch('/api/facilitator/profile')
    if (res.ok) setServices([await res.json()])
  }

  useEffect(() => { load() }, [user])

  if (loading) return <div className="flex flex-col items-center justify-center flex-1"><p style={{ fontFamily: 'var(--font-chinese-body)', color: 'var(--kairo-whisper)' }}>正在感知...</p></div>
  if (!user) { router.push('/auth'); return null }

  const startEdit = (s: any) => {
    setEditing(s.id)
    setForm({ description: s.description || '', category: s.category || '' })
  }

  const saveEdit = async () => {
    await fetch('/api/facilitator/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: editing, ...form }),
    })
    setEditing(null)
    await load()
  }

  const s = services[0]

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between px-8 py-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--kairo-between)', border: '2px solid var(--kairo-facilitator)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--kairo-facilitator)' }}>F</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--kairo-speak)' }}>共建人</h1>
              <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(94, 194, 162, 0.15)', border: '1px solid var(--kairo-facilitator)', color: 'var(--kairo-facilitator)', fontFamily: 'var(--font-chinese-body)', fontSize: '10px' }}>已验证</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} style={{ color: i <= 4 ? 'var(--kairo-glimmer)' : 'var(--kairo-emerging)', fill: i <= 4 ? 'var(--kairo-glimmer)' : 'none' }} />
              ))}
            </div>
            <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-whisper)' }}>
              {s?.user?.name || '共建人'} · {s?.projectCount || 0} 场完成
            </p>
          </div>
        </div>
        <button onClick={() => s && startEdit(s)} className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-button)] transition-all" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-whisper)', fontFamily: 'var(--font-chinese-body)', fontSize: '13px' }}>
          <Edit3 size={13} /> 编辑资料
        </button>
      </div>

      <div className="flex-1 px-8 pb-6" style={{ gap: 'var(--space-breath)' }}>
        {editing ? (
          <GlassCard className="p-5 flex flex-col gap-3 mb-6">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--kairo-speak)' }}>编辑服务</h3>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 rounded-md outline-none" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}
              placeholder="服务类别 (如：影像记录、空间设计)"
            />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="px-3 py-2 rounded-md outline-none resize-none" rows={3}
              style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}
              placeholder="服务描述..."
            />
            <div className="flex gap-2">
              <button onClick={saveEdit} className="px-4 py-2 rounded-md" style={{ background: 'var(--kairo-glimmer)', color: '#1a1a1a', fontFamily: 'var(--font-chinese-body)', fontSize: '13px', fontWeight: 600 }}>保存</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md" style={{ background: 'var(--kairo-between)', color: 'var(--kairo-whisper)', fontFamily: 'var(--font-chinese-body)', fontSize: '13px' }}>取消</button>
            </div>
          </GlassCard>
        ) : null}

        {s ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--kairo-speak)' }}>我的服务</h2>
              <WindLine className="flex-1 max-w-48" />
            </div>
            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--kairo-speak)' }}>{s.category}</span>
                <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '14px', color: 'var(--kairo-glimmer)' }}>★ {s.rating || 0}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)', lineHeight: 1.6 }}>
                {s.description || '用我的手艺，让Kairos有了形状。'}
              </p>
              <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-murmur)' }}>{s.projectCount || 0} 场完成</span>
            </GlassCard>

            <div className="flex items-center gap-3 mt-4">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--kairo-speak)' }}>合作案例</h3>
              <WindLine className="flex-1 max-w-48" />
            </div>
            <GlassCard className="p-5">
              <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>
                当你的手艺被需要时，这里会记录每一次协作。
              </p>
            </GlassCard>

            <div className="flex items-center gap-3 mt-4">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--kairo-speak)' }}>合作请求</h3>
              <WindLine className="flex-1 max-w-48" />
            </div>
            <GlassCard className="p-5">
              <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>
                还没有主创向你发出邀请。
              </p>
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="flex items-center justify-center py-16">
            <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)' }}>你还没有发布服务。</p>
          </GlassCard>
        )}
      </div>

      <div className="flex flex-wrap gap-2 px-8 pb-8">
        {['影像记录', '空间设计', '道具制作', '现场执行', '餐饮供应'].map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-whisper)' }}>{tag}</span>
        ))}
      </div>

      <PerceiverChat identity="FACILITATOR" />
    </div>
  )
}