'use client'

import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'

interface MapContent {
  title?: string
  address?: string
  latitude?: number
  longitude?: number
  zoom?: number
  height?: number
  showMarker?: boolean
  mapStyle?: 'roadmap' | 'satellite' | 'terrain'
}

interface MapPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function MapPreview({ content, viewMode }: MapPreviewProps) {
  const {
    title,
    address = '1 rue de la Paix, 75001 Paris',
    latitude = 48.8566,
    longitude = 2.3522,
    zoom = 15,
    height = 400,
    showMarker = true,
    mapStyle = 'roadmap'
  } = content as MapContent

  // En mode preview, on affiche un placeholder
  // En production, il faudrait intégrer Google Maps ou OpenStreetMap
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`

  return (
    <div className="w-full">
      {title && (
        <h3 className={cn(
          "font-bold mb-4",
          viewMode === 'desktop' && "text-2xl",
          viewMode !== 'desktop' && "text-xl"
        )}>
          {title}
        </h3>
      )}

      <div
        className="relative w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
        style={{ height: `${viewMode === 'mobile' ? Math.min(height, 300) : height}px` }}
      >
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          loading="lazy"
          title="Map"
        />

        {showMarker && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
            <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
          </div>
        )}
      </div>

      {address && (
        <div className="mt-4 flex items-start gap-2 text-gray-600 dark:text-gray-400">
          <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{address}</p>
        </div>
      )}
    </div>
  )
}
