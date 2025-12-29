'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface PricingPlan {
  name: string
  description?: string
  price: number
  currency?: string
  period?: string
  features: string[]
  buttonText?: string
  buttonLink?: string
  highlighted?: boolean
  badge?: string
}

interface PricingContent {
  title?: string
  subtitle?: string
  plans?: PricingPlan[]
  columns?: 2 | 3 | 4
  style?: 'cards' | 'minimal' | 'bordered'
}

interface PricingPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function PricingPreview({ content, viewMode }: PricingPreviewProps) {
  const {
    title,
    subtitle,
    plans = [],
    columns = 3,
    style = 'cards'
  } = content as PricingContent

  const getColumns = () => {
    if (viewMode === 'mobile') return 1
    if (viewMode === 'tablet') return Math.min(columns, 2)
    return columns
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className={cn(
              "font-bold",
              viewMode === 'desktop' && "text-3xl mb-4",
              viewMode === 'tablet' && "text-2xl mb-3",
              viewMode === 'mobile' && "text-xl mb-2"
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${getColumns()}, minmax(0, 1fr))` }}
      >
        {(plans as PricingPlan[]).map((plan, index) => (
          <div
            key={index}
            className={cn(
              "relative rounded-2xl p-6 transition-all",
              style === 'cards' && "bg-white dark:bg-gray-800 shadow-lg",
              style === 'bordered' && "border-2 border-gray-200 dark:border-gray-700",
              style === 'minimal' && "border border-gray-100 dark:border-gray-800",
              plan.highlighted && "ring-2 ring-black dark:ring-white scale-105"
            )}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                {plan.badge}
              </span>
            )}

            <div className="text-center mb-6">
              <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
              {plan.description && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {plan.description}
                </p>
              )}
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-bold">
                {plan.currency || '€'}{plan.price}
              </span>
              {plan.period && (
                <span className="text-gray-500 dark:text-gray-400">
                  /{plan.period}
                </span>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href={plan.buttonLink || '#'}
              className={cn(
                "block w-full py-3 px-6 text-center font-semibold rounded-lg transition-colors",
                plan.highlighted
                  ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              )}
            >
              {plan.buttonText || 'Choisir'}
            </a>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center"
            >
              <div className="h-6 w-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded mb-4" />
              <div className="h-10 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded mb-6" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
