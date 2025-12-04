'use client'

import { useState, useRef } from 'react'
import { Upload, X, Play, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadMedia } from '@/app/actions/admin/settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { isVideoUrl } from '@/components/ui/MediaDisplay'

interface MediaUploaderProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  accept?: 'image' | 'video' | 'all'
  className?: string
  aspectRatio?: string
  label?: string
}

export default function MediaUploader({
  value,
  onChange,
  folder = 'general',
  accept = 'all',
  className,
  aspectRatio = 'aspect-video',
  label = 'Upload un média',
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptTypes = {
    image: 'image/jpeg,image/png,image/webp,image/gif',
    video: 'video/mp4,video/webm,video/quicktime',
    all: 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime',
  }

  const handleUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const media = await uploadMedia(formData)
      onChange(media.url)
      toast.success('Média uploadé avec succès')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const isVideo = value ? isVideoUrl(value) : false

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg overflow-hidden transition-colors',
          aspectRatio,
          dragOver ? 'border-primary bg-primary/5' : 'border-border',
          'hover:border-primary/50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {value ? (
          <>
            {isVideo ? (
              <video
                src={value}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Changer'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onChange('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Badge type */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
              {isVideo ? <Play className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
              {isVideo ? 'Vidéo' : 'Image'}
            </div>
          </>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center px-4">
                  Glissez un fichier ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {accept === 'image' && 'Images (JPEG, PNG, WebP)'}
                  {accept === 'video' && 'Vidéos (MP4, WebM)'}
                  {accept === 'all' && 'Images ou vidéos'}
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes[accept]}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Input URL manuel */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ou collez une URL..."
          className="flex-1 px-3 py-2 text-sm border rounded-md"
        />
      </div>
    </div>
  )
}
