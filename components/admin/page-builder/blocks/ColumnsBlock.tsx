'use client'

import { cn } from '@/lib/utils'

interface ColumnsContent {
  columns?: number
  gap?: number
  children?: Array<{ content: string }>
}

interface ColumnsPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function ColumnsPreview({ content, viewMode }: ColumnsPreviewProps) {
  const {
    columns = 2,
    gap = 24,
    children = []
  } = content as ColumnsContent

  const gridColumns = viewMode === 'mobile' ? 1 : columns

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <div
          key={index}
          className="min-h-[100px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center"
        >
          <p className="text-sm text-gray-400">
            Colonne {index + 1}
          </p>
        </div>
      ))}
    </div>
  )
}
