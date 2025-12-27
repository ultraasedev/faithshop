'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ImageIcon } from 'lucide-react'

interface GalleryContent {
  images?: string[]
  columns?: number
  gap?: number
  lightbox?: boolean
}

interface GalleryBlockPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function GalleryBlockPreview({ content, viewMode }: GalleryBlockPreviewProps) {
  const {
    images = [],
    columns = 3,
    gap = 16,
    lightbox = true
  } = content as GalleryContent

  const gridColumns = viewMode === 'mobile' ? 2 : columns

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Aucune image dans la galerie</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
        >
          <Image
            src={image}
            alt={`Image ${index + 1}`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ))}
    </div>
  )
}
