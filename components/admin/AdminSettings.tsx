'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Settings,
  Save,
  Globe,
  Mail,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Faith Shop',
    siteDescription: 'E-commerce moderne et élégant',
    contactEmail: 'contact@faithshop.com',
    currency: 'EUR',
    taxRate: 20,
    notifications: {
      orderEmails: true,
      lowStock: true,
      newCustomers: true,
      dailyReports: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      ipRestriction: false
    },
    appearance: {
      darkMode: 'auto',
      primaryColor: '#1f2937',
      compactMode: false
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)

  const handleSave = async (section: string) => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavedSection(section)
      setTimeout(() => setSavedSection(null), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const dataToExport = {
      products: 'export_products.json',
      orders: 'export_orders.json',
      customers: 'export_customers.json'
    }
    console.log('Exporting data:', dataToExport)
  }

  const handleImport = () => {
    console.log('Opening import dialog...')
  }

  const settingsSections = [
    {
      id: 'general',
      title: 'Général',
      description: 'Paramètres généraux de votre boutique',
      icon: Settings
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Gestion des notifications par email',
      icon: Bell
    },
    {
      id: 'security',
      title: 'Sécurité',
      description: 'Paramètres de sécurité et authentification',
      icon: Shield
    },
    {
      id: 'appearance',
      title: 'Apparence',
      description: 'Personnalisation de l\'interface',
      icon: Palette
    },
    {
      id: 'data',
      title: 'Données',
      description: 'Import/Export et sauvegarde',
      icon: Database
    }
  ]

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Paramètres
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configuration et personnalisation de Faith Shop
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="space-y-4">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.id} className="border-0 shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{section.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Paramètres généraux</CardTitle>
                {savedSection === 'general' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Sauvegardé</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du site
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email de contact
                  </label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description du site
                </label>
                <Input
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Devise
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                    <option value="GBP">Livre Sterling (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Taux de TVA (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('general')}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                <Save className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                {savedSection === 'notifications' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Sauvegardé</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Emails de commandes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notifications lors de nouvelles commandes</p>
                </div>
                <Switch
                  checked={settings.notifications.orderEmails}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, orderEmails: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Stock faible</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alertes de stock bas</p>
                </div>
                <Switch
                  checked={settings.notifications.lowStock}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, lowStock: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Nouveaux clients</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notifications des inscriptions</p>
                </div>
                <Switch
                  checked={settings.notifications.newCustomers}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, newCustomers: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Rapports quotidiens</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Résumé quotidien des ventes</p>
                </div>
                <Switch
                  checked={settings.notifications.dailyReports}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, dailyReports: checked }
                    }))
                  }
                />
              </div>

              <Button
                onClick={() => handleSave('notifications')}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                <Save className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Sécurité</CardTitle>
                {savedSection === 'security' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Sauvegardé</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Authentification à deux facteurs</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sécurité renforcée pour l'admin</p>
                </div>
                <Switch
                  checked={settings.security.twoFactor}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactor: checked }
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Délai d'expiration de session (minutes)
                </label>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: Number(e.target.value) }
                  }))}
                  className="bg-gray-50 border-gray-200 max-w-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Restriction IP</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Limiter l'accès admin par IP</p>
                </div>
                <Switch
                  checked={settings.security.ipRestriction}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, ipRestriction: checked }
                    }))
                  }
                />
              </div>

              <Button
                onClick={() => handleSave('security')}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                <Save className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold">Gestion des données</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Exporter les données</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleImport}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="h-5 w-5" />
                  <span>Importer les données</span>
                </Button>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-400">Zone de danger</p>
                    <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                      Ces actions sont irréversibles. Assurez-vous d'avoir une sauvegarde.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-3"
                      onClick={() => console.log('Reset data confirmation needed')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Réinitialiser les données
                    </Button>
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