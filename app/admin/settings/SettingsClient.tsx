'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/admin/common'
import {
  Store,
  Palette,
  Search,
  Truck,
  CreditCard,
  Bell,
  Save,
  Loader2,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Key,
  Scale
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SiteConfig {
  general: {
    siteName: string
    tagline: string
    logo: string
    favicon: string
    email: string
    phone: string
    address: string
  }
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    darkMode: boolean
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string
    ogImage: string
    googleAnalyticsId: string
    facebookPixelId: string
    googleSiteVerification: string
  }
  shipping: {
    freeShippingThreshold: number
    standardShippingPrice: number
    expressShippingPrice: number
    processingTime: string
    shippingZones: string[]
  }
  checkout: {
    guestCheckout: boolean
    minOrderValue: number
    maxOrderValue: number
    enableInstallments: boolean
    installmentsMinAmount: number
    paymentMethods: string[]
  }
  notifications: {
    orderConfirmation: boolean
    shippingUpdates: boolean
    abandonedCart: boolean
    abandonedCartDelay: number
    reviewReminder: boolean
    reviewReminderDelay: number
  }
  carriers: {
    laposteApiKey: string
    colissimoContractNumber: string
    colissimoPassword: string
    mondialRelayEnseigne: string
    mondialRelayPrivateKey: string
  }
  legal: {
    companyName: string
    address: string
    city: string
    zip: string
    country: string
    siret: string
    tvaNumber: string
    rcs: string
  }
}

interface SettingsClientProps {
  config: SiteConfig
}

