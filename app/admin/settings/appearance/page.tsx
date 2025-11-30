'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Palette,
  Sun,
  Moon,
  Upload,
  Save,
  Eye,
  RefreshCw
} from 'lucide-react'

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
}

export default function AppearancePage() {
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light')
  const [saving, setSaving] = useState(false)

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
    siteName: 'FAITH SHOP',
    siteDescription: 'Boutique de mode premium',
    logo: '/logo.png',
    favicon: '/favicon.ico',
  })

  const currentTheme = activeTheme === 'light' ? lightTheme : darkTheme
  const setCurrentTheme = activeTheme === 'light' ? setLightTheme : setDarkTheme

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setCurrentTheme((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Appel API pour sauvegarder
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Personnalisation</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
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
            <div>
              <label className="text-sm font-medium">Logo</label>
              <div className="mt-1 flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                  {siteConfig.logo ? (
                    <span className="text-xs text-gray-400">Logo</span>
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Changer
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Favicon</label>
              <div className="mt-1 flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center border">
                  <span className="text-xs text-gray-400">ICO</span>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Changer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prévisualisation */}
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg p-6 border"
              style={{
                backgroundColor: currentTheme.backgroundColor,
                color: currentTheme.textColor,
                borderColor: currentTheme.borderColor,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-bold text-lg"
                  style={{ color: currentTheme.textColor }}
                >
                  {siteConfig.siteName}
                </h3>
                <div className="flex gap-2">
                  <div
                    className="px-3 py-1 rounded text-sm"
                    style={{
                      backgroundColor: currentTheme.primaryColor,
                      color: currentTheme.secondaryColor,
                    }}
                  >
                    Boutique
                  </div>
                </div>
              </div>
              <p
                className="text-sm mb-4"
                style={{ color: currentTheme.mutedColor }}
              >
                {siteConfig.siteDescription}
              </p>
              <div
                className="p-4 rounded border"
                style={{ borderColor: currentTheme.borderColor }}
              >
                <p className="font-medium mb-2">Exemple de produit</p>
                <p
                  className="text-sm"
                  style={{ color: currentTheme.mutedColor }}
                >
                  Description du produit avec du texte secondaire.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    className="px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor: currentTheme.primaryColor,
                      color: currentTheme.secondaryColor,
                    }}
                  >
                    Acheter
                  </button>
                  <button
                    className="px-4 py-2 rounded text-sm border"
                    style={{
                      borderColor: currentTheme.borderColor,
                      color: currentTheme.textColor,
                    }}
                  >
                    Détails
                  </button>
                </div>
              </div>
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

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium mb-3">Préréglages</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTheme === 'light') {
                    setLightTheme({
                      primaryColor: '#000000',
                      secondaryColor: '#ffffff',
                      accentColor: '#666666',
                      backgroundColor: '#ffffff',
                      textColor: '#000000',
                      mutedColor: '#6b7280',
                      borderColor: '#e5e7eb',
                    })
                  } else {
                    setDarkTheme({
                      primaryColor: '#ffffff',
                      secondaryColor: '#000000',
                      accentColor: '#a3a3a3',
                      backgroundColor: '#0a0a0a',
                      textColor: '#ffffff',
                      mutedColor: '#a3a3a3',
                      borderColor: '#262626',
                    })
                  }
                }}
              >
                Minimaliste
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTheme === 'light') {
                    setLightTheme({
                      primaryColor: '#1e40af',
                      secondaryColor: '#ffffff',
                      accentColor: '#3b82f6',
                      backgroundColor: '#f8fafc',
                      textColor: '#0f172a',
                      mutedColor: '#64748b',
                      borderColor: '#e2e8f0',
                    })
                  }
                }}
              >
                Professionnel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTheme === 'light') {
                    setLightTheme({
                      primaryColor: '#be185d',
                      secondaryColor: '#ffffff',
                      accentColor: '#ec4899',
                      backgroundColor: '#fdf2f8',
                      textColor: '#831843',
                      mutedColor: '#9d174d',
                      borderColor: '#fbcfe8',
                    })
                  }
                }}
              >
                Élégant
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTheme === 'light') {
                    setLightTheme({
                      primaryColor: '#059669',
                      secondaryColor: '#ffffff',
                      accentColor: '#10b981',
                      backgroundColor: '#f0fdf4',
                      textColor: '#064e3b',
                      mutedColor: '#047857',
                      borderColor: '#bbf7d0',
                    })
                  }
                }}
              >
                Nature
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thème par défaut */}
      <Card>
        <CardHeader>
          <CardTitle>Thème par défaut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="defaultTheme"
                value="light"
                defaultChecked
                className="w-4 h-4"
              />
              <Sun className="h-4 w-4" />
              <span>Mode clair</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="defaultTheme"
                value="dark"
                className="w-4 h-4"
              />
              <Moon className="h-4 w-4" />
              <span>Mode sombre</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="defaultTheme"
                value="system"
                className="w-4 h-4"
              />
              <span>Préférence système</span>
            </label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Les visiteurs peuvent toujours changer le thème manuellement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
