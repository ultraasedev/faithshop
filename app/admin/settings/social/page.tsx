'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Trash2,
  Save,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Hash as Tiktok,
  LinkIcon,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { getSiteConfigs, upsertSiteConfig, deleteSiteConfig } from '@/app/actions/admin/settings'

interface SocialLink {
  id?: string
  platform: string
  url: string
  isVisible: boolean
  displayName?: string
  icon?: string
}

const platformOptions = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-black' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-600' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { value: 'tiktok', label: 'TikTok', icon: Tiktok, color: 'bg-black' },
  { value: 'custom', label: 'Lien personnalisé', icon: LinkIcon, color: 'bg-gray-600' }
]

export default function SocialSettingsPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSocialLinks()
  }, [])

  const loadSocialLinks = async () => {
    try {
      const configs = await getSiteConfigs('social')
      const links = configs.map(config => ({
        id: config.key,
        platform: config.key.replace('social_', ''),
        url: JSON.parse(config.value).url || '',
        isVisible: JSON.parse(config.value).isVisible || true,
        displayName: JSON.parse(config.value).displayName || ''
      }))
      setSocialLinks(links)
    } catch (error) {
      console.error('Error loading social links:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, {
      platform: 'instagram',
      url: '',
      isVisible: true,
      displayName: ''
    }])
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: any) => {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], [field]: value }
    setSocialLinks(updated)
  }

  const removeSocialLink = async (index: number) => {
    const link = socialLinks[index]
    if (link.id) {
      try {
        await deleteSiteConfig(link.id)
        toast.success('Lien supprimé')
      } catch (error) {
        toast.error('Erreur lors de la suppression')
        return
      }
    }
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const saveSocialLinks = async () => {
    setSaving(true)
    try {
      for (const link of socialLinks) {
        if (link.url.trim()) {
          const key = `social_${link.platform}_${Date.now()}`
          const value = JSON.stringify({
            url: link.url,
            isVisible: link.isVisible,
            displayName: link.displayName
          })

          await upsertSiteConfig({
            key: link.id || key,
            value,
            type: 'json',
            category: 'social',
            label: `${link.platform} Link`,
            description: `Social media link for ${link.platform}`
          })
        }
      }

      await loadSocialLinks()
      toast.success('Liens sociaux sauvegardés')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const getPlatformInfo = (platform: string) => {
    return platformOptions.find(p => p.value === platform) || platformOptions[0]
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Réseaux Sociaux</h1>
          <p className="text-muted-foreground">
            Gérez les liens vers vos réseaux sociaux affichés sur le site
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={addSocialLink} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un lien
          </Button>
          <Button onClick={saveSocialLinks} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {socialLinks.map((link, index) => {
          const platformInfo = getPlatformInfo(link.platform)
          const IconComponent = platformInfo.icon

          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-12 md:items-end">

                  {/* Platform Selection */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`platform-${index}`}>Plateforme</Label>
                    <select
                      id={`platform-${index}`}
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="w-full h-9 px-3 py-1 text-sm border border-input bg-background rounded-md"
                    >
                      {platformOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Platform Preview */}
                  <div className="md:col-span-1 flex justify-center">
                    <div className={`h-9 w-9 rounded-md flex items-center justify-center text-white ${platformInfo.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>

                  {/* URL */}
                  <div className="md:col-span-4">
                    <Label htmlFor={`url-${index}`}>URL</Label>
                    <Input
                      id={`url-${index}`}
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder={`https://${link.platform}.com/faithshop`}
                    />
                  </div>

                  {/* Display Name */}
                  {link.platform === 'custom' && (
                    <div className="md:col-span-2">
                      <Label htmlFor={`name-${index}`}>Nom d'affichage</Label>
                      <Input
                        id={`name-${index}`}
                        value={link.displayName || ''}
                        onChange={(e) => updateSocialLink(index, 'displayName', e.target.value)}
                        placeholder="Mon site"
                      />
                    </div>
                  )}

                  {/* Visibility */}
                  <div className="md:col-span-1 flex items-center gap-2">
                    <Switch
                      checked={link.isVisible}
                      onCheckedChange={(checked) => updateSocialLink(index, 'isVisible', checked)}
                    />
                    {link.isVisible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSocialLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {socialLinks.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="text-muted-foreground mb-4">
                <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun lien social configuré</p>
                <p className="text-sm">Ajoutez des liens vers vos réseaux sociaux</p>
              </div>
              <Button onClick={addSocialLink}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier lien
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview */}
      {socialLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {socialLinks
                .filter(link => link.isVisible && link.url.trim())
                .map((link, index) => {
                  const platformInfo = getPlatformInfo(link.platform)
                  const IconComponent = platformInfo.icon

                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-secondary transition-colors"
                      title={link.displayName || platformInfo.label}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center text-white ${platformInfo.color}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <span className="text-sm">
                        {link.displayName || platformInfo.label}
                      </span>
                    </a>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Impact SEO & Marketing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2 text-green-700">✅ Avantages SEO</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Signaux sociaux pour Google</li>
                <li>• Augmentation du trafic de référence</li>
                <li>• Amélioration de la notoriété de marque</li>
                <li>• Backlinks de qualité depuis les plateformes sociales</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-700">📊 Conseils Marketing</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Utilisez des URLs cohérentes (@faithshop)</li>
                <li>• Maintenez une présence active sur chaque plateforme</li>
                <li>• Créez du contenu engageant et authentique</li>
                <li>• Mesurez les conversions depuis chaque réseau</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}