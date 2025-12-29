'use client'

import { cn } from '@/lib/utils'
import {
  Truck, Shield, CreditCard, Headphones, Gift, Clock,
  Star, Heart, Zap, Award, Check, Package
} from 'lucide-react'

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  truck: Truck,
  shield: Shield,
  creditCard: CreditCard,
  headphones: Headphones,
  gift: Gift,
  clock: Clock,
  star: Star,
  heart: Heart,
  zap: Zap,
  award: Award,
  check: Check,
  package: Package
}

interface FeatureItem {
  icon: string
  title: string
  description: string
  link?: string
}

interface FeaturesContent {
  title?: string
  subtitle?: string
  items?: FeatureItem[]
  columns?: 2 | 3 | 4
  layout?: 'cards' | 'minimal' | 'centered'
  iconColor?: string
  iconSize?: 'small' | 'medium' | 'large'
}

interface FeaturesPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function FeaturesPreview({ content, viewMode }: FeaturesPreviewProps) {
  const {
    title,
    subtitle,
    items = [],
    columns = 3,
    layout = 'cards',
    iconColor = '#000000',
    iconSize = 'medium'
  } = content as FeaturesContent

  const iconSizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-10 w-10',
    large: 'h-14 w-14'
  }

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
        {(items as FeatureItem[]).map((item, index) => {
          const Icon = iconMap[item.icon] || Check

          if (layout === 'cards') {
            return (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
              >
                <div
                  className={cn(
                    "mb-4 inline-flex items-center justify-center rounded-lg p-3",
                    "bg-gray-100 dark:bg-gray-700"
                  )}
                >
                  <Icon className={iconSizeClasses[iconSize]} style={{ color: iconColor }} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            )
          }

          if (layout === 'centered') {
            return (
              <div key={index} className="text-center p-4">
                <div className="mb-4 inline-flex items-center justify-center">
                  <Icon className={iconSizeClasses[iconSize]} style={{ color: iconColor }} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            )
          }

          // minimal
          return (
            <div key={index} className="flex items-start gap-4 p-4">
              <Icon className={iconSizeClasses[iconSize]} style={{ color: iconColor }} />
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Ajoutez des fonctionnalités
        </div>
      )}
    </div>
  )
}
