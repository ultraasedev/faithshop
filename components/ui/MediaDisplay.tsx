'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaDisplayProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  showVideoControls?: boolean
  objectFit?: 'cover' | 'contain' | 'fill'
  onClick?: () => void
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  const lowerUrl = url.toLowerCase()
  return videoExtensions.some(ext => lowerUrl.includes(ext))
}

export default function MediaDisplay({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  priority = false,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  showVideoControls = false,
  objectFit = 'cover',
  onClick,
}: MediaDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isVideo = isVideoUrl(src)

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  if (isVideo) {
    return (
      <div className={cn("relative", fill && "absolute inset-0")} onClick={onClick}>
        <video
          ref={videoRef}
          src={src}
          className={cn(
            "w-full h-full",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            className
          )}
          autoPlay={autoPlay}
          loop={loop}
          muted={isMuted}
          playsInline
          controls={controls}
          style={!fill && width && height ? { width, height } : undefined}
        />

        {showVideoControls && (
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Image
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        priority={priority}
        onClick={onClick}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={cn("object-cover", className)}
      priority={priority}
      onClick={onClick}
    />
  )
}
