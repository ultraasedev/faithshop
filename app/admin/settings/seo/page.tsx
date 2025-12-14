'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Globe,
  MapPin,
  Store,
  Search,
  Bot,
  Star,
  Phone,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { getSiteConfigs, upsertSiteConfig } from '@/app/actions/admin/settings'

interface SEOConfig {
  // Meta basiques
  siteName: string
  siteDescription: string
  siteKeywords: string
  defaultTitle: string
  titleSeparator: string

  // Données structurées business
  businessName: string
  businessType: string
  businessDescription: string

  // Localisation (pour SEO géographique/IA)
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
  email: string

  // Horaires d'ouverture
  openingHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }

  // Données pour IA/Rich Snippets
  logo: string
  priceRange: string
  acceptedPayments: string[]
  deliveryAreas: string[]
  languages: string[]

  // Social/Review
  socialProfiles: string[]
  aggregateRating: number
  reviewCount: number

  // Configuration technique
  enableStructuredData: boolean
  enableOpenGraph: boolean
  enableTwitterCards: boolean
  enableGoogleBusiness: boolean
}

const defaultConfig: SEOConfig = {
  siteName: 'Faith Shop',
  siteDescription: 'Boutique de vêtements chrétiens premium et éthiques',
  siteKeywords: 'vêtements chrétiens, mode foi, t-shirts chrétiens, boutique religieuse',
  defaultTitle: 'Faith Shop | Mode Chrétienne Premium',
  titleSeparator: '|',
  businessName: 'Faith Shop',
  businessType: 'ClothingStore',
  businessDescription: 'Boutique spécialisée dans les vêtements chrétiens haut de gamme',
  address: '',
  city: 'Paris',
  postalCode: '75001',
  country: 'France',
  phone: '',
  email: 'contact@faith-shop.fr',
  openingHours: {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '17:00', closed: false },
    sunday: { open: '', close: '', closed: true }
  },
  logo: '/logo2-nobg.png',
  priceRange: '€€',
  acceptedPayments: ['Carte bancaire', 'PayPal', 'Apple Pay', 'Google Pay'],
  deliveryAreas: ['France', 'Belgique', 'Suisse', 'Luxembourg'],
  languages: ['Français'],
  socialProfiles: [],
  aggregateRating: 4.8,
  reviewCount: 127,
  enableStructuredData: true,
  enableOpenGraph: true,
  enableTwitterCards: true,
  enableGoogleBusiness: true
}

