'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Eye,
  Upload,
  Download,
  Settings,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import { toast } from 'sonner'

interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  card: string
  border: string
  ring: string
}

interface SiteConfig {
  siteName: string
  tagline: string
  logo: string
  favicon: string
  heroImage: string
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  footerText: string
  socialLinks: {
    facebook: string
    instagram: string
    twitter: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string
  }
  features: {
    darkMode: boolean
    newsletter: boolean
    reviews: boolean
    wishlist: boolean
    comparison: boolean
  }
}

export function AppearanceCustomizer() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>({
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#3b82f6',
    background: '#ffffff',
    foreground: '#1f2937',
    card: '#f9fafb',
    border: '#e5e7eb',
    ring: '#3b82f6'
  })

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    siteName: 'Faith Shop',
    tagline: 'Mode Chrétienne Premium & Éthique',
    logo: '/logo2-nobg.png',
    favicon: '/favicon.jpeg',
    heroImage: '/prd/hero/hero-upscaled.png',
    heroTitle: 'Élégance Urbaine. Message Éternel.',
    heroSubtitle: 'Une expression intemporelle de spiritualité à travers des pièces d\'exception.',
    heroButtonText: 'Découvrir la collection',
    footerText: 'Faith Shop. Tous droits réservés.',
    socialLinks: {
      facebook: 'https://facebook.com/faithshop',
      instagram: 'https://instagram.com/faithshop',
      twitter: 'https://twitter.com/faithshop'
    },
    seo: {
      metaTitle: 'Faith Shop | Mode Chrétienne Premium & Éthique',
      metaDescription: 'Découvrez Faith Shop, la boutique de vêtements chrétiens haut de gamme. T-shirts, hoodies et accessoires inspirés par la foi.',
      keywords: 'vêtements chrétiens, mode chrétienne, faith shop, t-shirts chrétiens, hoodies chrétiens'
    },
    features: {
      darkMode: true,
      newsletter: true,
      reviews: true,
      wishlist: true,
      comparison: false
    }
  })

  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const predefinedThemes = [
    {
      name: 'Faith Classic',
      config: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#3b82f6',
        background: '#ffffff',
        foreground: '#1f2937',
        card: '#f9fafb',
        border: '#e5e7eb',
        ring: '#3b82f6'
      }
    },
    {
      name: 'Dark Modern',
      config: {
        primary: '#ffffff',
        secondary: '#a1a1aa',
        accent: '#8b5cf6',
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: '#1a1a1a',
        border: '#27272a',
        ring: '#8b5cf6'
      }
    },
    {
      name: 'Warm Earth',
      config: {
        primary: '#92400e',
        secondary: '#a3a3a3',
        accent: '#ea580c',
        background: '#fef7f0',
        foreground: '#1c1917',
        card: '#ffffff',
        border: '#fed7aa',
        ring: '#ea580c'
      }
    },
    {
      name: 'Ocean Blue',
      config: {
        primary: '#0f172a',
        secondary: '#64748b',
        accent: '#0ea5e9',
        background: '#f8fafc',
        foreground: '#0f172a',
        card: '#ffffff',
        border: '#cbd5e1',
        ring: '#0ea5e9'
      }
    }
  ]

  useEffect(() => {
    // Load current configuration from API
    loadCurrentConfig()
  }, [])

  const loadCurrentConfig = async () => {
    try {
      // In a real app, load from API
      console.log('Loading current configuration...')
    } catch (error) {
      console.error('Erreur chargement configuration:', error)
    }
  }

  const handleThemeChange = (key: keyof ThemeConfig, value: string) => {
    setCurrentTheme(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSiteConfigChange = (section: keyof SiteConfig | string, key: string | any, value?: any) => {
    if (typeof key === 'object') {
      // Direct object update
      setSiteConfig(prev => ({ ...prev, [section]: key }))
    } else if (value !== undefined) {
      // Nested update
      setSiteConfig(prev => ({
        ...prev,
        [section]: { ...prev[section as keyof SiteConfig], [key]: value }
      }))
    } else {
      // Simple update
      setSiteConfig(prev => ({ ...prev, [section]: key }))
    }
    setHasChanges(true)
  }

  const applyTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme)
    setHasChanges(true)

    // Apply CSS variables in real-time
    const root = document.documentElement
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
  }

  const saveConfiguration = async () => {
    setIsSaving(true)
    try {
      // In a real app, save to API
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Configuration sauvegardée avec succès')
      setHasChanges(false)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
    applyTheme(predefinedThemes[0].config)
    setSiteConfig({
      siteName: 'Faith Shop',
      tagline: 'Mode Chrétienne Premium & Éthique',
      logo: '/logo2-nobg.png',
      favicon: '/favicon.jpeg',
      heroImage: '/prd/hero/hero-upscaled.png',
      heroTitle: 'Élégance Urbaine. Message Éternel.',
      heroSubtitle: 'Une expression intemporelle de spiritualité à travers des pièces d\'exception.',
      heroButtonText: 'Découvrir la collection',
      footerText: 'Faith Shop. Tous droits réservés.',
      socialLinks: {
        facebook: 'https://facebook.com/faithshop',
        instagram: 'https://instagram.com/faithshop',
        twitter: 'https://twitter.com/faithshop'
      },
      seo: {
        metaTitle: 'Faith Shop | Mode Chrétienne Premium & Éthique',
        metaDescription: 'Découvrez Faith Shop, la boutique de vêtements chrétiens haut de gamme.',
        keywords: 'vêtements chrétiens, mode chrétienne, faith shop'
      },
      features: {
        darkMode: true,
        newsletter: true,
        reviews: true,
        wishlist: true,
        comparison: false
      }
    })
    setHasChanges(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Personnalisation du Site
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personnalisez l'apparence et le contenu de votre boutique
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 dark:text-orange-400">
              Modifications non sauvegardées
            </span>
          )}
          <Button
            variant="outline"
            onClick={resetToDefaults}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={saveConfiguration}
            disabled={isSaving || !hasChanges}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="theme" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="theme" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Thème
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Contenu
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Mise en page
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6">
              {/* Predefined Themes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Thèmes prédéfinis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {predefinedThemes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => applyTheme(theme.config)}
                        className="p-4 border rounded-lg hover:border-gray-400 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex space-x-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.config.primary }}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.config.accent }}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.config.secondary }}
                            />
                          </div>
                          <span className="font-medium text-sm">{theme.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>Couleurs personnalisées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(currentTheme).map(([key, value]) => (
                      <div key={key}>
                        <Label className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleThemeChange(key as keyof ThemeConfig, e.target.value)}
                            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <Input
                            value={value}
                            onChange={(e) => handleThemeChange(key as keyof ThemeConfig, e.target.value)}
                            className="flex-1"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* Site Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations du site</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nom du site</Label>
                    <Input
                      value={siteConfig.siteName}
                      onChange={(e) => handleSiteConfigChange('siteName', e.target.value)}
                      placeholder="Faith Shop"
                    />
                  </div>
                  <div>
                    <Label>Slogan/Tagline</Label>
                    <Input
                      value={siteConfig.tagline}
                      onChange={(e) => handleSiteConfigChange('tagline', e.target.value)}
                      placeholder="Mode Chrétienne Premium & Éthique"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Section héro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Titre principal</Label>
                    <Input
                      value={siteConfig.heroTitle}
                      onChange={(e) => handleSiteConfigChange('heroTitle', e.target.value)}
                      placeholder="Élégance Urbaine. Message Éternel."
                    />
                  </div>
                  <div>
                    <Label>Sous-titre</Label>
                    <Input
                      value={siteConfig.heroSubtitle}
                      onChange={(e) => handleSiteConfigChange('heroSubtitle', e.target.value)}
                      placeholder="Une expression intemporelle..."
                    />
                  </div>
                  <div>
                    <Label>Texte du bouton</Label>
                    <Input
                      value={siteConfig.heroButtonText}
                      onChange={(e) => handleSiteConfigChange('heroButtonText', e.target.value)}
                      placeholder="Découvrir la collection"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Réseaux sociaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      value={siteConfig.socialLinks.facebook}
                      onChange={(e) => handleSiteConfigChange('socialLinks', 'facebook', e.target.value)}
                      placeholder="https://facebook.com/faithshop"
                    />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={siteConfig.socialLinks.instagram}
                      onChange={(e) => handleSiteConfigChange('socialLinks', 'instagram', e.target.value)}
                      placeholder="https://instagram.com/faithshop"
                    />
                  </div>
                  <div>
                    <Label>Twitter</Label>
                    <Input
                      value={siteConfig.socialLinks.twitter}
                      onChange={(e) => handleSiteConfigChange('socialLinks', 'twitter', e.target.value)}
                      placeholder="https://twitter.com/faithshop"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-6">
              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(siteConfig.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => handleSiteConfigChange('features', key, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Images et médias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Logo</Label>
                    <div className="flex items-center space-x-3 mt-2">
                      <Input
                        value={siteConfig.logo}
                        onChange={(e) => handleSiteConfigChange('logo', e.target.value)}
                        placeholder="/logo2-nobg.png"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Favicon</Label>
                    <div className="flex items-center space-x-3 mt-2">
                      <Input
                        value={siteConfig.favicon}
                        onChange={(e) => handleSiteConfigChange('favicon', e.target.value)}
                        placeholder="/favicon.jpeg"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Image héro</Label>
                    <div className="flex items-center space-x-3 mt-2">
                      <Input
                        value={siteConfig.heroImage}
                        onChange={(e) => handleSiteConfigChange('heroImage', e.target.value)}
                        placeholder="/prd/hero/hero-upscaled.png"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Référencement SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Titre META</Label>
                    <Input
                      value={siteConfig.seo.metaTitle}
                      onChange={(e) => handleSiteConfigChange('seo', 'metaTitle', e.target.value)}
                      placeholder="Faith Shop | Mode Chrétienne Premium"
                    />
                  </div>
                  <div>
                    <Label>Description META</Label>
                    <textarea
                      value={siteConfig.seo.metaDescription}
                      onChange={(e) => handleSiteConfigChange('seo', 'metaDescription', e.target.value)}
                      placeholder="Découvrez Faith Shop, la boutique de vêtements chrétiens..."
                      className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <Label>Mots-clés</Label>
                    <Input
                      value={siteConfig.seo.keywords}
                      onChange={(e) => handleSiteConfigChange('seo', 'keywords', e.target.value)}
                      placeholder="vêtements chrétiens, mode chrétienne, faith shop"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aperçu en direct
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto border rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'w-full max-w-sm' :
                previewMode === 'tablet' ? 'w-full max-w-md' :
                'w-full'
              }`}>
                {/* Mini website preview */}
                <div
                  className="h-64 bg-cover bg-center relative"
                  style={{
                    backgroundColor: currentTheme.background,
                    backgroundImage: `url(${siteConfig.heroImage})`
                  }}
                >
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <h2 className="text-lg font-bold mb-2 line-clamp-2">
                        {siteConfig.heroTitle}
                      </h2>
                      <p className="text-sm opacity-90 mb-3 line-clamp-2">
                        {siteConfig.heroSubtitle}
                      </p>
                      <button
                        className="px-4 py-2 text-xs rounded"
                        style={{ backgroundColor: currentTheme.accent }}
                      >
                        {siteConfig.heroButtonText}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3" style={{ backgroundColor: currentTheme.background }}>
                  <div className="text-center">
                    <h3 className="font-bold text-sm" style={{ color: currentTheme.foreground }}>
                      {siteConfig.siteName}
                    </h3>
                    <p className="text-xs" style={{ color: currentTheme.secondary }}>
                      {siteConfig.tagline}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square rounded" style={{ backgroundColor: currentTheme.card }} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}