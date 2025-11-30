'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { getIntegrations, updateIntegration } from '@/app/actions/admin/cms'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true)
  const [integrations, setIntegrations] = useState<any[]>([])
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const data = await getIntegrations()
      setIntegrations(data)
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (provider: string, isEnabled: boolean, config: any) => {
    setSaving(provider)
    try {
      await updateIntegration(provider, { isEnabled, config })
      toast.success('Configuration enregistrée')
      loadData() // Reload to get fresh state
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(null)
    }
  }

  // Helper to get config value safely
  const getConfig = (provider: string, key: string) => {
    const integration = integrations.find(i => i.provider === provider)
    if (!integration || !integration.config) return ''
    try {
      const parsed = JSON.parse(integration.config)
      return parsed[key] || ''
    } catch {
      return ''
    }
  }

  const isEnabled = (provider: string) => {
    return integrations.find(i => i.provider === provider)?.isEnabled || false
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intégrations & SEO</h1>
          <p className="text-muted-foreground mt-2">Gérez vos outils tiers (Google, Facebook, etc.)</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Google Analytics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
              Google Analytics 4
            </CardTitle>
            <Switch 
              checked={isEnabled('google_analytics')}
              onCheckedChange={(checked) => handleSave('google_analytics', checked, { measurementId: getConfig('google_analytics', 'measurementId') })}
            />
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Measurement ID (G-XXXXXXXXXX)</label>
              <div className="flex gap-2">
                <Input 
                  defaultValue={getConfig('google_analytics', 'measurementId')}
                  placeholder="G-..."
                  id="ga-id"
                />
                <Button 
                  onClick={() => {
                    const val = (document.getElementById('ga-id') as HTMLInputElement).value
                    handleSave('google_analytics', isEnabled('google_analytics'), { measurementId: val })
                  }}
                  disabled={saving === 'google_analytics'}
                >
                  {saving === 'google_analytics' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Ads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <img src="https://www.gstatic.com/android/market_images/web/favicon_v2.ico" className="w-5 h-5" alt="" />
              Google Ads
            </CardTitle>
            <Switch 
              checked={isEnabled('google_ads')}
              onCheckedChange={(checked) => handleSave('google_ads', checked, { conversionId: getConfig('google_ads', 'conversionId') })}
            />
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Conversion ID (AW-XXXXXXXXXX)</label>
              <div className="flex gap-2">
                <Input 
                  defaultValue={getConfig('google_ads', 'conversionId')}
                  placeholder="AW-..."
                  id="gads-id"
                />
                <Button 
                  onClick={() => {
                    const val = (document.getElementById('gads-id') as HTMLInputElement).value
                    handleSave('google_ads', isEnabled('google_ads'), { conversionId: val })
                  }}
                  disabled={saving === 'google_ads'}
                >
                  {saving === 'google_ads' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facebook Pixel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <img src="https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico" className="w-5 h-5" alt="" />
              Facebook Pixel
            </CardTitle>
            <Switch 
              checked={isEnabled('facebook_pixel')}
              onCheckedChange={(checked) => handleSave('facebook_pixel', checked, { pixelId: getConfig('facebook_pixel', 'pixelId') })}
            />
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Pixel ID</label>
              <div className="flex gap-2">
                <Input 
                  defaultValue={getConfig('facebook_pixel', 'pixelId')}
                  placeholder="1234567890"
                  id="fb-id"
                />
                <Button 
                  onClick={() => {
                    const val = (document.getElementById('fb-id') as HTMLInputElement).value
                    handleSave('facebook_pixel', isEnabled('facebook_pixel'), { pixelId: val })
                  }}
                  disabled={saving === 'facebook_pixel'}
                >
                  {saving === 'facebook_pixel' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