export default function SEOSettingsPage() {
  const [config, setConfig] = useState<SEOConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSEOConfig()
  }, [])

  const loadSEOConfig = async () => {
    try {
      const configs = await getSiteConfigs('seo')
      const loadedConfig = { ...defaultConfig }

      configs.forEach(item => {
        const key = item.key.replace('seo_', '')
        try {
          if (item.type === 'json') {
            loadedConfig[key as keyof SEOConfig] = JSON.parse(item.value)
          } else {
            loadedConfig[key as keyof SEOConfig] = item.value as any
          }
        } catch (e) {
          console.error(`Error parsing config ${key}:`, e)
        }
      })

      setConfig(loadedConfig)
    } catch (error) {
      console.error('Error loading SEO config:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSEOConfig = async () => {
    setSaving(true)
    try {
      // Sauvegarder chaque section
      for (const [key, value] of Object.entries(config)) {
        const configKey = `seo_${key}`
        const isObject = typeof value === 'object' && value !== null

        await upsertSiteConfig({
          key: configKey,
          value: isObject ? JSON.stringify(value) : String(value),
          type: isObject ? 'json' : 'text',
          category: 'seo',
          label: `SEO ${key}`,
          description: `Configuration SEO pour ${key}`
        })
      }

      toast.success('Configuration SEO sauvegardée')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (key: keyof SEOConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const updateOpeningHours = (day: keyof typeof config.openingHours, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }))
  }

  const generateStructuredDataPreview = () => {
    return {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": config.businessName,
      "description": config.businessDescription,
      "url": "https://faith-shop.fr",
      "logo": `https://faith-shop.fr${config.logo}`,
      "image": `https://faith-shop.fr${config.logo}`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": config.address,
        "addressLocality": config.city,
        "postalCode": config.postalCode,
        "addressCountry": config.country
      },
      "telephone": config.phone,
      "email": config.email,
      "priceRange": config.priceRange,
      "paymentAccepted": config.acceptedPayments,
      "areaServed": config.deliveryAreas,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": config.aggregateRating,
        "reviewCount": config.reviewCount
      },
      "openingHoursSpecification": Object.entries(config.openingHours).map(([day, hours]) => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
        "opens": hours.closed ? undefined : hours.open,
        "closes": hours.closed ? undefined : hours.close
      })).filter(spec => spec.opens)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration SEO & IA</h1>
          <p className="text-muted-foreground">
            Optimisez votre référencement et votre visibilité pour les moteurs de recherche et IA
          </p>
        </div>
        <Button onClick={saveSEOConfig} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basique</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="location">Géolocalisation</TabsTrigger>
          <TabsTrigger value="structured">Données IA</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuration de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={config.siteName}
                    onChange={(e) => updateConfig('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultTitle">Titre par défaut</Label>
                  <Input
                    id="defaultTitle"
                    value={config.defaultTitle}
                    onChange={(e) => updateConfig('defaultTitle', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription">Description du site</Label>
                <Textarea
                  id="siteDescription"
                  value={config.siteDescription}
                  onChange={(e) => updateConfig('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="siteKeywords">Mots-clés (séparés par des virgules)</Label>
                <Input
                  id="siteKeywords"
                  value={config.siteKeywords}
                  onChange={(e) => updateConfig('siteKeywords', e.target.value)}
                  placeholder="vêtements chrétiens, mode foi, t-shirts"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableOpenGraph}
                    onCheckedChange={(checked) => updateConfig('enableOpenGraph', checked)}
                  />
                  <Label>Open Graph (Facebook)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableTwitterCards}
                    onCheckedChange={(checked) => updateConfig('enableTwitterCards', checked)}
                  />
                  <Label>Twitter Cards</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Informations Business
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="businessName">Nom de l'entreprise</Label>
                  <Input
                    id="businessName"
                    value={config.businessName}
                    onChange={(e) => updateConfig('businessName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Type d'entreprise</Label>
                  <select
                    value={config.businessType}
                    onChange={(e) => updateConfig('businessType', e.target.value)}
                    className="w-full h-9 px-3 py-1 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="ClothingStore">Magasin de vêtements</option>
                    <option value="Store">Magasin</option>
                    <option value="Organization">Organisation</option>
                    <option value="LocalBusiness">Entreprise locale</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="businessDescription">Description de l'entreprise</Label>
                <Textarea
                  id="businessDescription"
                  value={config.businessDescription}
                  onChange={(e) => updateConfig('businessDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="email">Email de contact</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.email}
                    onChange={(e) => updateConfig('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={config.phone}
                    onChange={(e) => updateConfig('phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <Label htmlFor="priceRange">Gamme de prix</Label>
                  <select
                    value={config.priceRange}
                    onChange={(e) => updateConfig('priceRange', e.target.value)}
                    className="w-full h-9 px-3 py-1 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="€">€ (Économique)</option>
                    <option value="€€">€€ (Modéré)</option>
                    <option value="€€€">€€€ (Premium)</option>
                    <option value="€€€€">€€€€ (Luxe)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adresse & Géolocalisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Adresse complète</Label>
                  <Input
                    id="address"
                    value={config.address}
                    onChange={(e) => updateConfig('address', e.target.value)}
                    placeholder="123 Rue de la Paix"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={config.city}
                      onChange={(e) => updateConfig('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      value={config.postalCode}
                      onChange={(e) => updateConfig('postalCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={config.country}
                      onChange={(e) => updateConfig('country', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Zones de livraison</Label>
                  <Input
                    value={config.deliveryAreas.join(', ')}
                    onChange={(e) => updateConfig('deliveryAreas', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="France, Belgique, Suisse"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horaires d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(config.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium capitalize">{day}</div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!hours.closed}
                          onCheckedChange={(checked) => updateOpeningHours(day as keyof typeof config.openingHours, 'closed', !checked)}
                        />
                        <Label className="text-sm">Ouvert</Label>
                      </div>
                      {!hours.closed && (
                        <>
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => updateOpeningHours(day as keyof typeof config.openingHours, 'open', e.target.value)}
                            className="w-24"
                          />
                          <span>-</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => updateOpeningHours(day as keyof typeof config.openingHours, 'close', e.target.value)}
                            className="w-24"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="structured">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Optimisation pour IA & Moteurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.enableStructuredData}
                      onCheckedChange={(checked) => updateConfig('enableStructuredData', checked)}
                    />
                    <Label>Données structurées JSON-LD</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.enableGoogleBusiness}
                      onCheckedChange={(checked) => updateConfig('enableGoogleBusiness', checked)}
                    />
                    <Label>Google Business Profile</Label>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="aggregateRating">Note moyenne</Label>
                    <Input
                      id="aggregateRating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={config.aggregateRating}
                      onChange={(e) => updateConfig('aggregateRating', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewCount">Nombre d'avis</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      value={config.reviewCount}
                      onChange={(e) => updateConfig('reviewCount', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Méthodes de paiement acceptées</Label>
                  <Input
                    value={config.acceptedPayments.join(', ')}
                    onChange={(e) => updateConfig('acceptedPayments', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Carte bancaire, PayPal, Apple Pay"
                  />
                </div>

                <div>
                  <Label htmlFor="logo">URL du logo</Label>
                  <Input
                    id="logo"
                    value={config.logo}
                    onChange={(e) => updateConfig('logo', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact sur l'IA et les moteurs de recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Avantages IA/SEO
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Réponses précises de ChatGPT/Claude sur votre boutique</li>
                      <li>• Rich snippets dans Google (étoiles, horaires, prix)</li>
                      <li>• Meilleure compréhension contextuelle par les IA</li>
                      <li>• Optimisation pour les recherches vocales</li>
                      <li>• Référencement local amélioré</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Recommandations
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Maintenez les informations à jour</li>
                      <li>• Utilisez des mots-clés naturels</li>
                      <li>• Cohérence entre site et réseaux sociaux</li>
                      <li>• Surveillez vos mentions dans les IA</li>
                      <li>• Optimisez pour les questions locales</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu des données structurées</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(generateStructuredDataPreview(), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}