'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, RefreshCw, Truck, Package, Globe } from 'lucide-react'
import { getShippingSettings, updateShippingRate } from '@/app/actions/admin/shipping-settings'
import { upsertSiteConfig } from '@/app/actions/admin/settings'
import { toast } from 'sonner'

export default function ShippingSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    franceStandard: 4.90,
    franceExpress: 9.90,
    europe: 12.90,
    world: 24.90,
    freeThreshold: 100,
    processingTime: '24/48h ouvrées'
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getShippingSettings()
        setSettings(data)
      } catch (error) {
        console.error('Failed to load shipping settings:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Sauvegarder les tarifs de livraison
      await Promise.all([
        updateShippingRate('shipping_france_standard', settings.franceStandard),
        updateShippingRate('shipping_france_express', settings.franceExpress),
        updateShippingRate('shipping_europe', settings.europe),
        updateShippingRate('shipping_world', settings.world),
        upsertSiteConfig({
          key: 'shipping_free_threshold',
          value: settings.freeThreshold.toString(),
          type: 'number',
          category: 'shipping'
        }),
        upsertSiteConfig({
          key: 'shipping_processing_time',
          value: settings.processingTime,
          type: 'text',
          category: 'shipping'
        })
      ])

      toast.success('Paramètres de livraison sauvegardés !')
    } catch (error) {
      console.error('Failed to save shipping settings:', error)
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
          <h1 className="text-3xl font-bold">Paramètres de Livraison</h1>
          <p className="text-muted-foreground">Configurez vos tarifs et délais de livraison</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tarifs France */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              France Métropolitaine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Livraison Standard (Colissimo)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={settings.franceStandard}
                  onChange={(e) => setSettings({...settings, franceStandard: parseFloat(e.target.value) || 0})}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Livraison Express (Chronopost)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={settings.franceExpress}
                  onChange={(e) => setSettings({...settings, franceExpress: parseFloat(e.target.value) || 0})}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Livraison gratuite à partir de
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={settings.freeThreshold}
                  onChange={(e) => setSettings({...settings, freeThreshold: parseFloat(e.target.value) || 0})}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">€ d'achat</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarifs International */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              International
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Livraison Europe
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={settings.europe}
                  onChange={(e) => setSettings({...settings, europe: parseFloat(e.target.value) || 0})}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Livraison Monde
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={settings.world}
                  onChange={(e) => setSettings({...settings, world: parseFloat(e.target.value) || 0})}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Délais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Traitement et Expédition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">
                Délai de traitement
              </label>
              <Input
                value={settings.processingTime}
                onChange={(e) => setSettings({...settings, processingTime: e.target.value})}
                placeholder="24/48h ouvrées"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Temps de préparation avant expédition
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Aperçu */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu des tarifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>France Standard:</span>
                <span className="font-medium">{settings.franceStandard.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>France Express:</span>
                <span className="font-medium">{settings.franceExpress.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Europe:</span>
                <span className="font-medium">{settings.europe.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Monde:</span>
                <span className="font-medium">{settings.world.toFixed(2)}€</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-green-600">
                <span>Livraison gratuite:</span>
                <span className="font-medium">Dès {settings.freeThreshold}€</span>
              </div>
              <div className="flex justify-between">
                <span>Traitement:</span>
                <span className="font-medium">{settings.processingTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}