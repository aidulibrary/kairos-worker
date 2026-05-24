'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image, Map } from 'lucide-react'

export interface UploadedFile {
  url: string
  filename: string
  type: string
  size: number
  fieldType: 'photo' | 'map'
}

interface FieldUploaderProps {
  fieldType?: 'photo' | 'map'
  onUploaded: (file: UploadedFile) => void
  onClear?: () => void
  currentFile?: UploadedFile | null
}

export default function FieldUploader({
  fieldType = 'photo',
  onUploaded,
  onClear,
  currentFile,
}: FieldUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true)
      setError(null)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fieldType', fieldType)

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error || '上传失败')
        }
        const data = await res.json()
        onUploaded({ ...data, fieldType })
      } catch (err) {
        setError(err instanceof Error ? err.message : '上传失败')
      } finally {
        setUploading(false)
      }
    },
    [fieldType, onUploaded]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) uploadFile(file)
    },
    [uploadFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) uploadFile(file)
    },
    [uploadFile]
  )

  const isPhoto = fieldType === 'photo'
  const label = isPhoto ? '上传空间照片' : '导入地图文件'
  const hint = isPhoto
    ? '拖拽或点击上传现场照片（JPG/PNG/WebP）'
    : '拖拽或点击导入地图文件（SVG/DXF）'
  const Icon = isPhoto ? Image : Map

  if (currentFile) {
    return (
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--kairo-emerging)', background: 'rgba(255,255,255,0.04)' }}
      >
        {isPhoto && (
          <img
            src={currentFile.url}
            alt="上传的空间照片"
            className="w-full h-48 object-cover opacity-80"
          />
        )}
        {!isPhoto && (
          <div className="flex items-center justify-center h-48" style={{ color: 'var(--kairo-whisper)' }}>
            <Map size={40} />
            <span className="ml-3" style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '14px' }}>
              {currentFile.filename} ({(currentFile.size / 1024).toFixed(1)}KB)
            </span>
          </div>
        )}
        {onClear && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all duration-200"
      style={{
        background: dragOver ? 'rgba(232,185,74,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px dashed ${dragOver ? 'var(--kairo-glimmer)' : 'var(--kairo-emerging)'}`,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={isPhoto ? 'image/jpeg,image/png,image/webp' : '.svg,.dxf'}
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading ? (
        <>
          <span className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--kairo-glimmer) transparent var(--kairo-glimmer) transparent' }} />
          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '13px', color: 'var(--kairo-whisper)' }}>感知场域中……</span>
        </>
      ) : (
        <>
          <Icon size={28} style={{ color: dragOver ? 'var(--kairo-glimmer)' : 'var(--kairo-murmur)' }} />
          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '14px', color: dragOver ? 'var(--kairo-glimmer)' : 'var(--kairo-whisper)' }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '11px', color: 'var(--kairo-murmur)' }}>{hint}</span>
        </>
      )}

      {error && (
        <span style={{ fontFamily: 'var(--font-chinese-body)', fontSize: '12px', color: 'var(--kairo-ember)' }}>{error}</span>
      )}
    </div>
  )
}
