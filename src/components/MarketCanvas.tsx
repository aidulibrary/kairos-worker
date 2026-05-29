'use client'

import { useState, useCallback } from 'react'
import FieldCanvas from '@/components/FieldCanvas'
import type { BoothData } from '@/components/FieldCanvas'
import { useYjsCollaboration } from '@/hooks/useYjsCollaboration'

interface MarketCanvasProps {
  marketId: string
  booths: BoothData[]
}

export default function MarketCanvas({ marketId, booths: initialBooths }: MarketCanvasProps) {
  const userId = 'u-seed-1' // TODO: 替换为真实用户ID
  const [lockedBooths, setLockedBooths] = useState<Set<string>>(new Set())

  const {
    booths,
    online,
    peers,
    moveBooth,
    lockBooth,
    releaseBooth,
    updateBoothStatus,
  } = useYjsCollaboration({
    roomId: marketId,
    userId,
    initialBooths: initialBooths.map((b) => ({ id: b.id, x: b.x, y: b.y, status: b.status })),
  })

  // Merge Yjs position data with static booth info (name, category, etc.)
  const mergedBooths: BoothData[] = initialBooths.map((b) => {
    const shared = booths.find((s) => s.id === b.id)
    return shared ? { ...b, x: shared.x, y: shared.y, status: shared.status as BoothData['status'] } : b
  })

  const handleDragStart = useCallback((id: string) => {
    lockBooth(id)
    setLockedBooths((prev) => new Set(prev).add(id))
  }, [lockBooth])

  const handleDragMove = useCallback((id: string, x: number, y: number) => {
    moveBooth(id, x, y)
  }, [moveBooth])

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    moveBooth(id, x, y)
    releaseBooth(id)
    setLockedBooths((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    // 同步到服务器
    fetch('/api/descender/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boothId: id, positionX: x, positionY: y }),
    }).catch(() => {})
  }, [moveBooth, releaseBooth])

  const collab = { online, peers, lockedBooths, onDragStart: handleDragStart, onDragMove: handleDragMove, onDragEnd: handleDragEnd }

  return (
    <FieldCanvas booths={mergedBooths} collab={collab} />
  )
}
