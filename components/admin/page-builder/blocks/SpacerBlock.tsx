'use client'

interface SpacerContent {
  height?: number
}

interface SpacerPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function SpacerPreview({ content, viewMode }: SpacerPreviewProps) {
  const { height = 60 } = content as SpacerContent

  const adjustedHeight = viewMode === 'mobile' ? height * 0.5 : height

  return (
    <div
      className="relative group"
      style={{ height: `${adjustedHeight}px` }}
    >
      {/* Visual indicator in editor */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-400">
        {adjustedHeight}px
      </div>
    </div>
  )
}
