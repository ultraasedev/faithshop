'use client'

interface DividerContent {
  style?: 'solid' | 'dashed' | 'dotted'
  color?: string
  width?: number
}

interface DividerPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function DividerPreview({ content }: DividerPreviewProps) {
  const {
    style = 'solid',
    color = '#e5e7eb',
    width = 1
  } = content as DividerContent

  return (
    <hr
      style={{
        borderStyle: style,
        borderColor: color,
        borderWidth: `${width}px 0 0 0`
      }}
      className="w-full"
    />
  )
}
