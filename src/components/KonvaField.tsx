'use client'

import { useState, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva'
import type { BoothData } from './FieldCanvas'

/* ── 颜色映射 ── */
const STATUS_COLORS = {
  occupied: {
    fill: 'rgba(232,185,74,0.15)',
    stroke: 'rgba(232,185,74,0.9)',
    text: '#f0c850',
    label: '已占据',
  },
  reserved: {
    fill: 'rgba(94,194,162,0.15)',
    stroke: 'rgba(94,194,162,0.8)',
    text: '#5ec2a2',
    label: '已预留',
  },
  available: {
    fill: 'rgba(255,255,255,0.06)',
    stroke: 'rgba(255,255,255,0.25)',
    text: 'rgba(255,255,255,0.55)',
    label: '空位',
  },
}

/* ── 单个摊位 ── */
function BoothRect({
  data,
  editable,
  locked,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClick,
}: {
  data: BoothData
  editable: boolean
  locked?: boolean
  onDragStart?: (id: string) => void
  onDragMove?: (id: string, x: number, y: number) => void
  onDragEnd?: (id: string, x: number, y: number) => void
  onClick?: (id: string) => void
}) {
  const colors = STATUS_COLORS[data.status]
  const [hovered, setHovered] = useState(false)
  const isLocked = locked && editable

  return (
    <Group
      x={data.x}
      y={data.y}
      draggable={editable && !locked}
      onDragStart={() => onDragStart?.(data.id)}
      onDragMove={(e: any) => {
        onDragMove?.(data.id, Math.round(e.target.x()), Math.round(e.target.y()))
      }}
      onDragEnd={(e: any) => {
        onDragEnd?.(data.id, Math.round(e.target.x()), Math.round(e.target.y()))
      }}
      onClick={() => onClick?.(data.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Rect
        width={data.width}
        height={data.height}
        fill={hovered ? colors.fill.replace('0.15', '0.30').replace('0.06', '0.15') : colors.fill}
        stroke={isLocked ? '#ff6b6b' : hovered ? colors.text : colors.stroke}
        strokeWidth={isLocked ? 2 : hovered ? 2 : 1}
        cornerRadius={6}
        shadowColor={isLocked ? '#ff6b6b' : hovered ? colors.text : 'transparent'}
        shadowBlur={isLocked ? 8 : hovered ? 12 : 0}
        shadowOpacity={0.3}
        dash={isLocked ? [6, 3] : undefined}
      />
      <Text
        text={data.number}
        x={8}
        y={8}
        fontSize={11}
        fontFamily="var(--font-mono), monospace"
        fontStyle="bold"
        fill={colors.text}
      />
      <Text
        text={data.vendorName || colors.label}
        x={8}
        y={24}
        fontSize={10}
        fontFamily="var(--font-chinese-body), sans-serif"
        fill={colors.text}
        opacity={data.vendorName ? 0.85 : 0.5}
      />
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
      {data.hasPower && (
        <Text text="⚡" x={data.width - 18} y={6} fontSize={10} />
      )}
      {/* 锁定标记 */}
      {isLocked && (
        <>
          <Text text="🔒" x={data.width - 30} y={data.height - 20} fontSize={12} />
          <Text
            text="他人编辑中"
            x={4}
            y={data.height - 20}
            fontSize={9}
            fontFamily="var(--font-chinese-body), sans-serif"
            fill="#ff6b6b"
          />
        </>
      )}
    </Group>
  )
}

/* ── 网格背景 ── */
function GridBackground({ w, h }: { w: number; h: number }) {
  const gap = 40
  const lines: React.ReactNode[] = []
  for (let x = gap; x < w; x += gap) {
    lines.push(
      <Line key={`v-${x}`} points={[x, 0, x, h]} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
    )
  }
  for (let y = gap; y < h; y += gap) {
    lines.push(
      <Line key={`h-${y}`} points={[0, y, w, y]} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
    )
  }
  return <>{lines}</>
}

/* ── 协作状态指示器 ── */
function CollabIndicator({ online, peers }: { online: boolean; peers: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 'var(--radius-card)',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-chinese-body), sans-serif',
        fontSize: '11px',
        color: 'var(--kairo-whisper)',
        zIndex: 10,
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: online ? 'var(--kairo-facilitator)' : 'var(--kairo-ember)',
        boxShadow: online ? '0 0 6px var(--kairo-facilitator)' : 'none',
      }} />
      {online ? `${peers} 人协同` : '离线'}
    </div>
  )
}

/* ── Konva 画布 ── */
export interface KonvaFieldProps {
  booths: BoothData[]
  width: number
  height: number
  editable: boolean
  onBoothMove?: (id: string, x: number, y: number) => void
  onBoothClick?: (id: string) => void
  // ── Yjs 协作 ──
  collab?: {
    online: boolean
    peers: number
    lockedBooths: Set<string>
    onDragStart: (id: string) => void
    onDragMove: (id: string, x: number, y: number) => void
    onDragEnd: (id: string, x: number, y: number) => void
  }
}

export default function KonvaField({
  booths,
  width,
  height,
  editable,
  onBoothMove,
  onBoothClick,
  collab,
}: KonvaFieldProps) {
  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      if (collab) {
        collab.onDragEnd(id, x, y)
      } else {
        onBoothMove?.(id, x, y)
      }
    },
    [onBoothMove, collab],
  )

  return (
    <div style={{ position: 'relative' }}>
      {collab && <CollabIndicator online={collab.online} peers={collab.peers} />}
      <Stage width={width} height={height}>
        <Layer>
          <GridBackground w={width} h={height} />
          {booths.map((booth) => (
            <BoothRect
              key={booth.id}
              data={booth}
              editable={editable}
              locked={collab?.lockedBooths.has(booth.id)}
              onDragStart={collab?.onDragStart}
              onDragMove={collab?.onDragMove}
              onDragEnd={handleDragEnd}
              onClick={onBoothClick}
            />
          ))}
          {booths.length === 0 && (
            <Text
              text={collab && !collab.online ? '等待连接协作服务……' : '场域空空——从感觉者对话中感知布局，或上传空间照片'}
              x={width / 2 - 180}
              y={height / 2 - 10}
              fontSize={14}
              fontFamily="var(--font-chinese-body), sans-serif"
              fill="rgba(255,255,255,0.2)"
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}
