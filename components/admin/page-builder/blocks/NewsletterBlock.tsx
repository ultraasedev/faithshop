'use client'

import { cn } from '@/lib/utils'
import { Mail } from 'lucide-react'

interface NewsletterContent {
  title?: string
  description?: string
  buttonText?: string
  backgroundColor?: string
}

interface NewsletterPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function NewsletterPreview({ content, viewMode }: NewsletterPreviewProps) {
  const {
    title = 'Restez informé',
    description = 'Inscrivez-vous à notre newsletter pour recevoir nos dernières actualités et offres exclusives.',
    buttonText = "S'inscrire",
    backgroundColor = '#000000'
  } = content as NewsletterContent

  const isLightBg = isLightColor(backgroundColor)

  return (
    <div
      className="rounded-xl p-8 md:p-12"
      style={{ backgroundColor }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <div
          className={cn(
            "inline-flex items-center justify-center w-12 h-12 rounded-full mb-6",
            isLightBg ? "bg-black/10" : "bg-white/10"
          )}
        >
          <Mail className={cn("h-6 w-6", isLightBg ? "text-black" : "text-white")} />
        </div>

        <h2
          className={cn(
            "font-bold mb-4",
            isLightBg ? "text-gray-900" : "text-white",
            viewMode === 'desktop' && "text-3xl",
            viewMode === 'tablet' && "text-2xl",
            viewMode === 'mobile' && "text-xl"
          )}
        >
          {title}
        </h2>

        <p
          className={cn(
            "mb-8",
            isLightBg ? "text-gray-600" : "text-white/80"
          )}
        >
          {description}
        </p>

        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Votre email"
            className={cn(
              "flex-1 px-4 py-3 rounded-lg border-0",
              isLightBg
                ? "bg-white text-gray-900 placeholder-gray-400"
                : "bg-white/10 text-white placeholder-white/60"
            )}
          />
          <button
            type="submit"
            className={cn(
              "px-6 py-3 font-semibold rounded-lg transition-colors",
              isLightBg
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-white text-gray-900 hover:bg-gray-100"
            )}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  )
}

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}
