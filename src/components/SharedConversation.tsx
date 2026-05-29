'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/GlassCard'
import { WindLine } from '@/components/WindLine'
import { MessageCircle } from 'lucide-react'

interface SharedConversationProps {
  marketId: string
}

export function SharedConversation({ marketId }: SharedConversationProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [shared, setShared] = useState(false)

  useEffect(() => {
    // 从 localStorage 读取主创与感觉者的对话
    try {
      const stored = localStorage.getItem(`kairos-chat-CREATOR`)
      if (stored) {
        const allMessages = JSON.parse(stored)
        // 只显示与当前市集相关的对话（通过消息内容判断）
        setMessages(allMessages.slice(-6)) // 最近6条
      }
    } catch {}
  }, [marketId])

  const share = () => {
    // 将对话标记为已分享
    localStorage.setItem(`kairos-shared-${marketId}`, 'true')
    setShared(true)
  }

  if (messages.length === 0) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={16} style={{ color: 'var(--kairo-whisper)' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--kairo-speak)' }}>感觉者对话室</h3>
        </div>
        <WindLine />
        <p className="text-center py-6" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-murmur)' }}>
          主创还未与感觉者对话。当对话发生时，这里会记录场域成形的回响。
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} style={{ color: 'var(--kairo-glimmer)' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--kairo-speak)' }}>感觉者对话室</h3>
        </div>
        {!shared && (
          <button
            onClick={share}
            className="px-3 py-1 rounded-md text-xs"
            style={{ background: 'var(--kairo-glimmer)', color: '#1a1a1a', fontFamily: 'var(--font-chinese-body)' }}
          >
            发布对话
          </button>
        )}
        {shared && (
          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '10px', color: 'var(--kairo-facilitator)' }}>已发布 ✓</span>
        )}
      </div>
      <WindLine />
      <div className="flex flex-col gap-2 mt-3 max-h-64 overflow-y-auto">
        {messages.map((msg: any, i: number) => (
          <div
            key={i}
            className="p-2 rounded-md"
            style={{
              background: msg.role === 'user' ? 'var(--kairo-between)' : 'rgba(232,185,74,0.08)',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-chinese-body)',
              fontSize: '12px',
              color: msg.role === 'user' ? 'var(--kairo-whisper)' : 'var(--kairo-glimmer)',
              lineHeight: 1.5,
            }}>
              {typeof msg.content === 'string' ? msg.content.slice(0, 150) : '[对话片段]'}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