export function SettingsClient({ config: initialConfig }: SettingsClientProps) {
  const router = useRouter()
  const [config, setConfig] = useState(initialConfig)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)

  const updateConfig = <K extends keyof SiteConfig>(
    section: K,
    key: keyof SiteConfig[K],
    value: SiteConfig[K][keyof SiteConfig[K]]
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (res.ok) {
        setHasChanges(false)
        router.refresh()
      }
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Store },
    { id: 'theme', label: 'Thème', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'shipping', label: 'Livraison', icon: Truck },
    { id: 'checkout', label: 'Paiement', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'carriers', label: 'Transporteurs', icon: PackageCheck },
    { id: 'legal', label: 'Mentions légales', icon: Scale }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Paramètres
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Configuration de votre boutique
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Identité de votre boutique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nom de la boutique</Label>
                  <Input
                    value={config.general.siteName}
                    onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
                    placeholder="Faith Shop"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input
                    value={config.general.tagline}
                    onChange={(e) => updateConfig('general', 'tagline', e.target.value)}
                    placeholder="Streetwear avec un message"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  value={config.general.logo}
                  onChange={(url) => updateConfig('general', 'logo', url)}
                  type="logo"
                  label="Logo"
                  placeholder="Ajouter le logo"
                  aspectRatio="auto"
                />
                <ImageUpload
                  value={config.general.favicon}
                  onChange={(url) => updateConfig('general', 'favicon', url)}
                  type="favicon"
                  label="Favicon"
                  placeholder="Ajouter le favicon"
                  aspectRatio="square"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Coordonnées de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={config.general.email}
                    onChange={(e) => updateConfig('general', 'email', e.target.value)}
                    placeholder="contact@faith-shop.fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  <Input
                    value={config.general.phone}
                    onChange={(e) => updateConfig('general', 'phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </Label>
                <Textarea
                  value={config.general.address}
                  onChange={(e) => updateConfig('general', 'address', e.target.value)}
                  placeholder="123 Rue de la Mode, 75001 Paris"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Couleurs</CardTitle>
              <CardDescription>Personnalisez l'apparence de votre boutique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { key: 'primaryColor', label: 'Couleur principale' },
                  { key: 'secondaryColor', label: 'Couleur secondaire' },
                  { key: 'accentColor', label: 'Couleur d\'accent' },
                  { key: 'backgroundColor', label: 'Fond' }
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.theme[key as keyof typeof config.theme] as string}
                        onChange={(e) => updateConfig('theme', key as keyof typeof config.theme, e.target.value)}
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input
                        value={config.theme[key as keyof typeof config.theme] as string}
                        onChange={(e) => updateConfig('theme', key as keyof typeof config.theme, e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium">Mode sombre par défaut</p>
                  <p className="text-sm text-gray-500">Activer le thème sombre comme défaut</p>
                </div>
                <Switch
                  checked={config.theme.darkMode}
                  onCheckedChange={(checked) => updateConfig('theme', 'darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Référencement (SEO)</CardTitle>
              <CardDescription>Optimisez votre visibilité sur les moteurs de recherche</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Titre par défaut</Label>
                <Input
                  value={config.seo.metaTitle}
                  onChange={(e) => updateConfig('seo', 'metaTitle', e.target.value)}
                  placeholder="Faith Shop - Streetwear Premium"
                />
                <p className="text-xs text-gray-500">{config.seo.metaTitle.length}/60 caractères</p>
              </div>

              <div className="space-y-2">
                <Label>Description par défaut</Label>
                <Textarea
                  value={config.seo.metaDescription}
                  onChange={(e) => updateConfig('seo', 'metaDescription', e.target.value)}
                  placeholder="Découvrez notre collection..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">{config.seo.metaDescription.length}/160 caractères</p>
              </div>

              <div className="space-y-2">
                <Label>Mots-clés</Label>
                <Input
                  value={config.seo.keywords}
                  onChange={(e) => updateConfig('seo', 'keywords', e.target.value)}
                  placeholder="streetwear, vêtements, mode..."
                />
              </div>

              <ImageUpload
                value={config.seo.ogImage}
                onChange={(url) => updateConfig('seo', 'ogImage', url)}
                type="og-image"
                label="Image Open Graph"
                placeholder="Image de partage sur les réseaux sociaux (1200x630)"
                aspectRatio="video"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking & Analytics</CardTitle>
              <CardDescription>Intégrations de suivi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input
                    value={config.seo.googleAnalyticsId}
                    onChange={(e) => updateConfig('seo', 'googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook Pixel ID</Label>
                  <Input
                    value={config.seo.facebookPixelId}
                    onChange={(e) => updateConfig('seo', 'facebookPixelId', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Google Search Console — Code de vérification</Label>
                <Input
                  value={config.seo.googleSiteVerification}
                  onChange={(e) => updateConfig('seo', 'googleSiteVerification', e.target.value)}
                  placeholder="Collez le code de vérification Google (ex: abc123...)"
                />
                <p className="text-xs text-gray-500">Trouvable dans Google Search Console → Paramètres → Vérification de la propriété → Balise HTML</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tarifs de livraison</CardTitle>
              <CardDescription>Configurez vos options de livraison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Livraison gratuite dès (€)</Label>
                  <Input
                    type="number"
                    value={config.shipping.freeShippingThreshold}
                    onChange={(e) => updateConfig('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Livraison standard (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.shipping.standardShippingPrice}
                    onChange={(e) => updateConfig('shipping', 'standardShippingPrice', parseFloat(e.target.value))}
                    placeholder="4.95"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Livraison express (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.shipping.expressShippingPrice}
                    onChange={(e) => updateConfig('shipping', 'expressShippingPrice', parseFloat(e.target.value))}
                    placeholder="9.95"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Délai de préparation</Label>
                <Input
                  value={config.shipping.processingTime}
                  onChange={(e) => updateConfig('shipping', 'processingTime', e.target.value)}
                  placeholder="1-2 jours ouvrés"
                />
              </div>

              <div className="space-y-2">
                <Label>Zones de livraison</Label>
                <Textarea
                  value={config.shipping.shippingZones.join(', ')}
                  onChange={(e) => updateConfig('shipping', 'shippingZones', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="France, Belgique, Suisse..."
                  rows={2}
                />
                <p className="text-xs text-gray-500">Séparez les pays par des virgules</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checkout Settings */}
        <TabsContent value="checkout" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Options de paiement</CardTitle>
              <CardDescription>Configurez le processus de commande</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium">Commande en tant qu'invité</p>
                  <p className="text-sm text-gray-500">Permettre les achats sans compte</p>
                </div>
                <Switch
                  checked={config.checkout.guestCheckout}
                  onCheckedChange={(checked) => updateConfig('checkout', 'guestCheckout', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Commande minimum (€)</Label>
                  <Input
                    type="number"
                    value={config.checkout.minOrderValue}
                    onChange={(e) => updateConfig('checkout', 'minOrderValue', parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commande maximum (€)</Label>
                  <Input
                    type="number"
                    value={config.checkout.maxOrderValue}
                    onChange={(e) => updateConfig('checkout', 'maxOrderValue', parseFloat(e.target.value))}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium">Paiement en 3 fois</p>
                  <p className="text-sm text-gray-500">Activer le paiement fractionné</p>
                </div>
                <Switch
                  checked={config.checkout.enableInstallments}
                  onCheckedChange={(checked) => updateConfig('checkout', 'enableInstallments', checked)}
                />
              </div>

              {config.checkout.enableInstallments && (
                <div className="space-y-2">
                  <Label>Montant minimum pour paiement en 3x (€)</Label>
                  <Input
                    type="number"
                    value={config.checkout.installmentsMinAmount}
                    onChange={(e) => updateConfig('checkout', 'installmentsMinAmount', parseFloat(e.target.value))}
                    placeholder="50"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carriers Settings */}
        <TabsContent value="carriers" className="mt-6 space-y-6">
          <CarriersSettings config={config} updateConfig={updateConfig} />
        </TabsContent>

        {/* Legal Settings */}
        <TabsContent value="legal" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Informations légales
              </CardTitle>
              <CardDescription>
                Ces informations apparaissent sur les bons de commande, bons de livraison et factures PDF envoyés aux clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Raison sociale</Label>
                  <Input
                    value={config.legal.companyName}
                    onChange={(e) => updateConfig('legal', 'companyName', e.target.value)}
                    placeholder="Faith Shop SAS"
                  />
                </div>
                <div className="space-y-2">
                  <Label>N° SIRET</Label>
                  <Input
                    value={config.legal.siret}
                    onChange={(e) => updateConfig('legal', 'siret', e.target.value)}
                    placeholder="123 456 789 00012"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse du siège</Label>
                <Input
                  value={config.legal.address}
                  onChange={(e) => updateConfig('legal', 'address', e.target.value)}
                  placeholder="1 rue du Commerce"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Code postal</Label>
                  <Input
                    value={config.legal.zip}
                    onChange={(e) => updateConfig('legal', 'zip', e.target.value)}
                    placeholder="75001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={config.legal.city}
                    onChange={(e) => updateConfig('legal', 'city', e.target.value)}
                    placeholder="Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Input
                    value={config.legal.country}
                    onChange={(e) => updateConfig('legal', 'country', e.target.value)}
                    placeholder="France"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>N° TVA Intracommunautaire</Label>
                  <Input
                    value={config.legal.tvaNumber}
                    onChange={(e) => updateConfig('legal', 'tvaNumber', e.target.value)}
                    placeholder="FR 12 345678901"
                  />
                  <p className="text-xs text-muted-foreground">Laissez vide si micro-entreprise non assujettie à la TVA</p>
                </div>
                <div className="space-y-2">
                  <Label>RCS</Label>
                  <Input
                    value={config.legal.rcs}
                    onChange={(e) => updateConfig('legal', 'rcs', e.target.value)}
                    placeholder="RCS Paris 123 456 789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emails transactionnels</CardTitle>
              <CardDescription>Gérez les notifications automatiques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'orderConfirmation', label: 'Confirmation de commande', desc: 'Envoyer un email après chaque commande' },
                { key: 'shippingUpdates', label: 'Mises à jour d\'expédition', desc: 'Notifier les changements de statut' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                  <Switch
                    checked={config.notifications[key as keyof typeof config.notifications] as boolean}
                    onCheckedChange={(checked) => updateConfig('notifications', key as keyof typeof config.notifications, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emails marketing</CardTitle>
              <CardDescription>Relances automatiques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium">Panier abandonné</p>
                  <p className="text-sm text-gray-500">Rappeler les paniers non finalisés</p>
                </div>
                <Switch
                  checked={config.notifications.abandonedCart}
                  onCheckedChange={(checked) => updateConfig('notifications', 'abandonedCart', checked)}
                />
              </div>

              {config.notifications.abandonedCart && (
                <div className="space-y-2">
                  <Label>Délai avant relance (heures)</Label>
                  <Input
                    type="number"
                    value={config.notifications.abandonedCartDelay}
                    onChange={(e) => updateConfig('notifications', 'abandonedCartDelay', parseInt(e.target.value))}
                    placeholder="24"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium">Demande d'avis</p>
                  <p className="text-sm text-gray-500">Demander un avis après livraison</p>
                </div>
                <Switch
                  checked={config.notifications.reviewReminder}
                  onCheckedChange={(checked) => updateConfig('notifications', 'reviewReminder', checked)}
                />
              </div>

              {config.notifications.reviewReminder && (
                <div className="space-y-2">
                  <Label>Délai après livraison (jours)</Label>
                  <Input
                    type="number"
                    value={config.notifications.reviewReminderDelay}
                    onChange={(e) => updateConfig('notifications', 'reviewReminderDelay', parseInt(e.target.value))}
                    placeholder="7"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save indicator */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span className="text-sm">Modifications non enregistrées</span>
          <Button size="sm" variant="secondary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
          </Button>
        </div>
      )}
    </div>
  )
}

// --- Carriers Settings Sub-Component ---

function CarriersSettings({
  config,
  updateConfig
}: {
  config: SiteConfig
  updateConfig: <K extends keyof SiteConfig>(section: K, key: keyof SiteConfig[K], value: SiteConfig[K][keyof SiteConfig[K]]) => void
}) {
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; error?: string }>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const togglePassword = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const testLaPosteConnection = async () => {
    if (!config.carriers.laposteApiKey.trim()) return
    setTesting('laposte')
    try {
      const res = await fetch('/api/admin/carriers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier: 'laposte', apiKey: config.carriers.laposteApiKey })
      })
      const result = await res.json()
      setTestResults(prev => ({ ...prev, laposte: result }))
    } catch {
      setTestResults(prev => ({ ...prev, laposte: { ok: false, error: 'Erreur réseau' } }))
    } finally {
      setTesting(null)
    }
  }

  return (
    <>
      {/* La Poste - Tracking API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex gap-2">
              <Image src="/logos/colissimo.svg" alt="Colissimo" width={80} height={24} className="object-contain" />
              <Image src="/logos/chronopost.svg" alt="Chronopost" width={80} height={24} className="object-contain" />
            </div>
            Suivi automatique
          </CardTitle>
          <CardDescription>
            Tracking automatique via l'API La Poste Suivi v2. Gratuit.
            Créez un compte sur{' '}
            <a href="https://developer.laposte.fr" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
              developer.laposte.fr
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Clé API (X-Okapi-Key)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPasswords['laposteApiKey'] ? 'text' : 'password'}
                  value={config.carriers.laposteApiKey}
                  onChange={(e) => updateConfig('carriers', 'laposteApiKey', e.target.value)}
                  placeholder="Votre clé API La Poste..."
                />
                <button
                  type="button"
                  onClick={() => togglePassword('laposteApiKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords['laposteApiKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                variant="outline"
                onClick={testLaPosteConnection}
                disabled={testing === 'laposte' || !config.carriers.laposteApiKey.trim()}
              >
                {testing === 'laposte' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Tester'
                )}
              </Button>
            </div>
            {testResults.laposte && (
              <div className={cn(
                'flex items-center gap-2 text-sm p-2 rounded',
                testResults.laposte.ok
                  ? 'text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400'
                  : 'text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400'
              )}>
                {testResults.laposte.ok ? (
                  <><CheckCircle2 className="h-4 w-4" /> Connexion réussie</>
                ) : (
                  <><XCircle className="h-4 w-4" /> {testResults.laposte.error}</>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Cette clé permet le suivi automatique des colis Colissimo et Chronopost. Le cron s'exécute toutes les 4h.
          </p>
        </CardContent>
      </Card>

      {/* Colissimo - Label API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Image src="/logos/colissimo.svg" alt="Colissimo" width={100} height={30} className="object-contain" />
            Étiquettes
          </CardTitle>
          <CardDescription>
            Génération d'étiquettes via l'API Colissimo. Nécessite un contrat professionnel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Numéro de contrat</Label>
              <Input
                value={config.carriers.colissimoContractNumber}
                onChange={(e) => updateConfig('carriers', 'colissimoContractNumber', e.target.value)}
                placeholder="123456"
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <div className="relative">
                <Input
                  type={showPasswords['colissimoPassword'] ? 'text' : 'password'}
                  value={config.carriers.colissimoPassword}
                  onChange={(e) => updateConfig('carriers', 'colissimoPassword', e.target.value)}
                  placeholder="Mot de passe API Colissimo"
                />
                <button
                  type="button"
                  onClick={() => togglePassword('colissimoPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords['colissimoPassword'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Permet de générer des étiquettes Colissimo directement depuis la page commande.
          </p>
        </CardContent>
      </Card>

      {/* Mondial Relay */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Image src="/logos/mondial-relay.svg" alt="Mondial Relay" width={100} height={30} className="object-contain" />
            Étiquettes & Points Relais
          </CardTitle>
          <CardDescription>
            Étiquettes et recherche de points relais. Nécessite un contrat professionnel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Code enseigne</Label>
              <Input
                value={config.carriers.mondialRelayEnseigne}
                onChange={(e) => updateConfig('carriers', 'mondialRelayEnseigne', e.target.value)}
                placeholder="BDTEST"
              />
            </div>
            <div className="space-y-2">
              <Label>Clé privée</Label>
              <div className="relative">
                <Input
                  type={showPasswords['mondialRelayKey'] ? 'text' : 'password'}
                  value={config.carriers.mondialRelayPrivateKey}
                  onChange={(e) => updateConfig('carriers', 'mondialRelayPrivateKey', e.target.value)}
                  placeholder="Clé secrète Mondial Relay"
                />
                <button
                  type="button"
                  onClick={() => togglePassword('mondialRelayKey')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords['mondialRelayKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Permet la création d'étiquettes Mondial Relay et la recherche de points relais au checkout.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
