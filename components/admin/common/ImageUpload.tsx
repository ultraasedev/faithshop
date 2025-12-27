'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  type: string // collection, settings, product, etc.
  label?: string
  placeholder?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
}

export function ImageUpload({
  value,
  onChange,
  type,
  label,
  placeholder = 'Aucune image',
  className,
  aspectRatio = 'auto'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Seuls les fichiers image sont autorisés')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5MB)')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload')
      }

      onChange(data.url)
      toast.success('Image uploadée')
    } catch (error) {
      console.error('Erreur upload:', error)
      toast.error('Erreur lors de l\'upload de l\'image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'min-h-32'
  }[aspectRatio]

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg overflow-hidden transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800',
          'hover:border-gray-300 dark:hover:border-gray-700',
          aspectClass
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                Changer
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onChange('')}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full p-6 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                <p className="text-sm text-gray-500">Upload en cours...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Glissez-déposez ou cliquez pour sélectionner
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileChange(file)
          }}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  )
}
