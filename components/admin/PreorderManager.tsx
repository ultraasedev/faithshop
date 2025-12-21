'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Settings, Save } from 'lucide-react'
import { toast } from 'sonner'

interface PreorderConfig {
  enabled: boolean
  message: string
  shippingDate: string
  showPages: string[]
}

export default function PreorderManager() {
  const [config, setConfig] = useState<PreorderConfig>({
    enabled: false,
    message: 'Expédition le 16 janvier 2025',
    shippingDate: '2025-01-16',
    showPages: ['product', 'checkout']
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Charger la configuration actuelle
  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/preorder-config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error)
      toast.error('Erreur lors du chargement de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/preorder-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast.success('Configuration sauvegardée avec succès')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const togglePage = (page: string) => {
    setConfig(prev => ({
      ...prev,
      showPages: prev.showPages.includes(page)
        ? prev.showPages.filter(p => p !== page)
        : [...prev.showPages, page]
    }))
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Gestion des Pré-commandes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Status général */}
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <div>
                <div className="font-medium">Système de pré-commande</div>
                <div className="text-sm text-muted-foreground">
                  {config.enabled ? 'Activé' : 'Désactivé'}
                </div>
              </div>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {config.enabled && (
            <>
              {/* Message du bandeau */}
              <div className="space-y-2">
                <Label htmlFor="message">Message du bandeau</Label>
                <Textarea
                  id="message"
                  value={config.message}
                  onChange={(e) => setConfig(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Ex: Expédition le 16 janvier 2025"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Ce message sera affiché dans le bandeau de pré-commande
                </p>
              </div>

              {/* Date d'expédition */}
              <div className="space-y-2">
                <Label htmlFor="shipping-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date d'expédition
                </Label>
                <Input
                  id="shipping-date"
                  type="date"
                  value={config.shippingDate}
                  onChange={(e) => setConfig(prev => ({ ...prev, shippingDate: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Date formatée : {formatDate(config.shippingDate)}
                </p>
              </div>

              {/* Pages d'affichage */}
              <div className="space-y-3">
                <Label>Pages d'affichage du bandeau</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'product', label: 'Pages produit' },
                    { key: 'checkout', label: 'Page de paiement' },
                    { key: 'shop', label: 'Page boutique' },
                    { key: 'home', label: 'Page d\'accueil' }
                  ].map(({ key, label }) => (
                    <Badge
                      key={key}
                      variant={config.showPages.includes(key) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => togglePage(key)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cliquez sur les badges pour activer/désactiver l'affichage
                </p>
              </div>

              {/* Aperçu */}
              <div className="space-y-2">
                <Label>Aperçu du bandeau</Label>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span className="font-medium">Pré-commande</span>
                    </div>
                    <div className="w-px h-4 bg-amber-300"></div>
                    <div className="flex items-center gap-2 text-amber-700">
                      <Calendar className="w-4 h-4" />
                      <span>{config.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={saveConfig}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}