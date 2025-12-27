'use client'

import { cn } from '@/lib/utils'

interface TextContent {
  content?: string
  alignment?: 'left' | 'center' | 'right'
}

interface TextBlockPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function TextBlockPreview({ content, viewMode }: TextBlockPreviewProps) {
  const {
    content: textContent = '<p>Votre texte ici...</p>',
    alignment = 'left'
  } = content as TextContent

  return (
    <div
      className={cn(
        "prose prose-gray dark:prose-invert max-w-none",
        alignment === 'center' && "text-center",
        alignment === 'right' && "text-right",
        viewMode === 'mobile' && "prose-sm"
      )}
      dangerouslySetInnerHTML={{ __html: textContent }}
    />
  )
}
