'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Palette,
  Sun,
  Moon,
  Save,
  Eye,
  RefreshCw
} from 'lucide-react'
import MediaUploader from '@/components/admin/MediaUploader'
import { upsertTheme, upsertSiteConfig, getSiteConfigs, getThemes, setDefaultTheme } from '@/app/actions/admin/settings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ThemeColors {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  mutedColor: string
  borderColor: string
}

interface SiteConfig {
  siteName: string
  siteDescription: string
  logo: string
  favicon: string
  heroTitle: string
  heroSubtitle: string
  heroCtaText: string
  heroImage: string
}

export default function AppearancePage() {
  const router = useRouter()
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [lightTheme, setLightTheme] = useState<ThemeColors>({
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#666666',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    mutedColor: '#6b7280',
    borderColor: '#e5e7eb',
  })

  const [darkTheme, setDarkTheme] = useState<ThemeColors>({
    primaryColor: '#ffffff',
    secondaryColor: '#000000',
    accentColor: '#a3a3a3',
    backgroundColor: '#0a0a0a',
    textColor: '#ffffff',
    mutedColor: '#a3a3a3',
    borderColor: '#262626',
  })

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    siteName: '',
    siteDescription: '',
    logo: '',
    favicon: '',
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: '',
    heroImage: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [configs, themes] = await Promise.all([
          getSiteConfigs(),
          getThemes()
        ])

        // Map configs
        const configMap = configs.reduce((acc, c) => {
          acc[c.key] = c.value
          return acc
        }, {} as Record<string, string>)

        setSiteConfig({
          siteName: configMap['site_name'] || '',
          siteDescription: configMap['site_description'] || '',
          logo: configMap['site_logo'] || '',
          favicon: configMap['site_favicon'] || '',
          heroTitle: configMap['home_hero_title'] || '',
          heroSubtitle: configMap['home_hero_subtitle'] || '',
          heroCtaText: configMap['home_hero_cta_text'] || '',
          heroImage: configMap['home_hero_image'] || '',
        })

        // Map themes
        const light = themes.find(t => t.name === 'light')
        if (light) {
          setLightTheme({
            primaryColor: light.primaryColor,
            secondaryColor: light.secondaryColor,
            accentColor: light.accentColor,
            backgroundColor: light.backgroundColor,
            textColor: light.textColor,
            mutedColor: light.mutedColor,
            borderColor: light.borderColor,
          })
          if (light.isDefault) setActiveTheme('light')
        }

        const dark = themes.find(t => t.name === 'dark')
        if (dark) {
          setDarkTheme({
            primaryColor: dark.primaryColor,
            secondaryColor: dark.secondaryColor,
            accentColor: dark.accentColor,
            backgroundColor: dark.backgroundColor,
            textColor: dark.textColor,
            mutedColor: dark.mutedColor,
            borderColor: dark.borderColor,
          })
          if (dark.isDefault) setActiveTheme('dark')
        }

      } catch (error) {
        console.error('Failed to load settings', error)
        toast.error('Erreur lors du chargement des paramètres')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const currentTheme = activeTheme === 'light' ? lightTheme : darkTheme
  const setCurrentTheme = activeTheme === 'light' ? setLightTheme : setDarkTheme

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setCurrentTheme((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save Site Configs
      const configUpdates = [
        { key: 'site_name', value: siteConfig.siteName, type: 'text', category: 'general' },
        { key: 'site_description', value: siteConfig.siteDescription, type: 'text', category: 'general' },
        { key: 'home_hero_title', value: siteConfig.heroTitle, type: 'text', category: 'homepage' },
        { key: 'home_hero_subtitle', value: siteConfig.heroSubtitle, type: 'text', category: 'homepage' },
        { key: 'home_hero_cta_text', value: siteConfig.heroCtaText, type: 'text', category: 'homepage' },
        { key: 'home_hero_image', value: siteConfig.heroImage, type: 'media', category: 'homepage' },
      ]

      await Promise.all(configUpdates.map(c => upsertSiteConfig(c)))

      // Save Theme
      await upsertTheme({
        name: activeTheme,
        isDefault: true, // Set current editing theme as default for now
        ...currentTheme
      })

      toast.success('Paramètres enregistrés avec succès')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const colorFields: Array<{ key: keyof ThemeColors; label: string }> = [
    { key: 'primaryColor', label: 'Couleur principale' },
    { key: 'secondaryColor', label: 'Couleur secondaire' },
    { key: 'accentColor', label: 'Couleur d\'accent' },
    { key: 'backgroundColor', label: 'Arrière-plan' },
    { key: 'textColor', label: 'Texte' },
    { key: 'mutedColor', label: 'Texte secondaire' },
    { key: 'borderColor', label: 'Bordures' },
  ]

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Personnalisation</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Voir le site
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer les modifications
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Infos générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom du site</label>
              <Input
                value={siteConfig.siteName}
                onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={siteConfig.siteDescription}
                onChange={(e) => setSiteConfig({ ...siteConfig, siteDescription: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Homepage Hero */}
        <Card>
          <CardHeader>
            <CardTitle>Page d'accueil (Hero)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MediaUploader
              value={siteConfig.heroImage}
              onChange={(url) => setSiteConfig({ ...siteConfig, heroImage: url })}
              folder="hero"
              accept="all"
              label="Image ou Vidéo du Hero"
              aspectRatio="aspect-video"
            />
            <div>
              <label className="text-sm font-medium">Titre principal</label>
              <Input
                value={siteConfig.heroTitle}
                onChange={(e) => setSiteConfig({ ...siteConfig, heroTitle: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sous-titre</label>
              <Input
                value={siteConfig.heroSubtitle}
                onChange={(e) => setSiteConfig({ ...siteConfig, heroSubtitle: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Texte du bouton</label>
              <Input
                value={siteConfig.heroCtaText}
                onChange={(e) => setSiteConfig({ ...siteConfig, heroCtaText: e.target.value })}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thèmes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Couleurs du thème
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTheme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTheme('light')}
              >
                <Sun className="h-4 w-4 mr-2" />
                Clair
              </Button>
              <Button
                variant={activeTheme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-2" />
                Sombre
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={currentTheme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={currentTheme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
