'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export interface SharedBooth {
  id: string
  x: number
  y: number
  status: string
  lockedBy?: string
}

interface UseYjsCollaborationOptions {
  roomId: string
  userId?: string
  initialBooths?: SharedBooth[]
}

export function useYjsCollaboration({ roomId, userId, initialBooths = [] }: UseYjsCollaborationOptions) {
  const [booths, setBooths] = useState<SharedBooth[]>(initialBooths)
  const [online, setOnline] = useState(false)
  const [peers, setPeers] = useState(0)
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const boothMapRef = useRef<Y.Map<any> | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    // WebSocket provider
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3030'
    const provider = new WebsocketProvider(wsUrl, `kairos-market-${roomId}`, ydoc, {
      connect: true,
    })
    providerRef.current = provider

    // Shared booth map
    const boothMap = ydoc.getMap('booths')
    boothMapRef.current = boothMap

    // Connection status
    provider.on('status', ({ status }: any) => {
      setOnline(status === 'connected')
    })

    // Peer awareness
    provider.awareness.on('change', () => {
      setPeers(provider.awareness.getStates().size)
    })
    if (userId) {
      provider.awareness.setLocalState({ userId, name: userId })
    }

    // Sync booths to state
    const syncBooths = () => {
      const arr: SharedBooth[] = []
      boothMap.forEach((val: any, key: string) => arr.push({ id: key, ...val }))
      setBooths(arr)
    }
    boothMap.observe(syncBooths)

    // Initialize with seed data if empty
    if (boothMap.size === 0 && initialBooths.length > 0) {
      ydoc.transact(() => {
        initialBooths.forEach((b) => {
          boothMap.set(b.id, { x: b.x, y: b.y, status: b.status })
        })
      })
    }

    return () => {
      provider.disconnect()
      ydoc.destroy()
    }
  }, [])

  // Move a booth
  const moveBooth = useCallback((id: string, x: number, y: number) => {
    const map = boothMapRef.current
    if (!map) return
    const entry = map.get(id)
    if (!entry) return
    // Check if locked by someone else
    if (entry.lockedBy && entry.lockedBy !== userId) return
    map.set(id, { ...entry, x, y, lockedBy: null })
  }, [userId])

  // Lock a booth (start dragging)
  const lockBooth = useCallback((id: string) => {
    const map = boothMapRef.current
    if (!map || !userId) return
    const entry = map.get(id)
    if (!entry) return
    // Only lock if not already locked by someone else
    if (entry.lockedBy && entry.lockedBy !== userId) return
    map.set(id, { ...entry, lockedBy: userId })
  }, [userId])

  // Release a booth lock
  const releaseBooth = useCallback((id: string) => {
    const map = boothMapRef.current
    if (!map) return
    const entry = map.get(id)
    if (!entry) return
    if (entry.lockedBy === userId) {
      map.set(id, { ...entry, lockedBy: null })
    }
  }, [userId])

  // Update booth status
  const updateBoothStatus = useCallback((id: string, status: string) => {
    const map = boothMapRef.current
    if (!map) return
    const entry = map.get(id)
    if (!entry) return
    map.set(id, { ...entry, status })
  }, [])

  return {
    booths,
    online,
    peers,
    moveBooth,
    lockBooth,
    releaseBooth,
    updateBoothStatus,
    provider: providerRef,
    ydoc: ydocRef,
  }
}
