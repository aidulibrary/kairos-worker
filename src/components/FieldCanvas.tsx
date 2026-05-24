'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Konva must be dynamically imported — no DOM on server
const Stage = dynamic(() => import('react-konva').then(m => m.Stage), { ssr: false })
const Layer = dynamic(() => import('react-konva').then(m => m.Layer), { ssr: false })
const Rect = dynamic(() => import('react-konva').then(m => m.Rect), { ssr: false })
const Text = dynamic(() => import('react-konva').then(m => m.Text), { ssr: false })
const Group = dynamic(() => import('react-konva').then(m => m.Group), { ssr: false })
const Line = dynamic(() => import('react-konva').then(m => m.Line), { ssr: false })

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
}

/* ── 颜色映射 ── */
const STATUS_COLORS = {
  occupied: {
    fill: 'rgba(232,185,74,0.08)',
    stroke: 'rgba(232,185,74,0.6)',
    text: '#e8b94a',
    label: '已占据',
  },
  reserved: {
    fill: 'rgba(94,194,162,0.08)',
    stroke: 'rgba(94,194,162,0.5)',
    text: '#5ec2a2',
    label: '已预留',
  },
  available: {
    fill: 'rgba(255,255,255,0.03)',
    stroke: 'rgba(255,255,255,0.12)',
    text: 'rgba(255,255,255,0.35)',
    label: '空位',
  },
}

/* ── 单个摊位 ── */
function BoothRect({
  data,
  editable,
  onDragEnd,
  onClick,
}: {
  data: BoothData
  editable: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onClick?: (id: string) => void
}) {
  const colors = STATUS_COLORS[data.status]
  const [hovered, setHovered] = useState(false)

  return (
    <Group
      x={data.x}
      y={data.y}
      draggable={editable}
      onDragEnd={(e: any) => {
        onDragEnd?.(data.id, Math.round(e.target.x()), Math.round(e.target.y()))
      }}
      onClick={() => onClick?.(data.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 摊位矩形 */}
      <Rect
        width={data.width}
        height={data.height}
        fill={hovered ? colors.fill.replace('0.08', '0.18').replace('0.03', '0.10') : colors.fill}
        stroke={hovered ? colors.text : colors.stroke}
        strokeWidth={hovered ? 2 : 1}
        cornerRadius={6}
        shadowColor={hovered ? colors.text : 'transparent'}
        shadowBlur={hovered ? 12 : 0}
        shadowOpacity={0.3}
      />
      {/* 摊位编号 */}
      <Text
        text={data.number}
        x={8}
        y={8}
        fontSize={11}
        fontFamily="var(--font-mono), monospace"
        fontStyle="bold"
        fill={colors.text}
      />
      {/* 状态/摊主名 */}
      <Text
        text={data.vendorName || colors.label}
        x={8}
        y={24}
        fontSize={10}
        fontFamily="var(--font-chinese-body), sans-serif"
        fill={data.vendorName ? colors.text : colors.text}
        opacity={data.vendorName ? 0.85 : 0.5}
      />
      {/* 类别 */}
      {data.vendorCategory && (
        <Text
          text={data.vendorCategory}
          x={8}
          y={38}
          fontSize={9}
          fontFamily="var(--font-chinese-body), sans-serif"
          fill={colors.text}
          opacity={0.45}
        />
      )}
      {/* 电力标识 */}
      {data.hasPower && (
        <Text
          text="⚡"
          x={data.width - 18}
          y={6}
          fontSize={10}
        />
      )}
    </Group>
  )
}

/* ── 网格背景 ── */
function GridBackground({ w, h }: { w: number; h: number }) {
  const gap = 40
  const lines: React.ReactNode[] = []
  // vertical
  for (let x = gap; x < w; x += gap) {
    lines.push(
      <Line key={`v-${x}`} points={[x, 0, x, h]} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
    )
  }
  // horizontal
  for (let y = gap; y < h; y += gap) {
    lines.push(
      <Line key={`h-${y}`} points={[0, y, w, y]} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
    )
  }
  return <>{lines}</>
}

/* ── 主组件 ── */
export default function FieldCanvas({
  booths,
  width = 800,
  height = 500,
  editable = true,
  onBoothMove,
  onBoothClick,
}: FieldCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: width, h: height })
  const [konvaReady, setKonvaReady] = useState(false)

  // 响应式尺寸
  useEffect(() => {
    setKonvaReady(true)
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width)
        if (w > 0) setCanvasSize({ w, h: Math.max(400, Math.round(w * 0.55)) })
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      onBoothMove?.(id, x, y)
    },
    [onBoothMove]
  )

  // 统计
  const occupied = booths.filter(b => b.status === 'occupied').length
  const reserved = booths.filter(b => b.status === 'reserved').length
  const available = booths.filter(b => b.status === 'available').length

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
          background: 'rgba(7,7,8,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: 400,
        }}
      >
        {konvaReady && (
          <Stage width={canvasSize.w} height={canvasSize.h}>
            <Layer>
              <GridBackground w={canvasSize.w} h={canvasSize.h} />
              {booths.map(booth => (
                <BoothRect
                  key={booth.id}
                  data={booth}
                  editable={editable}
                  onDragEnd={handleDragEnd}
                  onClick={onBoothClick}
                />
              ))}
              {/* 空场域提示 */}
              {booths.length === 0 && (
                <Text
                  text="场域空空——从感觉者对话中感知布局，或上传空间照片"
                  x={canvasSize.w / 2 - 180}
                  y={canvasSize.h / 2 - 10}
                  fontSize={14}
                  fontFamily="var(--font-chinese-body), sans-serif"
                  fill="rgba(255,255,255,0.2)"
                />
              )}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  )
}
