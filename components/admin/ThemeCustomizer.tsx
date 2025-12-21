'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Palette,
  Type,
  Layout,
  Save,
  RefreshCw,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Undo,
  Redo
} from 'lucide-react'
import { toast } from 'sonner'

interface ThemeSettings {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    error: string
    warning: string
    success: string
  }
  fonts: {
    headingFamily: string
    bodyFamily: string
    headingWeight: string
    bodyWeight: string
    baseSize: number
    lineHeight: number
  }
  layout: {
    maxWidth: string
    padding: string
    headerHeight: string
    footerHeight: string
    borderRadius: string
    shadow: string
  }
  components: {
    buttonStyle: string
    cardStyle: string
    inputStyle: string
    linkStyle: string
  }
}

interface ThemeCustomizerProps {
  initialSettings?: Partial<ThemeSettings>
  onSave: (settings: ThemeSettings) => void
  onPreview?: (settings: ThemeSettings) => void
}

const defaultSettings: ThemeSettings = {
  colors: {
    primary: '#000000',
    secondary: '#6B7280',
    accent: '#F59E0B',
    background: '#FFFFFF',
    foreground: '#111827',
    muted: '#F3F4F6',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981'
  },
  fonts: {
    headingFamily: 'Inter',
    bodyFamily: 'Inter',
    headingWeight: '600',
    bodyWeight: '400',
    baseSize: 16,
    lineHeight: 1.6
  },
  layout: {
    maxWidth: '1200px',
    padding: '1rem',
    headerHeight: '4rem',
    footerHeight: '3rem',
    borderRadius: '0.5rem',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  components: {
    buttonStyle: 'rounded',
    cardStyle: 'bordered',
    inputStyle: 'bordered',
    linkStyle: 'underlined'
  }
}

const presetThemes = {
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#3B82F6',
      background: '#FFFFFF',
      foreground: '#111827',
      muted: '#F9FAFB',
      border: '#E5E7EB',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981'
    }
  },
  luxury: {
    name: 'Luxe',
    colors: {
      primary: '#1F2937',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FAFAFA',
      foreground: '#111827',
      muted: '#F3F4F6',
      border: '#D1D5DB',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981'
    }
  },
  vibrant: {
    name: 'Vibrant',
    colors: {
      primary: '#7C3AED',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      foreground: '#111827',
      muted: '#F8FAFC',
      border: '#E2E8F0',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981'
    }
  }
}

const fontOptions = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' }
]

