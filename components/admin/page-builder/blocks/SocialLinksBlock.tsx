'use client'

import { cn } from '@/lib/utils'

interface SocialLink {
  platform: string
  url: string
}

interface SocialLinksContent {
  title?: string
  links?: SocialLink[]
  style?: 'icons' | 'buttons' | 'pills'
  size?: 'small' | 'medium' | 'large'
  alignment?: 'left' | 'center' | 'right'
  color?: 'brand' | 'dark' | 'light' | 'custom'
  customColor?: string
}

interface SocialLinksPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

const socialIcons: Record<string, { icon: string; color: string; name: string }> = {
  facebook: { icon: 'f', color: '#1877F2', name: 'Facebook' },
  instagram: { icon: 'i', color: '#E4405F', name: 'Instagram' },
  twitter: { icon: 't', color: '#1DA1F2', name: 'Twitter' },
  x: { icon: 'X', color: '#000000', name: 'X' },
  linkedin: { icon: 'in', color: '#0A66C2', name: 'LinkedIn' },
  youtube: { icon: 'yt', color: '#FF0000', name: 'YouTube' },
  tiktok: { icon: 'tk', color: '#000000', name: 'TikTok' },
  pinterest: { icon: 'p', color: '#BD081C', name: 'Pinterest' },
  whatsapp: { icon: 'wa', color: '#25D366', name: 'WhatsApp' },
  telegram: { icon: 'tg', color: '#0088CC', name: 'Telegram' },
  snapchat: { icon: 'sc', color: '#FFFC00', name: 'Snapchat' },
  discord: { icon: 'dc', color: '#5865F2', name: 'Discord' }
}

export function SocialLinksPreview({ content, viewMode }: SocialLinksPreviewProps) {
  const {
    title,
    links = [],
    style = 'icons',
    size = 'medium',
    alignment = 'center',
    color = 'brand',
    customColor = '#000000'
  } = content as SocialLinksContent

  const sizeClasses = {
    small: 'h-8 w-8 text-sm',
    medium: 'h-10 w-10 text-base',
    large: 'h-12 w-12 text-lg'
  }

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  const getColor = (platform: string) => {
    if (color === 'brand') return socialIcons[platform]?.color || '#000000'
    if (color === 'dark') return '#000000'
    if (color === 'light') return '#ffffff'
    return customColor
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className={cn(
          "font-semibold mb-6 text-center",
          viewMode === 'desktop' && "text-xl",
          viewMode !== 'desktop' && "text-lg"
        )}>
          {title}
        </h3>
      )}

      <div className={cn('flex flex-wrap gap-3', alignmentClasses[alignment])}>
        {(links as SocialLink[]).map((link, index) => {
          const social = socialIcons[link.platform] || { icon: '?', color: '#666', name: link.platform }
          const bgColor = getColor(link.platform)

          if (style === 'icons') {
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center rounded-full transition-transform hover:scale-110",
                  sizeClasses[size]
                )}
                style={{ backgroundColor: bgColor, color: '#fff' }}
              >
                <span className="font-bold">{social.icon}</span>
              </a>
            )
          }

          if (style === 'buttons') {
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-80",
                  size === 'small' && "text-sm",
                  size === 'large' && "text-lg px-6 py-3"
                )}
                style={{ backgroundColor: bgColor, color: '#fff' }}
              >
                <span className="font-bold">{social.icon}</span>
                <span>{social.name}</span>
              </a>
            )
          }

          // pills
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all hover:scale-105",
                size === 'small' && "text-sm px-3 py-1",
                size === 'large' && "text-lg px-5 py-2"
              )}
              style={{ borderColor: bgColor, color: bgColor }}
            >
              <span className="font-bold">{social.icon}</span>
              <span>{social.name}</span>
            </a>
          )
        })}
      </div>

      {links.length === 0 && (
        <div className={cn('flex gap-3', alignmentClasses[alignment])}>
          <div className={cn("rounded-full bg-gray-200 dark:bg-gray-700", sizeClasses[size])} />
          <div className={cn("rounded-full bg-gray-200 dark:bg-gray-700", sizeClasses[size])} />
          <div className={cn("rounded-full bg-gray-200 dark:bg-gray-700", sizeClasses[size])} />
        </div>
      )}
    </div>
  )
}
