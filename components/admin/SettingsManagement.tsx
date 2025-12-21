'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Shield,
  Mail,
  CreditCard,
  Truck,
  Globe,
  Server,
  Database,
  Key,
  Save,
  AlertTriangle,
  CheckCircle,
  Users,
  ShoppingCart,
  Package
} from 'lucide-react'
import { toast } from 'sonner'

interface SecuritySettings {
  twoFactorAuth: boolean
  loginAttempts: number
  sessionTimeout: number
  ipWhitelist: string[]
  passwordPolicy: {
    minLength: number
    requireSpecialChars: boolean
    requireNumbers: boolean
    requireUppercase: boolean
  }
}

interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun'
  host: string
  port: number
  username: string
  password: string
  fromEmail: string
  fromName: string
  templates: {
    welcome: boolean
    orderConfirmation: boolean
    shipping: boolean
    newsletter: boolean
  }
}

interface PaymentSettings {
  stripe: {
    enabled: boolean
    publishableKey: string
    secretKey: string
    webhookSecret: string
  }
  paypal: {
    enabled: boolean
    clientId: string
    clientSecret: string
  }
  applePay: boolean
  googlePay: boolean
}

interface ShippingSettings {
  zones: Array<{
    id: string
    name: string
    countries: string[]
    rates: Array<{
      name: string
      price: number
      estimatedDays: string
    }>
  }>
  freeShippingThreshold: number
  defaultEstimatedDays: string
}

interface GeneralSettings {
  storeName: string
  storeDescription: string
  currency: string
  timezone: string
  language: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  guestCheckout: boolean
}

