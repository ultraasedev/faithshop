'use client'

import { cn } from '@/lib/utils'

interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[] // Pour select, checkbox, radio
  width?: 'full' | 'half'
}

interface CustomFormContent {
  title?: string
  description?: string
  fields?: FormField[]
  submitText?: string
  successMessage?: string
  recipient?: string
  buttonColor?: string
  buttonTextColor?: string
}

interface CustomFormPreviewProps {
  content: Record<string, unknown>
  viewMode: 'desktop' | 'tablet' | 'mobile'
}

export function CustomFormPreview({ content, viewMode }: CustomFormPreviewProps) {
  const {
    title = 'Formulaire',
    description,
    fields = [],
    submitText = 'Envoyer',
    buttonColor = '#000000',
    buttonTextColor = '#ffffff'
  } = content as CustomFormContent

  return (
    <div className="max-w-2xl mx-auto">
      {title && (
        <h2 className={cn(
          "font-bold text-center",
          viewMode === 'desktop' && "text-3xl mb-4",
          viewMode === 'tablet' && "text-2xl mb-3",
          viewMode === 'mobile' && "text-xl mb-2"
        )}>
          {title}
        </h2>
      )}

      {description && (
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          {description}
        </p>
      )}

      <form className="space-y-4">
        <div className={cn(
          "grid gap-4",
          viewMode === 'mobile' ? "grid-cols-1" : "grid-cols-2"
        )}>
          {(fields as FormField[]).map((field, index) => (
            <div
              key={field.id || index}
              className={cn(
                field.width === 'half' && viewMode !== 'mobile' ? "col-span-1" : "col-span-2"
              )}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                />
              ) : field.type === 'select' ? (
                <select className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black">
                  <option value="">{field.placeholder || 'Sélectionnez...'}</option>
                  {(field.options || []).map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="space-y-2">
                  {(field.options || []).map((option, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              ) : field.type === 'radio' ? (
                <div className="space-y-2">
                  {(field.options || []).map((option, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={field.id} className="w-4 h-4 border-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              ) : field.type === 'file' ? (
                <div className="w-full px-4 py-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-center">
                  <p className="text-sm text-gray-500">Cliquez ou glissez un fichier ici</p>
                </div>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                />
              )}
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Ajoutez des champs au formulaire
          </div>
        )}

        <button
          type="submit"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          className="w-full py-3 px-6 font-semibold rounded-lg hover:opacity-90 transition-opacity mt-4"
        >
          {submitText}
        </button>
      </form>
    </div>
  )
}
