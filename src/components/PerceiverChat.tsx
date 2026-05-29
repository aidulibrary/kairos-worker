// @ts-nocheck - AI SDK version type mismatch, will resolve with package update
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isTextUIPart, isToolUIPart, getToolName } from 'ai'
import { ChevronDown, Send, Mic, MicOff, Paperclip } from 'lucide-react'
import FieldUploader, { type UploadedFile } from './FieldUploader'

function getPlaceholder(): string {
  const hour = new Date().getHours()
  if (hour < 10) return '晨光在成形……'
  if (hour < 16) return '午后的风，有些暖……'
  return '夜色里，感觉更清晰……'
}

const suggestionQuestions = [
  '我感觉到一个咖啡市集在靠近……',
  '上一场留下的痕迹想告诉我什么？',
  '谁此刻正在靠近？',
]

const toolNames: Record<string, string> = {
  perceive_field: '场域·成形中',
  capture_field: '场域·捕获中',
  call_arrivers: '到来·召唤中',
  show_token: '信物·感知中',
  echo_back: '回响·聆听中',
  declare_kairos: '凯洛斯·宣告中',
}

export function PerceiverChat({ identity }: { identity?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [localInput, setLocalInput] = useState('')
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const { messages, status, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: identity ? { identity } : undefined,
    }),
  })

  const loading = status === 'submitted' || status === 'streaming'

  // ── 对话持久化到 localStorage ──
  useEffect(() => {
    if (messages.length > 0 && identity) {
      try { localStorage.setItem(`kairos-chat-${identity}`, JSON.stringify(messages)) } catch {}
    }
  }, [messages, identity])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInput(e.target.value)
  }

  const handleSuggestionClick = (q: string) => {
    sendMessage({ text: q })
  }

  // ── 语音输入 ──
  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setLocalInput('[语音输入不被当前浏览器支持]')
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = 'zh-CN'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setLocalInput(prev => prev + transcript)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }, [listening])

  // ── 文件上传回调 ──
  const handleFileUploaded = useCallback((file: UploadedFile) => {
    setUploadedFile(file)
    setShowUploader(false)
    setLocalInput(`我已上传了${file.fieldType === 'photo' ? '空间照片' : '地图文件'}(${file.url})，请帮我感知这个空间的布局。`)
  }, [])

  // ── 表单提交（含上传） ──
  const handleSubmitWithUpload = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = localInput.trim()
    if (!trimmed || loading) return

    // 如果有上传文件，将文件信息附加到消息中
    const contextParts: string[] = []
    if (uploadedFile) {
      contextParts.push(`[已上传${uploadedFile.fieldType === 'photo' ? '空间照片' : '地图文件'}: ${uploadedFile.url}]`)
    }
    const fullText = contextParts.length > 0 ? `${contextParts.join(' ')}\n${trimmed}` : trimmed

    sendMessage({ text: fullText })
    setLocalInput('')
    setUploadedFile(null)
  }

  // 清除上传
  const handleClearUpload = useCallback(() => {
    setUploadedFile(null)
  }, [])

  const renderMessageContent = (message: typeof messages[number]) => {
    return message.parts.map((part, i) => {
      if (isTextUIPart(part)) {
        return <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.text}</p>
      }

      if (isToolUIPart(part)) {
        const toolName = getToolName(part)
        const toolCallId = (part as { toolCallId?: string }).toolCallId || toolName
        const isExpanded = expandedToolId === toolCallId
        const hasOutput = part.state === 'output-available'

        return (
          <div key={i} className="px-4 py-3 mt-2" style={{ background: 'rgba(232, 185, 74, 0.06)', border: '1px solid var(--kairo-glimmer)', borderRadius: 'var(--radius-card)', animation: 'kairos-approach 0.3s ease' }}>
            <button onClick={() => setExpandedToolId(isExpanded ? null : (toolCallId ?? toolName))} className="flex items-center gap-2 w-full text-left" style={{ border: 'none', background: 'none', padding: 0, cursor: hasOutput ? 'pointer' : 'default' }}>
              <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-full)', background: 'var(--kairo-glimmer)', animation: part.state !== 'output-available' ? 'kairos-pulse 1.5s infinite' : 'none' }} />
              <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--kairo-glimmer)' }}>{toolNames[toolName] || toolName}</span>
              {part.state !== 'output-available' ? (
                <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)' }}>感知中……</span>
              ) : (
                <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)', textDecoration: 'underline', textDecorationColor: 'var(--kairo-glimmer)', textUnderlineOffset: 3 }}>{isExpanded ? '—— 点击收起' : '—— 已成形，点击展开'}</span>
              )}
            </button>
            {isExpanded && part.state === 'output-available' && (
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--kairo-whisper)', whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', marginTop: 8, transition: 'max-height 300ms ease' }}>{JSON.stringify(part.output, null, 2)}</pre>
            )}
          </div>
        )
      }
      return null
    })
  }

  return (
    <>
      <div className="px-8 pb-6">
        <button onClick={() => setIsOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-[var(--radius-card)] transition-all duration-300 text-left" style={{ background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.10)' }}>
          <span className="flex-1" style={{ color: 'var(--kairo-whisper)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)' }}>{getPlaceholder()}</span>
          <span className="flex items-center gap-2" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-glimmer)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-full)', background: 'var(--kairo-glimmer)', animation: 'kairos-pulse 2s infinite', display: 'inline-block' }} />感觉者已就位
          </span>
        </button>
      </div>
      {isOpen && (
        <div className="flex flex-col" style={{ position: 'fixed', top: 52, left: 0, right: 0, bottom: 0, zIndex: 40, background: 'oklch(0.09 0.01 270)' }}>
          <div className="flex items-center justify-between px-8 py-4 shrink-0">
            <div className="flex items-center gap-2">
              <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: 'var(--kairo-glimmer)', animation: 'kairos-pulse 2s infinite', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-whisper)' }}>感觉者 · 对话中</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full transition-opacity hover:opacity-70" style={{ color: 'var(--kairo-whisper)' }}><ChevronDown size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-4" style={{ scrollBehavior: 'smooth' }}>
            {error && (
              <div className="mb-4 p-4 rounded-[var(--radius-card)]" style={{ background: 'rgba(220, 38, 38, 0.12)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: '#fca5a5' }}>感知受阻：{error.message || String(error)}</p>
                <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)', marginTop: 4 }}>
                  请确认：1) Cloudflare 环境变量已设置 DEEPSEEK_API_KEY  2) 最新部署已完成（检查构建日志）
                </p>
              </div>
            )}
            {messages.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="flex flex-col items-center gap-2">
                  <h2 style={{ fontFamily: 'var(--font-chinese-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--kairo-glimmer)' }}>让Kairos说话。</h2>
                  <p style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-whisper)' }}>感觉者已经就位。</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-md">
                  {suggestionQuestions.map((q) => (
                    <button key={q} onClick={() => handleSuggestionClick(q)} className="w-full text-left px-4 py-3 rounded-[var(--radius-card)] transition-all duration-200" style={{ background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--kairo-whisper)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col gap-2" style={{ maxWidth: '75%' }}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 px-1">
                          <span style={{ fontSize: 11, color: 'var(--kairo-glimmer)' }}>几</span>
                          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '10px', color: 'var(--kairo-murmur)' }}>感觉者</span>
                        </div>
                      )}
                      <div className="px-4 py-3" style={{ background: message.role === 'user' ? 'var(--kairo-emerging)' : 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(12px)', border: message.role === 'user' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.10)', borderRadius: message.role === 'user' ? 'var(--radius-card) 4px var(--radius-card) var(--radius-card)' : '4px var(--radius-card) var(--radius-card) var(--radius-card)', color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', lineHeight: 1.6, animation: 'kairos-approach 0.3s ease' }}>
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3" style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.10)', borderRadius: '4px var(--radius-card) var(--radius-card) var(--radius-card)' }}>
                      <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)', color: 'var(--kairo-murmur)', animation: 'kairos-pulse 2s infinite' }}>感知中……</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-center">
                    <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-small)', color: 'var(--kairo-ember)' }}>风似乎遇到了阻碍……再试试看。</span>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmitWithUpload} className="flex flex-col gap-2 px-8 py-4 shrink-0" style={{ background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* 上传预览 */}
            {uploadedFile && (
              <div className="px-1">
                <FieldUploader fieldType={uploadedFile.fieldType} onUploaded={() => {}} onClear={handleClearUpload} currentFile={uploadedFile} />
              </div>
            )}
            {showUploader && !uploadedFile && (
              <div className="px-1"><FieldUploader fieldType="photo" onUploaded={handleFileUploaded} /></div>
            )}
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowUploader(prev => !prev)} className="p-2 rounded-full transition-opacity hover:opacity-70" style={{ color: showUploader ? 'var(--kairo-glimmer)' : 'var(--kairo-murmur)' }} title="上传空间照片">
                <Paperclip size={18} />
              </button>
              <button type="button" onClick={toggleVoice} className="p-2 rounded-full transition-opacity hover:opacity-70" style={{ color: listening ? 'var(--kairo-ember)' : 'var(--kairo-murmur)' }} title={listening ? '正在聆听……' : '语音输入'}>
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input value={localInput} onChange={handleInputChange} placeholder={getPlaceholder()} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--kairo-speak)', fontFamily: 'var(--font-chinese-body)', fontSize: 'var(--text-body)' }} />
              <button type="submit" disabled={!localInput.trim() || loading} className="flex items-center justify-center transition-all duration-200" style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: localInput.trim() && !loading ? 'linear-gradient(135deg, var(--kairo-glimmer), var(--kairo-ember))' : 'var(--kairo-between)', border: 'none', cursor: localInput.trim() && !loading ? 'pointer' : 'default', opacity: localInput.trim() && !loading ? 1 : 0.4 }}>
                <Send size={16} color="oklch(0.15 0.02 75)" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}