'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RegisterFormProps { identity: string; identityLabel: string; onBack: () => void }

const categories = ['咖啡', '茶饮', '手作', '烘焙', '花艺', '书籍', '音乐', '服饰', '饰品', '香氛', '器物', '食材', '艺术', '其他']
const serviceCategories = ['摄影', '设计', '搭建', '音响', '灯光', '餐饮', '物流', '宣传', '其他']

export function RegisterForm({ identity, identityLabel, onBack }: RegisterFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'extras'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [serviceCategory, setServiceCategory] = useState<string[]>([])
  const [marketName, setMarketName] = useState('')

  const needsExtras = identity === 'ARRIVER' || identity === 'FACILITATOR' || identity === 'CREATOR'

  const handleSendCode = async () => {
    if (!phone || phone.length < 11) { setError('请输入完整的手机号'); return }
    setSending(true); setError('')
    try { await fetch('/api/auth/send-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) }); setStep(needsExtras ? 'extras' : 'phone') } catch { setError('验证码发送失败，请再试一次') }
    setSending(false)
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('请留下你的名字'); return }
    if (code !== '1234') { setError('验证码不匹配，试试1234'); return }
    setSubmitting(true); setError('')
    const extras: Record<string, string> = {}
    if (identity === 'ARRIVER') { extras.category = category; extras.city = city }
    if (identity === 'FACILITATOR') { extras.category = serviceCategory.join(',') }
    if (identity === 'CREATOR') { extras.marketName = marketName }
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, name, identity, extras }) })
      if (res.ok) { const spaceMap: Record<string, string> = { CREATOR: '/creator', ARRIVER: '/arriver', DESCENDER: '/descender', FACILITATOR: '/facilitator' }; router.push(spaceMap[identity] || '/') }
      else { setError('注册未成功，请再试一次') }
    } catch { setError('网络好像不太对，请再试一次') }
    setSubmitting(false)
  }

  const toggleServiceCategory = (cat: string) => { setServiceCategory((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]) }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <button onClick={onBack} className="self-start text-[var(--kairo-whisper)] hover:text-[var(--kairo-speak)] transition-colors duration-200" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px' }}>← 换一种身份</button>
      <h2 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--kairo-speak)' }}>成为{identityLabel}</h2>
      <div className="flex flex-col gap-3">
        <input type="tel" placeholder="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={11} style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', borderRadius: 'var(--radius-input)', padding: '12px 16px', color: 'var(--kairo-speak)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', outline: 'none' }} />
        {step !== 'extras' && (
          <div className="flex gap-2">
            <input type="text" placeholder="验证码（试试1234）" value={code} onChange={(e) => setCode(e.target.value)} maxLength={4} className="flex-1" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', borderRadius: 'var(--radius-input)', padding: '12px 16px', color: 'var(--kairo-speak)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', outline: 'none' }} />
            <button onClick={handleSendCode} disabled={sending} className="px-4 rounded-[var(--radius-button)] transition-all duration-200 whitespace-nowrap" style={{ background: sending ? 'var(--kairo-between)' : 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))', color: sending ? 'var(--kairo-whisper)' : 'oklch(0.15 0.02 75)', fontFamily: 'var(--font-chinese-body)', fontSize: '13px', fontWeight: 600 }}>{sending ? '发送中...' : '获取验证码'}</button>
          </div>
        )}
      </div>
      {step === 'extras' && (
        <div className="flex flex-col gap-3">
          <input type="text" placeholder="你的名字" value={name} onChange={(e) => setName(e.target.value)} style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', borderRadius: 'var(--radius-input)', padding: '12px 16px', color: 'var(--kairo-speak)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', outline: 'none' }} />
          {identity === 'ARRIVER' && (<><select value={category} onChange={(e) => setCategory(e.target.value)} style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', borderRadius: 'var(--radius-input)', padding: '12px 16px', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', outline: 'none' }}><option value="">选择你的品类</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select><input type="text" placeholder="所在城市" value={city} onChange={(e) => setCity(e.target.value)} style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', borderRadius: 'var(--radius-input)', padding: '12px 16px', color: 'var(--kairo-speak)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', outline: 'none' }} /></>)}
          {identity === 'FACILITATOR' && (<div className="flex flex-col gap-2"><span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-whisper)' }}>你提供的手艺</span><div className="flex flex-wrap gap-2">{serviceCategories.map((cat) => { const active = serviceCategory.includes(cat); return <button key={cat} onClick={() => toggleServiceCategory(cat)} className="px-3 py-1.5 rounded-[var(--radius-button)] transition-all duration-200" style={{ background: active ? 'rgba(232,185,74,0.15)' : 'var(--kairo-between)', border: active ? '1px solid var(--kairo-glimmer)' : '1px solid var(--kairo-emerging)', color: active ? 'var(--kairo-glimmer)' : 'var(--kairo-whisper)', fontFamily: 'var(--font-chinese-body)', fontSize: '12px' }}>{cat}</button> })}</div></div>)}
          {identity === 'CREATOR' && (<input type="text" placeholder="想召唤的市集之名（可选）" value={marketName} onChange={(e) => setMarketName(e.target.value)} style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', borderRadius: 'var(--radius-input)', padding: '12px 16px', color: 'var(--kairo-speak)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', outline: 'none' }} />)}
          <div className="flex gap-2"><input type="text" placeholder="验证码（试试1234）" value={code} onChange={(e) => setCode(e.target.value)} maxLength={4} className="flex-1" style={{ background: 'var(--kairo-between)', border: '1px solid var(--kairo-emerging)', borderRadius: 'var(--radius-input)', padding: '12px 16px', color: 'var(--kairo-speak)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', outline: 'none' }} /><button onClick={handleSendCode} disabled={sending} className="px-4 rounded-[var(--radius-button)] transition-all duration-200 whitespace-nowrap" style={{ background: sending ? 'var(--kairo-between)' : 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))', color: sending ? 'var(--kairo-whisper)' : 'oklch(0.15 0.02 75)', fontFamily: 'var(--font-chinese-body)', fontSize: '13px', fontWeight: 600 }}>{sending ? '发送中...' : '获取验证码'}</button></div>
        </div>
      )}
      {error && <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-descender)' }}>{error}</p>}
      {(step === 'extras' || (!needsExtras && step === 'phone')) && (<button onClick={handleSubmit} disabled={submitting} className="w-full py-3 rounded-[var(--radius-button)] transition-all duration-200" style={{ background: submitting ? 'var(--kairo-between)' : 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))', color: submitting ? 'var(--kairo-whisper)' : 'oklch(0.15 0.02 75)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', fontWeight: 600 }}>{submitting ? '正在走进来...' : '走进来'}</button>)}
    </div>
  )
}