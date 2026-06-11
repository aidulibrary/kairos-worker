'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/lib/session'

const postTypes: Record<string, string> = {
  WIND: '风信',
  LANTERN: '灯火',
  FORUM: '几·坛',
  MEMOIR: '相逢记',
}

interface PlazaPublishBtnProps {
  postType: 'WIND' | 'FORUM'
  variant?: 'outline' | 'gradient'
}

export default function PlazaPublishBtn({ postType, variant = 'outline' }: PlazaPublishBtnProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const label = postTypes[postType]
  const isGradient = variant === 'gradient'

  const handleSubmit = async () => {
    if (!content.trim()) { setError('说点什么吧'); return }
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/plaza/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: postType, content: content.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '发布未成形')
      }
      setOpen(false)
      setContent('')
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : '发布未成形')
    }
    setSubmitting(false)
  }

  return (
    <>
      <button
        onClick={() => {
          if (!user) { setError('需要先走进来才能发布'); return }
          setError('')
          setOpen(true)
        }}
        className="px-4 py-2 rounded-[var(--radius-button)] transition-all duration-200"
        style={{
          background: isGradient ? 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))' : 'var(--kairo-between)',
          border: isGradient ? 'none' : '1px solid var(--kairo-emerging)',
          color: isGradient ? 'oklch(0.15 0.02 75)' : 'var(--kairo-whisper)',
          fontFamily: 'var(--font-chinese-body)',
          fontSize: '13px',
          fontWeight: isGradient ? 600 : 400,
        }}
      >
        + 发布{label}
      </button>

      {error && !open && (
        <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-descender)', marginLeft: 8 }}>{error}</span>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="flex flex-col gap-4 p-6 rounded-[var(--radius-card)] w-full max-w-lg mx-4"
            style={{ background: 'oklch(0.12 0.01 270)', border: '1px solid var(--kairo-emerging)', animation: 'kairos-approach 0.25s ease' }}
          >
            <div className="flex items-center justify-between">
              <h3 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--kairo-speak)' }}>
                发布{label}
              </h3>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--kairo-whisper)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postType === 'WIND' ? '有什么正在成形……' : '你想讨论什么……'}
              rows={5}
              style={{
                background: 'var(--kairo-between)',
                border: '1px solid var(--kairo-emerging)',
                borderRadius: 'var(--radius-input)',
                padding: '12px 16px',
                color: 'var(--kairo-speak)',
                fontFamily: 'var(--font-chinese-body)',
                fontSize: 'var(--text-body)',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.7,
              }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-descender)' }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-[var(--radius-button)] transition-all duration-200"
              style={{
                background: submitting ? 'var(--kairo-between)' : 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))',
                color: submitting ? 'var(--kairo-whisper)' : 'oklch(0.15 0.02 75)',
                fontFamily: 'var(--font-chinese-body)',
                fontSize: 'var(--text-body)',
                fontWeight: 600,
              }}
            >
              {submitting ? '成形中……' : '发布'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}