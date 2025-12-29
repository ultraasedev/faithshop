'use client'

import { cn } from '@/lib/utils'

interface TextContent {
  content?: string
  alignment?: 'left' | 'center' | 'right'
  // Legacy field names
  title?: string
  text?: string
}

interface TextBlockPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function TextBlockPreview({ content, viewMode }: TextBlockPreviewProps) {
  const c = content as TextContent
  // Support both new and legacy field names
  // Legacy format: { title, text } -> Convert to HTML
  let textContent = c.content
  if (!textContent && (c.title || c.text)) {
    const parts: string[] = []
    if (c.title) parts.push(`<h2 class="text-2xl font-bold mb-4">${c.title}</h2>`)
    if (c.text) parts.push(`<p>${c.text}</p>`)
    textContent = parts.join('')
  }
  if (!textContent) textContent = '<p>Votre texte ici...</p>'
  const alignment = c.alignment || 'left'

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
