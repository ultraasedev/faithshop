'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ImageIcon } from 'lucide-react'

interface ImageContent {
  src?: string
  alt?: string
  caption?: string
  width?: 'full' | 'large' | 'medium' | 'small'
  link?: string
}

interface ImageBlockPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function ImageBlockPreview({ content, viewMode }: ImageBlockPreviewProps) {
  const {
    src = '',
    alt = '',
    caption = '',
    width = 'full'
  } = content as ImageContent

  const widthClasses = {
    full: 'w-full',
    large: 'max-w-4xl mx-auto',
    medium: 'max-w-2xl mx-auto',
    small: 'max-w-md mx-auto'
  }

  if (!src) {
    return (
      <div className={cn(
        "aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center",
        widthClasses[width]
      )}>
        <div className="text-center text-gray-400">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Aucune image sélectionnée</p>
        </div>
      </div>
    )
  }

  return (
    <figure className={widthClasses[width]}>
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
