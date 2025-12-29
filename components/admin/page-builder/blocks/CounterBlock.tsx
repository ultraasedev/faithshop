'use client'

import { cn } from '@/lib/utils'

interface CounterItem {
  value: number
  suffix?: string
  prefix?: string
  label: string
}

interface CounterContent {
  title?: string
  items?: CounterItem[]
  columns?: 2 | 3 | 4
  style?: 'default' | 'cards' | 'minimal'
  valueColor?: string
  animated?: boolean
}

interface CounterPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function CounterPreview({ content, viewMode }: CounterPreviewProps) {
  const {
    title,
    items = [],
    columns = 4,
    style = 'default',
    valueColor = '#000000'
  } = content as CounterContent

  const getColumns = () => {
    if (viewMode === 'mobile') return 2
    if (viewMode === 'tablet') return Math.min(columns, 3)
    return columns
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className={cn(
          "font-bold mb-10 text-center",
          viewMode === 'desktop' && "text-3xl",
          viewMode === 'tablet' && "text-2xl",
          viewMode === 'mobile' && "text-xl"
        )}>
          {title}
        </h2>
      )}

      <div
        className={cn(
          "grid gap-6",
          style === 'cards' && "gap-4"
        )}
        style={{ gridTemplateColumns: `repeat(${getColumns()}, minmax(0, 1fr))` }}
      >
        {(items as CounterItem[]).map((item, index) => {
          if (style === 'cards') {
            return (
              <div
                key={index}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center"
              >
                <div
                  className={cn(
                    "font-bold",
                    viewMode === 'desktop' && "text-4xl",
                    viewMode === 'tablet' && "text-3xl",
                    viewMode === 'mobile' && "text-2xl"
                  )}
                  style={{ color: valueColor }}
                >
                  {item.prefix}{formatNumber(item.value)}{item.suffix}
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">
                  {item.label}
                </p>
              </div>
            )
          }

          if (style === 'minimal') {
            return (
              <div key={index} className="text-center">
                <div
                  className={cn(
                    "font-bold",
                    viewMode === 'desktop' && "text-5xl",
                    viewMode === 'tablet' && "text-4xl",
                    viewMode === 'mobile' && "text-3xl"
                  )}
                  style={{ color: valueColor }}
                >
                  {item.prefix}{formatNumber(item.value)}{item.suffix}
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400 uppercase tracking-wide text-sm">
                  {item.label}
                </p>
              </div>
            )
          }

          // default
          return (
            <div key={index} className="text-center py-4">
              <div
                className={cn(
                  "font-bold mb-2",
                  viewMode === 'desktop' && "text-5xl",
                  viewMode === 'tablet' && "text-4xl",
                  viewMode === 'mobile' && "text-3xl"
                )}
                style={{ color: valueColor }}
              >
                {item.prefix}{formatNumber(item.value)}{item.suffix}
              </div>
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {item.label}
              </p>
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center py-4">
              <div className="h-12 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
