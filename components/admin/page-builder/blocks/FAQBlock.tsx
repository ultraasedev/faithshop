'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQContent {
  title?: string
  items?: FAQItem[]
}

interface FAQPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function FAQPreview({ content, viewMode }: FAQPreviewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const {
    title = 'Questions fréquentes',
    items = [
      { question: 'Comment puis-je suivre ma commande ?', answer: 'Vous pouvez suivre votre commande depuis votre espace client ou via le lien envoyé par email.' },
      { question: 'Quels sont les délais de livraison ?', answer: 'Les délais de livraison sont généralement de 2 à 5 jours ouvrés pour la France métropolitaine.' },
      { question: 'Comment effectuer un retour ?', answer: 'Vous disposez de 30 jours pour retourner un article. Contactez-nous pour obtenir une étiquette de retour.' }
    ]
  } = content as FAQContent

  return (
    <div className="max-w-3xl mx-auto">
      {title && (
        <h2 className={cn(
          "font-bold mb-8 text-center",
          viewMode === 'desktop' && "text-3xl",
          viewMode === 'tablet' && "text-2xl",
          viewMode === 'mobile' && "text-xl"
        )}>
          {title}
        </h2>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-gray-500 flex-shrink-0 transition-transform",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                openIndex === index ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="p-4 pt-0 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
