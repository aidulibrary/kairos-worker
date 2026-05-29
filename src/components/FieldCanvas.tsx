'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

// 整个 Konva 树作为一个整体动态加载——保持父子 context 链不断
const KonvaField = dynamic(() => import('./KonvaField'), { ssr: false })

/* ── 类型 ── */
export interface BoothData {
  id: string
  number: string
  x: number
  y: number
  width: number
  height: number
  status: 'occupied' | 'reserved' | 'available'
  vendorName?: string
  vendorCategory?: string
  hasPower: boolean
}

export interface FieldCanvasProps {
  booths: BoothData[]
  width?: number
  height?: number
  editable?: boolean
  onBoothMove?: (id: string, x: number, y: number) => void
  onBoothClick?: (id: string) => void
  collab?: {
    online: boolean
    peers: number
    lockedBooths: Set<string>
    onDragStart: (id: string) => void
    onDragMove: (id: string, x: number, y: number) => void
    onDragEnd: (id: string, x: number, y: number) => void
  }
}

/* ── 主组件 ── */
export default function FieldCanvas({
  booths,
  width = 800,
  height = 500,
  editable = true,
  onBoothMove,
  onBoothClick,
  collab,
}: FieldCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: width, h: height })
  const [mounted, setMounted] = useState(false)

  // 响应式尺寸
  useEffect(() => {
    setMounted(true)
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width)
        if (w > 0) setCanvasSize({ w, h: Math.max(400, Math.round(w * 0.55)) })
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // 统计
  const occupied = booths.filter((b) => b.status === 'occupied').length
  const reserved = booths.filter((b) => b.status === 'reserved').length
  const available = booths.filter((b) => b.status === 'available').length

  return (
    <div className="flex flex-col gap-3">
      {/* 状态栏 */}
      <div className="flex items-center gap-4" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px' }}>
        <span style={{ color: '#e8b94a' }}>● {occupied} 已占据</span>
        <span style={{ color: '#5ec2a2' }}>● {reserved} 已预留</span>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>● {available} 空位</span>
        {editable && (
          <span style={{ color: 'var(--kairo-murmur)', marginLeft: 'auto', fontSize: '11px' }}>
            拖拽摊位可调整位置
          </span>
        )}
      </div>

      {/* 画布容器 */}
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: '#161618',
          border: '1px solid rgba(255,255,255,0.15)',
          minHeight: 400,
        }}
      >
        {mounted && (
          <KonvaField
            booths={booths}
            width={canvasSize.w}
            height={canvasSize.h}
            editable={editable}
            onBoothMove={onBoothMove}
            onBoothClick={onBoothClick}
            collab={collab}
          />
        )}
      </div>
    </div>
  )
}
