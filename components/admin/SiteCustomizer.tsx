'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  Settings,
  Eye,
  Save,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Home,
  ShoppingBag,
  Mail,
  Info,
  Upload
} from 'lucide-react'

interface SiteConfig {
  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    darkMode: boolean
  }
  branding: {
    siteName: string
    logo: string
    favicon: string
    tagline: string
  }
  homepage: {
    heroTitle: string
    heroSubtitle: string
    heroImage: string
    showFeaturedProducts: boolean
    featuredSection: string
  }
  preorder: {
    enabled: boolean
    message: string
    showPages: string[]
    backgroundColor: string
    textColor: string
  }
  footer: {
    aboutText: string
    contactEmail: string
    socialLinks: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string
  }
}

export default function SiteCustomizer() {
  const [config, setConfig] = useState<SiteConfig>({
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      darkMode: false
    },
    branding: {
      siteName: 'Faith Shop',
      logo: '',
      favicon: '',
      tagline: 'Vêtements de qualité supérieure'
    },
    homepage: {
      heroTitle: 'Faith Shop - Style & Qualité',
      heroSubtitle: 'Découvrez notre collection exclusive de vêtements',
      heroImage: '',
      showFeaturedProducts: true,
      featuredSection: 'Nouveautés'
    },
    preorder: {
      enabled: true,
      message: 'Expédition le 16 janvier 2025',
      showPages: ['product', 'checkout'],
      backgroundColor: '#dbeafe',
      textColor: '#1e40af'
    },
    footer: {
      aboutText: 'Faith Shop propose des vêtements de qualité fabriqués avec passion.',
      contactEmail: 'contact@faith-shop.fr',
      socialLinks: {}
    },
    seo: {
      metaTitle: 'Faith Shop - Vêtements de Qualité',
      metaDescription: 'Découvrez notre collection de vêtements uniques et de qualité supérieure.',
      keywords: 'vêtements, mode, qualité, faith shop'
    }
  })

  const [activeDevice, setActiveDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/site-config')
      if (response.ok) {
        const data = await response.json()
        setConfig({ ...config, ...data })
      }
    } catch (error) {
      console.error('Erreur chargement config:', error)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        // Actualiser le site
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur sauvegarde config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const uploadImage = async (file: File, type: 'logo' | 'hero' | 'favicon') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const { url } = await response.json()

        if (type === 'logo') {
          setConfig({ ...config, branding: { ...config.branding, logo: url } })
        } else if (type === 'hero') {
          setConfig({ ...config, homepage: { ...config.homepage, heroImage: url } })
        } else if (type === 'favicon') {
          setConfig({ ...config, branding: { ...config.branding, favicon: url } })
        }
      }
    } catch (error) {
      console.error('Erreur upload image:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personnaliser le site</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configurez l'apparence et le contenu de votre boutique
          </p>
        </div>
        <div className="flex gap-3">
          {/* Device Preview Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              size="sm"
              variant={activeDevice === 'mobile' ? 'default' : 'ghost'}
              onClick={() => setActiveDevice('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={activeDevice === 'tablet' ? 'default' : 'ghost'}
              onClick={() => setActiveDevice('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={activeDevice === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setActiveDevice('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Mode édition' : 'Aperçu'}
          </Button>

          <Button onClick={saveConfig} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="theme" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="theme">Thème</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-4">
              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Couleurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Couleur principale</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={config.theme.primaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          theme: { ...config.theme, primaryColor: e.target.value }
                        })}
                        className="w-10 h-10 rounded border"
                      />
                      <Input
                        value={config.theme.primaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          theme: { ...config.theme, primaryColor: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Couleur secondaire</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={config.theme.secondaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          theme: { ...config.theme, secondaryColor: e.target.value }
                        })}
                        className="w-10 h-10 rounded border"
                      />
                      <Input
                        value={config.theme.secondaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          theme: { ...config.theme, secondaryColor: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mode sombre</Label>
                    <Switch
                      checked={config.theme.darkMode}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        theme: { ...config.theme, darkMode: checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Branding */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Marque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nom du site</Label>
                    <Input
                      value={config.branding.siteName}
                      onChange={(e) => setConfig({
                        ...config,
                        branding: { ...config.branding, siteName: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Slogan</Label>
                    <Input
                      value={config.branding.tagline}
                      onChange={(e) => setConfig({
                        ...config,
                        branding: { ...config.branding, tagline: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Logo</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadImage(file, 'logo')
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button variant="outline" className="w-full" asChild>
                          <div>
                            <Upload className="h-4 w-4 mr-2" />
                            Télécharger un logo
                          </div>
                        </Button>
                      </label>
                      {config.branding.logo && (
                        <img
                          src={config.branding.logo}
                          alt="Logo"
                          className="mt-2 max-h-20 object-contain"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {/* Homepage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Page d'accueil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Titre principal</Label>
                    <Input
                      value={config.homepage.heroTitle}
                      onChange={(e) => setConfig({
                        ...config,
                        homepage: { ...config.homepage, heroTitle: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Sous-titre</Label>
                    <Textarea
                      value={config.homepage.heroSubtitle}
                      onChange={(e) => setConfig({
                        ...config,
                        homepage: { ...config.homepage, heroSubtitle: e.target.value }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Afficher les produits vedettes</Label>
                    <Switch
                      checked={config.homepage.showFeaturedProducts}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        homepage: { ...config.homepage, showFeaturedProducts: checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preorder Banner */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Bannière pré-commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Activer la bannière</Label>
                    <Switch
                      checked={config.preorder.enabled}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        preorder: { ...config.preorder, enabled: checked }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Message</Label>
                    <Input
                      value={config.preorder.message}
                      onChange={(e) => setConfig({
                        ...config,
                        preorder: { ...config.preorder, message: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Pages d'affichage</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['product', 'checkout', 'cart'].map(page => (
                        <Badge
                          key={page}
                          variant={config.preorder.showPages.includes(page) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newPages = config.preorder.showPages.includes(page)
                              ? config.preorder.showPages.filter(p => p !== page)
                              : [...config.preorder.showPages, page]
                            setConfig({
                              ...config,
                              preorder: { ...config.preorder, showPages: newPages }
                            })
                          }}
                        >
                          {page}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Référencement SEO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Titre de la page</Label>
                    <Input
                      value={config.seo.metaTitle}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, metaTitle: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={config.seo.metaDescription}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, metaDescription: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Mots-clés</Label>
                    <Input
                      value={config.seo.keywords}
                      onChange={(e) => setConfig({
                        ...config,
                        seo: { ...config.seo, keywords: e.target.value }
                      })}
                      placeholder="mode, vêtements, qualité..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu - {activeDevice}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className={`bg-white rounded-lg border-2 h-full overflow-hidden ${
                activeDevice === 'mobile' ? 'max-w-sm mx-auto' :
                activeDevice === 'tablet' ? 'max-w-2xl mx-auto' :
                'w-full'
              }`}>
                {/* Preview Header */}
                <div
                  className="p-4 text-white"
                  style={{ backgroundColor: config.theme.primaryColor }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {config.branding.logo && (
                        <img
                          src={config.branding.logo}
                          alt="Logo"
                          className="h-8 w-auto"
                        />
                      )}
                      <div>
                        <h1 className="font-bold">{config.branding.siteName}</h1>
                        <p className="text-xs opacity-90">{config.branding.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preorder Banner */}
                {config.preorder.enabled && (
                  <div
                    className="p-2 text-center text-sm font-medium"
                    style={{
                      backgroundColor: config.preorder.backgroundColor,
                      color: config.preorder.textColor
                    }}
                  >
                    {config.preorder.message}
                  </div>
                )}

                {/* Hero Section */}
                <div className="p-6 text-center">
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: config.theme.textColor }}
                  >
                    {config.homepage.heroTitle}
                  </h2>
                  <p
                    className="text-gray-600 mb-4"
                    style={{ color: config.theme.textColor }}
                  >
                    {config.homepage.heroSubtitle}
                  </p>
                  <Button style={{ backgroundColor: config.theme.primaryColor }}>
                    Découvrir la collection
                  </Button>
                </div>

                {/* Featured Products */}
                {config.homepage.showFeaturedProducts && (
                  <div className="p-6 border-t">
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: config.theme.textColor }}
                    >
                      {config.homepage.featuredSection}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="border rounded-lg p-3">
                          <div className="h-24 bg-gray-200 rounded mb-2"></div>
                          <p className="font-medium">Produit {i}</p>
                          <p className="text-sm text-gray-600">€29.99</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}