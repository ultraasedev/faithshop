'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface TabItem {
  title: string
  content: string
}

interface AccordionTabsContent {
  title?: string
  mode?: 'accordion' | 'tabs'
  items?: TabItem[]
  allowMultiple?: boolean
  defaultOpen?: number
}

interface AccordionTabsPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function AccordionTabsPreview({ content, viewMode }: AccordionTabsPreviewProps) {
  const {
    title,
    mode = 'accordion',
    items = [],
    allowMultiple = false,
    defaultOpen = 0
  } = content as AccordionTabsContent

  const [activeTab, setActiveTab] = useState(defaultOpen)
  const [openAccordions, setOpenAccordions] = useState<number[]>([defaultOpen])

  const toggleAccordion = (index: number) => {
    if (allowMultiple) {
      setOpenAccordions(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      )
    } else {
      setOpenAccordions(prev =>
        prev.includes(index) ? [] : [index]
      )
    }
  }

  if (mode === 'tabs') {
    return (
      <div className="w-full">
        {title && (
          <h2 className={cn(
            "font-bold mb-6 text-center",
            viewMode === 'desktop' && "text-3xl",
            viewMode === 'tablet' && "text-2xl",
            viewMode === 'mobile' && "text-xl"
          )}>
            {title}
          </h2>
        )}

        {/* Tab Headers */}
        <div className={cn(
          "flex border-b border-gray-200 dark:border-gray-700 mb-6",
          viewMode === 'mobile' && "flex-wrap"
        )}>
          {(items as TabItem[]).map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px",
                activeTab === index
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="prose dark:prose-invert max-w-none">
          {items[activeTab] && (
            <div dangerouslySetInnerHTML={{ __html: items[activeTab].content }} />
          )}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Ajoutez des onglets
          </div>
        )}
      </div>
    )
  }

  // Accordion mode
  return (
    <div className="w-full">
      {title && (
        <h2 className={cn(
          "font-bold mb-6 text-center",
          viewMode === 'desktop' && "text-3xl",
          viewMode === 'tablet' && "text-2xl",
          viewMode === 'mobile' && "text-xl"
        )}>
          {title}
        </h2>
      )}

      <div className="space-y-2">
        {(items as TabItem[]).map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full px-4 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-left">{item.title}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  openAccordions.includes(index) && "rotate-180"
                )}
              />
            </button>
            {openAccordions.includes(index) && (
              <div className="px-4 py-4 prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Ajoutez des éléments
        </div>
      )}
    </div>
  )
}
