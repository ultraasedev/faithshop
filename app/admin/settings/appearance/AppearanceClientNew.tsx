'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Palette,
  Globe,
  Image as ImageIcon,
  Save,
  Eye,
  RefreshCw,
  Monitor,
  Smartphone,
  Settings
} from 'lucide-react'
import MediaUploader from '@/components/admin/MediaUploader'
import { upsertTheme, upsertSiteConfig, getSiteConfigs, getThemes } from '@/app/actions/admin/settings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ThemePreset {
  name: string
  label: string
  primary: string
  secondary: string
  background: string
  accent: string
}

const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'classic',
    label: 'Classique',
    primary: '#000000',
    secondary: '#ffffff',
    background: '#ffffff',
    accent: '#666666'
  },
  {
    name: 'modern',
    label: 'Moderne',
    primary: '#1a1a1a',
    secondary: '#f8f8f8',
    background: '#ffffff',
    accent: '#3b82f6'
  },
  {
    name: 'elegant',
    label: 'Élégant',
    primary: '#2c2c2c',
    secondary: '#f5f5f5',
    background: '#fafafa',
    accent: '#8b5a3c'
  },
  {
    name: 'bold',
    label: 'Audacieux',
    primary: '#dc2626',
    secondary: '#ffffff',
    background: '#ffffff',
    accent: '#1f2937'
  }
]

export default function AppearanceClientNew() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Site général
  const [siteName, setSiteName] = useState('')
  const [siteDescription, setSiteDescription] = useState('')

  // Homepage
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [heroImage, setHeroImage] = useState('')

  // Thème
  const [selectedPreset, setSelectedPreset] = useState('classic')
  const [customColors, setCustomColors] = useState({
    primary: '#000000',
    secondary: '#ffffff',
    background: '#ffffff',
    accent: '#666666'
  })

  useEffect(() => {
    async function loadData() {
      try {
        const configs = await getSiteConfigs()

        const configMap = configs.reduce((acc, c) => {
          acc[c.key] = c.value
          return acc
        }, {} as Record<string, string>)

        setSiteName(configMap['site_name'] || '')
        setSiteDescription(configMap['site_description'] || '')
        setHeroTitle(configMap['home_hero_title'] || '')
        setHeroSubtitle(configMap['home_hero_subtitle'] || '')
        setHeroImage(configMap['home_hero_image'] || '')

      } catch (error) {
        console.error('Failed to load settings', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handlePresetChange = (preset: ThemePreset) => {
    setSelectedPreset(preset.name)
    setCustomColors({
      primary: preset.primary,
      secondary: preset.secondary,
      background: preset.background,
      accent: preset.accent
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Sauvegarder les configs du site
      const configUpdates = [
        { key: 'site_name', value: siteName, type: 'text', category: 'general' },
        { key: 'site_description', value: siteDescription, type: 'text', category: 'general' },
        { key: 'home_hero_title', value: heroTitle, type: 'text', category: 'homepage' },
        { key: 'home_hero_subtitle', value: heroSubtitle, type: 'text', category: 'homepage' },
        { key: 'home_hero_image', value: heroImage, type: 'media', category: 'homepage' },
        { key: 'theme_preset', value: selectedPreset, type: 'text', category: 'theme' }
      ]

      await Promise.all(configUpdates.map(c => upsertSiteConfig(c)))

      // Sauvegarder le thème
      await upsertTheme({
        name: 'light',
        isDefault: true,
        primaryColor: customColors.primary,
        secondaryColor: customColors.secondary,
        accentColor: customColors.accent,
        backgroundColor: customColors.background,
        textColor: customColors.primary,
        mutedColor: '#6b7280',
        borderColor: '#e5e7eb'
      })

      toast.success('Paramètres sauvegardés avec succès !')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personnalisation</h1>
          <p className="text-muted-foreground">Configurez l'apparence et le contenu de votre boutique</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="homepage" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Page d'accueil
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Style & Couleurs
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom de la boutique
                </label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Faith Shop"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ce nom apparaîtra dans le titre du navigateur et sur les réseaux sociaux
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description du site
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Découvrez notre collection de vêtements inspirés par la foi..."
                  className="w-full p-3 border border-input rounded-md resize-none text-sm bg-background"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Description pour les moteurs de recherche et réseaux sociaux
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Page d'accueil */}
        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Section Hero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image de fond
                </label>
                <MediaUploader
                  value={heroImage}
                  onChange={setHeroImage}
                  folder="hero"
                  title="Choisir une image hero"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Image principale affichée sur la page d'accueil (recommandé: 1920x1080px)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Titre principal
                  </label>
                  <Input
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Faith Shop - Mode Chrétienne"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sous-titre
                  </label>
                  <Input
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Vêtements inspirés par la foi"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Thème */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Styles prédéfinis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetChange(preset)}
                    className={`p-4 border-2 rounded-lg transition-all hover:scale-105 ${
                      selectedPreset === preset.name
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-1 mb-3 justify-center">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.background }}
                      />
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <p className="text-sm font-medium">{preset.label}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personnalisation avancée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Couleur principale
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({...customColors, primary: e.target.value})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({...customColors, primary: e.target.value})}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Arrière-plan
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => setCustomColors({...customColors, background: e.target.value})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={customColors.background}
                      onChange={(e) => setCustomColors({...customColors, background: e.target.value})}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Couleur secondaire
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors({...customColors, secondary: e.target.value})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors({...customColors, secondary: e.target.value})}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Couleur d'accent
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({...customColors, accent: e.target.value})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={customColors.accent}
                      onChange={(e) => setCustomColors({...customColors, accent: e.target.value})}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}