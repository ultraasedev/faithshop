'use client'

import { cn } from '@/lib/utils'

interface ButtonContent {
  text?: string
  link?: string
  style?: 'solid' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  alignment?: 'left' | 'center' | 'right'
  fullWidth?: boolean
  backgroundColor?: string
  textColor?: string
  borderRadius?: number
  icon?: string
  openInNewTab?: boolean
}

interface ButtonPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function ButtonPreview({ content, viewMode }: ButtonPreviewProps) {
  const {
    text = 'Cliquez ici',
    link = '#',
    style = 'solid',
    size = 'medium',
    alignment = 'center',
    fullWidth = false,
    backgroundColor = '#000000',
    textColor = '#ffffff',
    borderRadius = 8,
    openInNewTab = false
  } = content as ButtonContent

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  }

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  const getButtonStyle = () => {
    if (style === 'solid') {
      return {
        backgroundColor,
        color: textColor,
        borderRadius: `${borderRadius}px`
      }
    } else if (style === 'outline') {
      return {
        backgroundColor: 'transparent',
        color: backgroundColor,
        border: `2px solid ${backgroundColor}`,
        borderRadius: `${borderRadius}px`
      }
    } else {
      return {
        backgroundColor: 'transparent',
        color: backgroundColor,
        borderRadius: `${borderRadius}px`
      }
    }
  }

  return (
    <div className={cn('flex', alignmentClasses[alignment])}>
      <a
        href={link}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        style={getButtonStyle()}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all hover:opacity-80',
          sizeClasses[size],
          fullWidth && 'w-full'
        )}
      >
        {text}
      </a>
    </div>
  )
}