export function SettingsManagement() {
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    storeName: 'Faith Shop',
    storeDescription: 'Mode Chrétienne Premium & Éthique',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    language: 'fr',
    maintenanceMode: false,
    registrationEnabled: true,
    guestCheckout: true
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginAttempts: 5,
    sessionTimeout: 30,
    ipWhitelist: [],
    passwordPolicy: {
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true
    }
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    provider: 'smtp',
    host: '',
    port: 587,
    username: '',
    password: '',
    fromEmail: 'contact@faith-shop.fr',
    fromName: 'Faith Shop',
    templates: {
      welcome: true,
      orderConfirmation: true,
      shipping: true,
      newsletter: false
    }
  })

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripe: {
      enabled: true,
      publishableKey: '',
      secretKey: '',
      webhookSecret: ''
    },
    paypal: {
      enabled: false,
      clientId: '',
      clientSecret: ''
    },
    applePay: false,
    googlePay: false
  })

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    zones: [
      {
        id: '1',
        name: 'France',
        countries: ['FR'],
        rates: [
          { name: 'Standard', price: 4.99, estimatedDays: '3-5 jours' },
          { name: 'Express', price: 9.99, estimatedDays: '1-2 jours' }
        ]
      },
      {
        id: '2',
        name: 'Europe',
        countries: ['DE', 'BE', 'IT', 'ES', 'NL'],
        rates: [
          { name: 'Standard', price: 7.99, estimatedDays: '5-7 jours' },
          { name: 'Express', price: 14.99, estimatedDays: '2-3 jours' }
        ]
      }
    ],
    freeShippingThreshold: 50,
    defaultEstimatedDays: '3-5 jours'
  })

  const systemStats = {
    uptime: '99.9%',
    storage: { used: 2.3, total: 10, unit: 'GB' },
    bandwidth: { used: 15.2, total: 100, unit: 'GB' },
    apiCalls: { today: 1247, limit: 10000 }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      console.log('Chargement des paramètres...')
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    }
  }

  const saveAllSettings = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Paramètres sauvegardés avec succès')
      setHasChanges(false)
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const updateGeneralSetting = (key: keyof GeneralSettings, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateSecuritySetting = (key: keyof SecuritySettings | string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      setSecuritySettings(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof SecuritySettings], [child]: value }
      }))
    } else {
      setSecuritySettings(prev => ({ ...prev, [key]: value }))
    }
    setHasChanges(true)
  }

  const updateEmailSetting = (key: keyof EmailSettings | string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      setEmailSettings(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof EmailSettings], [child]: value }
      }))
    } else {
      setEmailSettings(prev => ({ ...prev, [key]: value }))
    }
    setHasChanges(true)
  }

  const updatePaymentSetting = (key: string, value: any) => {
    const keys = key.split('.')
    if (keys.length === 2) {
      const [parent, child] = keys
      setPaymentSettings(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof PaymentSettings], [child]: value }
      }))
    } else {
      setPaymentSettings(prev => ({ ...prev, [key]: value }))
    }
    setHasChanges(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Paramètres du système
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configuration générale et paramètres avancés de la boutique
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 dark:text-orange-400">
              Modifications non sauvegardées
            </span>
          )}
          <Button
            onClick={saveAllSettings}
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

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disponibilité</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.uptime}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stockage</p>
                <p className="text-2xl font-bold">
                  {systemStats.storage.used}/{systemStats.storage.total} {systemStats.storage.unit}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bande passante</p>
                <p className="text-2xl font-bold">
                  {systemStats.bandwidth.used}/{systemStats.bandwidth.total} {systemStats.bandwidth.unit}
                </p>
              </div>
              <Server className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">API Calls</p>
                <p className="text-2xl font-bold">
                  {systemStats.apiCalls.today.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">/ {systemStats.apiCalls.limit.toLocaleString()}</p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Livraison
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom de la boutique</Label>
                  <Input
                    value={generalSettings.storeName}
                    onChange={(e) => updateGeneralSetting('storeName', e.target.value)}
                    placeholder="Faith Shop"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={generalSettings.storeDescription}
                    onChange={(e) => updateGeneralSetting('storeDescription', e.target.value)}
                    placeholder="Mode Chrétienne Premium"
                  />
                </div>
                <div>
                  <Label>Devise</Label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) => updateGeneralSetting('currency', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <Label>Fuseau horaire</Label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => updateGeneralSetting('timezone', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Mode maintenance</Label>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => updateGeneralSetting('maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Inscription ouverte</Label>
                  <Switch
                    checked={generalSettings.registrationEnabled}
                    onCheckedChange={(checked) => updateGeneralSetting('registrationEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Commande invité</Label>
                  <Switch
                    checked={generalSettings.guestCheckout}
                    onCheckedChange={(checked) => updateGeneralSetting('guestCheckout', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Politique de mot de passe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Longueur minimale</Label>
                <Input
                  type="number"
                  value={securitySettings.passwordPolicy.minLength}
                  onChange={(e) => updateSecuritySetting('passwordPolicy.minLength', parseInt(e.target.value))}
                  min="6"
                  max="32"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Caractères spéciaux requis</Label>
                  <Switch
                    checked={securitySettings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => updateSecuritySetting('passwordPolicy.requireSpecialChars', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Chiffres requis</Label>
                  <Switch
                    checked={securitySettings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => updateSecuritySetting('passwordPolicy.requireNumbers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Majuscules requises</Label>
                  <Switch
                    checked={securitySettings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => updateSecuritySetting('passwordPolicy.requireUppercase', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contrôle d'accès</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tentatives de connexion max</Label>
                <Input
                  type="number"
                  value={securitySettings.loginAttempts}
                  onChange={(e) => updateSecuritySetting('loginAttempts', parseInt(e.target.value))}
                  min="3"
                  max="10"
                />
              </div>
              <div>
                <Label>Timeout session (minutes)</Label>
                <Input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                  min="15"
                  max="480"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Double authentification</Label>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration SMTP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Serveur SMTP</Label>
                  <Input
                    value={emailSettings.host}
                    onChange={(e) => updateEmailSetting('host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={emailSettings.port}
                    onChange={(e) => updateEmailSetting('port', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
                <div>
                  <Label>Nom d'utilisateur</Label>
                  <Input
                    value={emailSettings.username}
                    onChange={(e) => updateEmailSetting('username', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label>Mot de passe</Label>
                  <Input
                    type="password"
                    value={emailSettings.password}
                    onChange={(e) => updateEmailSetting('password', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label>Email expéditeur</Label>
                  <Input
                    value={emailSettings.fromEmail}
                    onChange={(e) => updateEmailSetting('fromEmail', e.target.value)}
                    placeholder="contact@faith-shop.fr"
                  />
                </div>
                <div>
                  <Label>Nom expéditeur</Label>
                  <Input
                    value={emailSettings.fromName}
                    onChange={(e) => updateEmailSetting('fromName', e.target.value)}
                    placeholder="Faith Shop"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates d'email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(emailSettings.templates).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updateEmailSetting(`templates.${key}`, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stripe</CardTitle>
                <Switch
                  checked={paymentSettings.stripe.enabled}
                  onCheckedChange={(checked) => updatePaymentSetting('stripe.enabled', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Clé publique</Label>
                <Input
                  value={paymentSettings.stripe.publishableKey}
                  onChange={(e) => updatePaymentSetting('stripe.publishableKey', e.target.value)}
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <Label>Clé secrète</Label>
                <Input
                  type="password"
                  value={paymentSettings.stripe.secretKey}
                  onChange={(e) => updatePaymentSetting('stripe.secretKey', e.target.value)}
                  placeholder="sk_test_..."
                />
              </div>
              <div>
                <Label>Webhook secret</Label>
                <Input
                  type="password"
                  value={paymentSettings.stripe.webhookSecret}
                  onChange={(e) => updatePaymentSetting('stripe.webhookSecret', e.target.value)}
                  placeholder="whsec_..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>PayPal</CardTitle>
                <Switch
                  checked={paymentSettings.paypal.enabled}
                  onCheckedChange={(checked) => updatePaymentSetting('paypal.enabled', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Client ID</Label>
                <Input
                  value={paymentSettings.paypal.clientId}
                  onChange={(e) => updatePaymentSetting('paypal.clientId', e.target.value)}
                  placeholder="AeA1QIZXlXsq..."
                />
              </div>
              <div>
                <Label>Client Secret</Label>
                <Input
                  type="password"
                  value={paymentSettings.paypal.clientSecret}
                  onChange={(e) => updatePaymentSetting('paypal.clientSecret', e.target.value)}
                  placeholder="ELLpjKlT..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paiements mobiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Apple Pay</Label>
                <Switch
                  checked={paymentSettings.applePay}
                  onCheckedChange={(checked) => updatePaymentSetting('applePay', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Google Pay</Label>
                <Switch
                  checked={paymentSettings.googlePay}
                  onCheckedChange={(checked) => updatePaymentSetting('googlePay', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration générale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Seuil livraison gratuite (€)</Label>
                <Input
                  type="number"
                  value={shippingSettings.freeShippingThreshold}
                  onChange={(e) => setShippingSettings(prev => ({
                    ...prev,
                    freeShippingThreshold: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="50"
                />
              </div>
              <div>
                <Label>Délai par défaut</Label>
                <Input
                  value={shippingSettings.defaultEstimatedDays}
                  onChange={(e) => setShippingSettings(prev => ({
                    ...prev,
                    defaultEstimatedDays: e.target.value
                  }))}
                  placeholder="3-5 jours"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zones de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shippingSettings.zones.map((zone) => (
                  <div key={zone.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{zone.name}</h4>
                      <Badge variant="outline">
                        {zone.countries.length} pays
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {zone.rates.map((rate, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{rate.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{rate.price}€</span>
                            <span className="text-gray-500">({rate.estimatedDays})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}