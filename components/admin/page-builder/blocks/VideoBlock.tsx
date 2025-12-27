'use client'

import { cn } from '@/lib/utils'
import { Video as VideoIcon } from 'lucide-react'

interface VideoContent {
  type?: 'youtube' | 'vimeo' | 'upload'
  url?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}

interface VideoBlockPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function VideoBlockPreview({ content, viewMode }: VideoBlockPreviewProps) {
  const {
    type = 'youtube',
    url = '',
    autoplay = false,
    loop = false,
    muted = true
  } = content as VideoContent

  if (!url) {
    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <VideoIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Aucune vidéo sélectionnée</p>
        </div>
      </div>
    )
  }

  // Extract video ID for embeds
  let embedUrl = url
  if (type === 'youtube') {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}`
    }
  } else if (type === 'vimeo') {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
    if (videoId) {
      embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}`
    }
  }

  if (type === 'upload') {
    return (
      <video
        src={url}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls
        className="w-full aspect-video rounded-lg"
      />
    )
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
