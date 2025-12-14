'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  X,
  Play,
  Image as ImageIcon,
  Loader2,
  GripVertical,
  Plus,
  Move
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { isVideoUrl } from '@/components/ui/MediaDisplay'

interface MediaItem {
  url: string
  type: 'image' | 'video'
  id: string
}

interface MediaGalleryProps {
  value: string[] // Array of URLs
  onChange: (urls: string[]) => void
  folder?: string
  accept?: 'image' | 'video' | 'all'
  className?: string
  maxFiles?: number
  label?: string
}

export default function MediaGallery({
  value = [],
  onChange,
  folder = 'products',
  accept = 'all',
  className,
  maxFiles = 10,
  label = 'Galerie média',
}: MediaGalleryProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptTypes = {
    image: 'image/jpeg,image/png,image/webp,image/gif',
    video: 'video/mp4,video/webm,video/quicktime',
    all: 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime',
  }

  const mediaItems: MediaItem[] = value.map((url, index) => ({
    url,
    type: isVideoUrl(url) ? 'video' : 'image',
    id: `${index}-${url}`
  }))

  const handleUpload = async (files: FileList) => {
    if (!files.length) return

    const remainingSlots = maxFiles - value.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length < files.length) {
      toast.warning(`Seuls ${filesToUpload.length} fichiers ont été ajoutés (limite: ${maxFiles})`)
    }

    setUploading(true)
    const uploadPromises = filesToUpload.map(async (file) => {
      try {
        // Upload vers API route au lieu de server action
        const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&folder=${folder}`, {
          method: 'POST',
          body: file,
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Erreur upload')
        }

        return result.url
      } catch (error) {
        console.error('Erreur upload fichier:', error)
        throw error
      }
    })

    try {
      const newUrls = await Promise.all(uploadPromises)
      onChange([...value, ...newUrls])
      toast.success(`${newUrls.length} média(s) uploadé(s) avec succès`)
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error)
      toast.error(error.message || 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) handleUpload(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files) handleUpload(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeMedia = (index: number) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
  }

  const moveMedia = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return

    const newValue = [...value]
    const item = newValue.splice(from, 1)[0]
    newValue.splice(to, 0, item)
    onChange(newValue)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleItemDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveMedia(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const canAddMore = value.length < maxFiles

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <span className="text-xs text-muted-foreground">{value.length}/{maxFiles}</span>
        </div>
      )}

      {/* Galerie existante */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move",
                draggedIndex === index ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border"
              )}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleItemDrop(e, index)}
            >
              {/* Média */}
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={item.url}
                  alt={`Média ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Badge d'ordre */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-black/70 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {index + 1}
              </div>

              {/* Badge type */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                {item.type === 'video' ? <Play className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
              </div>

              {/* Overlay avec actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (index > 0) moveMedia(index, index - 1)
                    }}
                    disabled={index === 0}
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeMedia(index)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (index < value.length - 1) moveMedia(index, index + 1)
                    }}
                    disabled={index === value.length - 1}
                  >
                    →
                  </Button>
                </div>
              </div>

              {/* Handle de drag */}
              <div className="absolute bottom-2 right-2 p-1 bg-black/70 text-white rounded">
                <GripVertical className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      {canAddMore && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-colors aspect-video',
            dragOver ? 'border-primary bg-primary/5' : 'border-border',
            'hover:border-primary/50 cursor-pointer'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center text-center">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Upload en cours...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">Ajouter des médias</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Glissez plusieurs fichiers ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {accept === 'image' && 'Images (JPEG, PNG, WebP)'}
                  {accept === 'video' && 'Vidéos (MP4, WebM)'}
                  {accept === 'all' && 'Images et vidéos supportées'}
                </p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes[accept]}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
        </div>
      )}

      {/* Instructions */}
      {mediaItems.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Glissez les médias pour les réorganiser</p>
          <p>• Le premier média sera l'image principale</p>
          <p>• Utilisez les flèches pour un réordonnancement précis</p>
        </div>
      )}
    </div>
  )
}