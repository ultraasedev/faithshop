'use client'

import { cn } from '@/lib/utils'

interface ContactFormContent {
  title?: string
  fields?: string[]
  submitText?: string
  successMessage?: string
  // Legacy field names
  description?: string
}

interface ContactFormPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function ContactFormPreview({ content, viewMode }: ContactFormPreviewProps) {
  const c = content as ContactFormContent
  // Support both new and legacy field names
  const title = c.title || 'Contactez-nous'
  const fields = c.fields || ['name', 'email', 'message'] // Default fields if not specified
  const submitText = c.submitText || 'Envoyer'
  const description = c.description

  const fieldConfig: Record<string, { label: string; type: string; placeholder: string }> = {
    name: { label: 'Nom', type: 'text', placeholder: 'Votre nom' },
    email: { label: 'Email', type: 'email', placeholder: 'votre@email.com' },
    phone: { label: 'Téléphone', type: 'tel', placeholder: '+33 6 00 00 00 00' },
    subject: { label: 'Sujet', type: 'text', placeholder: 'Objet de votre message' },
    message: { label: 'Message', type: 'textarea', placeholder: 'Votre message...' },
    order: { label: 'N° de commande', type: 'text', placeholder: 'ORD-XXXXX' }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {title && (
        <h2 className={cn(
          "font-bold text-center",
          description ? "mb-4" : "mb-8",
          viewMode === 'desktop' && "text-3xl",
          viewMode === 'tablet' && "text-2xl",
          viewMode === 'mobile' && "text-xl"
        )}>
          {title}
        </h2>
      )}

      {description && (
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          {description}
        </p>
      )}

      <form className="space-y-6">
        {fields.map((field) => {
          const config = fieldConfig[field]
          if (!config) return null

          return (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {config.label}
              </label>
              {config.type === 'textarea' ? (
                <textarea
                  placeholder={config.placeholder}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                />
              ) : (
                <input
                  type={config.type}
                  placeholder={config.placeholder}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                />
              )}
            </div>
          )
        })}

        <button
          type="submit"
          className="w-full py-3 px-6 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          {submitText}
        </button>
      </form>
    </div>
  )
}
