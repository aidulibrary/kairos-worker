'use client'

import { useState, useEffect } from 'react'
import { WindLine } from '@/components/WindLine'
import { GlassCard } from '@/components/GlassCard'
import { PerceiverChat } from '@/components/PerceiverChat'
import { MapPin } from 'lucide-react'

export default function DescenderPage() {
  const [markets, setMarkets] = useState<any[]>([])
  const [city, setCity] = useState('')
  const [reserving, setReserving] = useState<string | null>(null)

  const load = async () => {
    const url = city ? `/api/descender/nearby?city=${encodeURIComponent(city)}` : '/api/descender/nearby'
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      setMarkets(Array.isArray(data) ? data : (data.markets || []))
    }
  }

  useEffect(() => { load() }, [city])

  const reserve = async (marketId: string) => {
    setReserving(marketId)
    await fetch('/api/descender/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketId, userId: 'u-seed-3' }),
    })
    setReserving(null)
    alert('预约已发出——等待主创确认。')
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col items-center gap-4 px-8 py-12">
        <h1 className="text-center" style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h1)', fontWeight: 700, color: 'var(--kairo-speak)' }}>下一场Kairos，就在——</h1>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="px-4 py-2 rounded-[var(--radius-button)] cursor-pointer"
          style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', color: 'var(--kairo-whisper)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', outline: 'none' }}
        >
          <option value="">选择你的城市</option>
          <option value="北京">北京</option><option value="上海">上海</option><option value="杭州">杭州</option><option value="成都">成都</option><option value="深圳">深圳</option>
        </select>
      </div>

      <div className="px-8 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--kairo-speak)' }}>附近此刻</h2>
          <WindLine className="flex-1 max-w-48" />
        </div>
        {markets.length > 0 ? (
          <div className="flex flex-col gap-3">
            {markets.map((m) => (
              <div key={m.id} className="group relative">
                <a href={`/market/${m.id}`}>
                  <GlassCard className="p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-[2px]">
                    <MapPin size={18} style={{ color: 'var(--kairo-descender)' }} />
                    <div className="flex flex-col flex-1 gap-1">
                      <span style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--kairo-speak)' }}>{m.name}</span>
                      <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-whisper)' }}>
                        {m.location} · {m.date} · {m.creator?.name || '同行者'} 召唤
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--kairo-descender)' }}>{m.boothCount}</span>
                      <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)' }}>信位</span>
                    </div>
                  </GlassCard>
                </a>
                <button
                  onClick={(e) => { e.preventDefault(); reserve(m.id) }}
                  disabled={reserving === m.id}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-md"
                  style={{ background: 'linear-gradient(135deg, var(--kairo-descender), var(--kairo-glimmer))', color: '#1a1a1a', fontFamily: 'var(--font-chinese-body)', fontSize: '12px', fontWeight: 600 }}
                >
                  {reserving === m.id ? '...' : '预约'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h3)', color: 'var(--kairo-whisper)' }}>{city ? `${city}还没有正在靠近的Kairos。` : '这附近还没有正在靠近的Kairos。'}</p>
            <p className="text-center" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)', lineHeight: 1.6 }}>也许它们还在暗中成形。过几天再来看看。</p>
          </div>
        )}
      </div>

      <div className="px-8 pb-12">
        <div className="flex items-center gap-3 mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--kairo-speak)' }}>降临历</h2>
          <WindLine className="flex-1 max-w-48" />
        </div>
        {markets.length > 0 ? (
          <div className="flex flex-col gap-2">
            {markets.map((m, i) => (
              <GlassCard key={m.id} className="p-4 flex items-center gap-4">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--kairo-murmur)' }}>#{(i + 1).toString().padStart(2, '0')}</span>
                <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '14px', color: 'var(--kairo-speak)' }}>{m.name}</span>
                <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-whisper)', marginLeft: 'auto' }}>{m.date}</span>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="flex items-center justify-center py-10"><p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)' }}>你还未踏上过任何一条小径。</p></GlassCard>
        )}
      </div>

      <PerceiverChat identity="DESCENDER" />
    </div>
  )
}
