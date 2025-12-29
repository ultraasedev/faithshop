'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'richtext'
  placeholder?: string
  rows?: number
}

interface PageContentEditorProps {
  pageSlug: string
  pageTitle: string
  fields: FieldConfig[]
  initialValues: Record<string, string>
  onSave: (values: Record<string, string>) => Promise<{ success: boolean; error?: string }>
}

export function PageContentEditor({
  pageSlug,
  pageTitle,
  fields,
  initialValues,
  onSave
}: PageContentEditorProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const result = await onSave(values)
      if (result.success) {
        setMessage({ type: 'success', text: 'Modifications enregistrées avec succès' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de la sauvegarde' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (key: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'pages')

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        handleChange(key, data.url)
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">/{pageSlug}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-lg border">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>

            {field.type === 'text' && (
              <Input
                id={field.key}
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )}

            {field.type === 'textarea' && (
              <Textarea
                id={field.key}
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 4}
              />
            )}

            {field.type === 'image' && (
              <div className="space-y-2">
                {values[field.key] && (
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={values[field.key]}
                      alt={field.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={values[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder="URL de l'image ou télécharger"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(field.key, file)
                      }}
                    />
                    <Button type="button" variant="outline" asChild>
                      <span><ImageIcon className="w-4 h-4" /></span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </form>
    </div>
  )
}
