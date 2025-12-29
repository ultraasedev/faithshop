'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save, Image as ImageIcon, Upload } from 'lucide-react'

interface HomepageConfig {
  home_hero_title: string
  home_hero_subtitle: string
  home_hero_image: string
  home_hero_cta_text: string
  home_hero_cta_link: string
}

export default function HomepageEditorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [config, setConfig] = useState<HomepageConfig>({
    home_hero_title: '',
    home_hero_subtitle: '',
    home_hero_image: '',
    home_hero_cta_text: '',
    home_hero_cta_link: ''
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/homepage-config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (res.ok) {
        toast.success('Homepage mise à jour')
        router.refresh()
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setConfig(prev => ({ ...prev, home_hero_image: data.url }))
        toast.success('Image uploadée')
      } else {
        toast.error('Erreur lors de l\'upload')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Page d'Accueil</h1>
            <p className="text-muted-foreground">Personnalisez le hero et le contenu de la homepage</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer
          </Button>
        </div>

        {/* Hero Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu du Hero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[21/9] bg-gray-900 rounded-lg overflow-hidden">
              {config.home_hero_image ? (
                <Image
                  src={config.home_hero_image}
                  alt="Hero preview"
                  fill
                  className="object-cover opacity-70"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                <p className="text-xs uppercase tracking-widest mb-2 opacity-80">
                  {config.home_hero_subtitle || 'Sous-titre'}
                </p>
                <h2 className="text-2xl md:text-4xl font-serif mb-4">
                  {config.home_hero_title || 'Titre du Hero'}
                </h2>
                <span className="px-4 py-2 bg-white text-black text-sm">
                  {config.home_hero_cta_text || 'Bouton'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du Hero</CardTitle>
            <CardDescription>Configurez l'image et le texte du hero</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image */}
            <div className="space-y-2">
              <Label>Image de fond</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    value={config.home_hero_image}
                    onChange={(e) => setConfig(prev => ({ ...prev, home_hero_image: e.target.value }))}
                    placeholder="URL de l'image ou uploadez"
                  />
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button variant="outline" asChild disabled={uploading}>
                    <span>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload
                    </span>
                  </Button>
                </label>
              </div>
              {config.home_hero_image && (
                <div className="mt-2 relative w-32 h-20 rounded overflow-hidden">
                  <Image
                    src={config.home_hero_image}
                    alt="Current hero"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={config.home_hero_title}
                onChange={(e) => setConfig(prev => ({ ...prev, home_hero_title: e.target.value }))}
                placeholder="L'Élégance de la Foi"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label>Sous-titre</Label>
              <Input
                value={config.home_hero_subtitle}
                onChange={(e) => setConfig(prev => ({ ...prev, home_hero_subtitle: e.target.value }))}
                placeholder="Collection 2025"
              />
            </div>

            {/* CTA Text */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texte du bouton</Label>
                <Input
                  value={config.home_hero_cta_text}
                  onChange={(e) => setConfig(prev => ({ ...prev, home_hero_cta_text: e.target.value }))}
                  placeholder="Découvrir"
                />
              </div>
              <div className="space-y-2">
                <Label>Lien du bouton</Label>
                <Input
                  value={config.home_hero_cta_link}
                  onChange={(e) => setConfig(prev => ({ ...prev, home_hero_cta_link: e.target.value }))}
                  placeholder="/shop"
                />
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