export default function ThemeCustomizer({ initialSettings, onSave, onPreview }: ThemeCustomizerProps) {
  const [settings, setSettings] = useState<ThemeSettings>(() => ({
    ...defaultSettings,
    ...initialSettings
  }))

  const [history, setHistory] = useState<ThemeSettings[]>([settings])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [saving, setSaving] = useState(false)

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current: any = newSettings

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(settings)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSettings(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSettings(history[historyIndex + 1])
    }
  }

  const applyPreset = (presetKey: string) => {
    const preset = presetThemes[presetKey as keyof typeof presetThemes]
    if (preset) {
      updateSettings('colors', preset.colors)
      saveToHistory()
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(settings)
      toast.success('Thème sauvegardé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const generateCSSVariables = () => {
    return `
:root {
  --primary: ${settings.colors.primary};
  --secondary: ${settings.colors.secondary};
  --accent: ${settings.colors.accent};
  --background: ${settings.colors.background};
  --foreground: ${settings.colors.foreground};
  --muted: ${settings.colors.muted};
  --border: ${settings.colors.border};
  --error: ${settings.colors.error};
  --warning: ${settings.colors.warning};
  --success: ${settings.colors.success};

  --font-heading: ${settings.fonts.headingFamily};
  --font-body: ${settings.fonts.bodyFamily};
  --font-weight-heading: ${settings.fonts.headingWeight};
  --font-weight-body: ${settings.fonts.bodyWeight};
  --font-size-base: ${settings.fonts.baseSize}px;
  --line-height: ${settings.fonts.lineHeight};

  --max-width: ${settings.layout.maxWidth};
  --padding: ${settings.layout.padding};
  --border-radius: ${settings.layout.borderRadius};
  --shadow: ${settings.layout.shadow};
}
    `.trim()
  }

  useEffect(() => {
    if (onPreview) {
      onPreview(settings)
    }
  }, [settings, onPreview])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personnalisation du thème</h2>
          <p className="text-muted-foreground">Personnalisez l'apparence de votre boutique</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Couleurs
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typographie
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Mise en page
          </TabsTrigger>
          <TabsTrigger value="components">
            <Layout className="h-4 w-4 mr-2" />
            Composants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thèmes prédéfinis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(presetThemes).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => applyPreset(key)}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <div className="flex gap-1 mb-2">
                      {Object.values(preset.colors).slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Palette de couleurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(settings.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={key}
                        type="color"
                        value={value}
                        onChange={(e) => updateSettings(`colors.${key}`, e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={value}
                        onChange={(e) => updateSettings(`colors.${key}`, e.target.value)}
                        className="font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Polices de caractères</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headingFont">Police des titres</Label>
                  <select
                    id="headingFont"
                    value={settings.fonts.headingFamily}
                    onChange={(e) => updateSettings('fonts.headingFamily', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {fontOptions.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="bodyFont">Police du texte</Label>
                  <select
                    id="bodyFont"
                    value={settings.fonts.bodyFamily}
                    onChange={(e) => updateSettings('fonts.bodyFamily', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {fontOptions.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseSize">Taille de base (px)</Label>
                  <Input
                    id="baseSize"
                    type="number"
                    value={settings.fonts.baseSize}
                    onChange={(e) => updateSettings('fonts.baseSize', parseInt(e.target.value) || 16)}
                  />
                </div>

                <div>
                  <Label htmlFor="lineHeight">Hauteur de ligne</Label>
                  <Input
                    id="lineHeight"
                    type="number"
                    step="0.1"
                    value={settings.fonts.lineHeight}
                    onChange={(e) => updateSettings('fonts.lineHeight', parseFloat(e.target.value) || 1.6)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aperçu typographique</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  fontFamily: settings.fonts.bodyFamily,
                  fontSize: `${settings.fonts.baseSize}px`,
                  lineHeight: settings.fonts.lineHeight,
                  color: settings.colors.foreground
                }}
              >
                <h1
                  style={{
                    fontFamily: settings.fonts.headingFamily,
                    fontWeight: settings.fonts.headingWeight,
                    color: settings.colors.primary,
                    fontSize: `${settings.fonts.baseSize * 2}px`,
                    marginBottom: '1rem'
                  }}
                >
                  Titre Principal H1
                </h1>
                <h2
                  style={{
                    fontFamily: settings.fonts.headingFamily,
                    fontWeight: settings.fonts.headingWeight,
                    color: settings.colors.primary,
                    fontSize: `${settings.fonts.baseSize * 1.5}px`,
                    marginBottom: '0.75rem'
                  }}
                >
                  Sous-titre H2
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  Ceci est un exemple de texte dans la police de corps choisie.
                  Il montre comment votre contenu apparaîtra avec les paramètres actuels.
                </p>
                <a
                  href="#"
                  style={{
                    color: settings.colors.accent,
                    textDecoration: 'underline'
                  }}
                >
                  Lien d'exemple
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dimensions et espacement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxWidth">Largeur maximale</Label>
                  <Input
                    id="maxWidth"
                    value={settings.layout.maxWidth}
                    onChange={(e) => updateSettings('layout.maxWidth', e.target.value)}
                    placeholder="1200px"
                  />
                </div>

                <div>
                  <Label htmlFor="padding">Padding</Label>
                  <Input
                    id="padding"
                    value={settings.layout.padding}
                    onChange={(e) => updateSettings('layout.padding', e.target.value)}
                    placeholder="1rem"
                  />
                </div>

                <div>
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Input
                    id="borderRadius"
                    value={settings.layout.borderRadius}
                    onChange={(e) => updateSettings('layout.borderRadius', e.target.value)}
                    placeholder="0.5rem"
                  />
                </div>

                <div>
                  <Label htmlFor="shadow">Ombre</Label>
                  <Input
                    id="shadow"
                    value={settings.layout.shadow}
                    onChange={(e) => updateSettings('layout.shadow', e.target.value)}
                    placeholder="0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Styles des composants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buttonStyle">Style des boutons</Label>
                  <select
                    id="buttonStyle"
                    value={settings.components.buttonStyle}
                    onChange={(e) => updateSettings('components.buttonStyle', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="rounded">Arrondis</option>
                    <option value="square">Carrés</option>
                    <option value="pill">Pilules</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="cardStyle">Style des cartes</Label>
                  <select
                    id="cardStyle"
                    value={settings.components.cardStyle}
                    onChange={(e) => updateSettings('components.cardStyle', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="bordered">Avec bordure</option>
                    <option value="shadow">Avec ombre</option>
                    <option value="flat">Plat</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CSS Output */}
      <Card>
        <CardHeader>
          <CardTitle>Code CSS généré</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
            <code>{generateCSSVariables()}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}