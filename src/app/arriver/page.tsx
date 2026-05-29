'use client'

import { useState, useEffect } from 'react'
import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { TokenBadge } from '@/components/TokenBadge'
import { TokenDetail } from '@/components/TokenDetail'
import { PerceiverChat } from '@/components/PerceiverChat'
import { Edit3, Check, X } from 'lucide-react'

export default function ArriverPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ description: '', category: '', city: '' })

  const load = async () => {
    const res = await fetch('/api/arriver/profile?userId=u-seed-2')
    if (res.ok) {
      const data = await res.json()
      const v = data.vendor || data
      setVendor(v)
      setForm({ description: v?.description || '', category: v?.category || '', city: v?.city || '' })
    }
  }

  useEffect(() => { load() }, [])

  const saveProfile = async () => {
    await fetch('/api/arriver/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u-seed-2', ...form }),
    })
    setEditing(false)
    await load()
  }

  const respondInvite = async (boothId: string, accept: boolean) => {
    await fetch('/api/arriver/invitations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boothId, status: accept ? 'occupied' : 'available' }),
    })
    await load()
  }

  const tokenLevel = vendor?.user?.tokenLevel || 'WALKER'
  const creditScore = vendor?.creditScore || 60
  const invitations = (vendor?.booths || []).filter((b: any) => b.status === 'reserved')
  const history = (vendor?.booths || []).filter((b: any) => b.status === 'occupied')

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-8 px-8 py-10">
        <TokenBadge level={tokenLevel as any} size="lg" />
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '72px', fontWeight: 600, color: 'var(--kairo-glimmer)', lineHeight: 1 }}>{creditScore}</span>
            <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-whisper)' }}>信物分</span>
          </div>
          {editing ? (
            <div className="flex flex-col gap-2 mt-2">
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="px-3 py-2 rounded-md outline-none" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}
                placeholder="你的手艺签名..."
              />
              <div className="flex gap-2">
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="px-3 py-2 rounded-md outline-none flex-1" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}
                  placeholder="手艺类别"
                />
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="px-3 py-2 rounded-md outline-none w-32" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}
                  placeholder="城市"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={saveProfile} className="px-4 py-1.5 rounded-md" style={{ background: 'var(--kairo-glimmer)', color: '#1a1a1a', fontFamily: 'var(--font-chinese-body)', fontSize: '12px', fontWeight: 600 }}>保存</button>
                <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-md" style={{ background: 'var(--kairo-between)', color: 'var(--kairo-whisper)', fontFamily: 'var(--font-chinese-body)', fontSize: '12px' }}>取消</button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)' }}>
                {vendor?.description || '你的信物正在被看见。'}
              </p>
              <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)' }}>
                {vendor?.user?.name || '主理人'} · {vendor?.category || '手艺人'} · {vendor?.city || ''}
              </p>
            </>
          )}
          <div className="mt-2 w-64">
            <TokenDetail score={creditScore} level={tokenLevel as any} expoCount={vendor?.expoCount || 0} goodRate={vendor?.goodRate || 0} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 px-8 pb-6" style={{ gap: 'var(--space-breath)' }}>
        <GlassCard className="flex flex-col gap-4 p-5 shrink-0" style={{ width: 280 }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--kairo-speak)' }}>召集箱</h3>
            {!editing && (
              <button onClick={() => setEditing(true)} className="p-1 rounded-md" style={{ background: 'var(--kairo-between)' }}>
                <Edit3 size={13} style={{ color: 'var(--kairo-whisper)' }} />
              </button>
            )}
          </div>
          <WindLine />
          {invitations.length > 0 ? (
            <div className="flex flex-col gap-2">
              {invitations.map((inv: any) => (
                <div key={inv.id} className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-speak)' }}>{inv.market?.name || '一个Kairos'}</p>
                    <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '10px', color: 'var(--kairo-murmur)' }}>{inv.number}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => respondInvite(inv.id, true)} className="p-1 rounded" style={{ background: 'rgba(94,194,162,0.2)' }}><Check size={12} style={{ color: 'var(--kairo-facilitator)' }} /></button>
                    <button onClick={() => respondInvite(inv.id, false)} className="p-1 rounded" style={{ background: 'rgba(222,90,74,0.2)' }}><X size={12} style={{ color: 'var(--kairo-ember)' }} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
              <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>还没有新的召唤抵达。</p>
            </div>
          )}
        </GlassCard>

        <div className="flex flex-col flex-1 gap-4">
          <div className="flex items-center justify-between">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--kairo-speak)' }}>信物墙</h3>
          </div>
          <GlassCard className="flex-1 p-6 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--kairo-between)', border: '2px dashed var(--kairo-emerging)' }}>
              <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '24px', color: 'var(--kairo-murmur)' }}>+</span>
            </div>
            <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-whisper)' }}>添加你的手艺印记</p>
          </GlassCard>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--kairo-whisper)' }}>参展记录</span>
            <WindLine className="flex-1 max-w-32" />
          </div>
          {history.length > 0 ? (
            <div className="flex flex-col gap-2">
              {history.map((h: any) => (
                <GlassCard key={h.id} className="p-3 flex items-center gap-3">
                  <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-speak)' }}>{h.market?.name || '一个Kairos'}</span>
                  <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)' }}>{h.number}</span>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-2"><p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)' }}>你会在对的时刻留下痕迹。</p></div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--kairo-whisper)' }}>到场历</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--kairo-glimmer)' }}>{history.length} 场</span>
          </div>
        </div>
      </div>

      <PerceiverChat identity="ARRIVER" />
    </div>
  )
}
