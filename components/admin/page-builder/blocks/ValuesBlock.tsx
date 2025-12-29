'use client'

import { cn } from '@/lib/utils'

interface ValueItem {
  title: string
  text: string
}

interface ValuesContent {
  values?: ValueItem[]
  backgroundColor?: string
  textColor?: string
}

interface ValuesBlockPreviewProps {
  content: Record<string, unknown>
  viewMode?: 'desktop' | 'tablet' | 'mobile'
}

export function ValuesBlockPreview({ content, viewMode = 'desktop' }: ValuesBlockPreviewProps) {
  const c = content as ValuesContent

  const defaultValues: ValueItem[] = [
    { title: 'Éthique', text: "Nous privilégions des matières biologiques et une production responsable." },
    { title: 'Qualité', text: "Des cotons épais, des coutures renforcées et des finitions impeccables." },
    { title: 'Communauté', text: "Faith Shop rassemble ceux qui croient en quelque chose de plus grand." }
  ]

  const values = c.values?.length ? c.values : defaultValues
  const backgroundColor = c.backgroundColor || 'hsl(var(--foreground))'
  const textColor = c.textColor || 'hsl(var(--background))'

  const isMobile = viewMode === 'mobile'

  return (
    <div
      className="py-24 md:py-32"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "grid gap-12 text-center",
          isMobile ? "grid-cols-1" : "md:grid-cols-3"
        )}>
          {values.map((value, index) => (
            <div key={index} className="space-y-6">
              <span
                className="text-6xl font-serif opacity-20"
                style={{ color: textColor }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3
                className="text-xl font-bold uppercase tracking-widest"
                style={{ color: textColor }}
              >
                {value.title}
              </h3>
              <p
                className="leading-relaxed opacity-70"
                style={{ color: textColor }}
              >
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
