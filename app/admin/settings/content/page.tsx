'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Type,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Languages
} from 'lucide-react'
import { toast } from 'sonner'
import { getSiteConfigs, upsertSiteConfig } from '@/app/actions/admin/settings'
import { TranslationWatcher } from '@/lib/translation-watcher'

interface ContentConfig {
  // En-têtes et textes principaux
  siteTitle: string
  siteSlogan: string
  heroTitle: string
  heroSubtitle: string
  aboutTitle: string
  aboutDescription: string

  // Contact
  contactPhone: string
  contactEmail: string
  contactAddress: string
  supportHours: string

  // Footer
  footerCopyright: string
  footerDescription: string

  // Textes interface
  cartEmptyText: string
  checkoutTitle: string
  orderSuccessMessage: string
  shippingInfoText: string

  // Politiques
  shippingPolicyText: string
  returnPolicyText: string
  privacyPolicyText: string

  // Messages système
  addToCartText: string
  outOfStockText: string
  lowStockWarning: string
  thankYouMessage: string
}

const defaultContent: ContentConfig = {
  siteTitle: 'Faith Shop',
  siteSlogan: 'Mode chrétienne premium & éthique',
  heroTitle: 'L\'élégance de la foi',
  heroSubtitle: 'Collection intemporelle de vêtements unisexe inspirés par la foi chrétienne',
  aboutTitle: 'Notre Mission',
  aboutDescription: 'Faith Shop est né d\'une passion pour la mode et la foi. Nous créons des vêtements qui permettent d\'exprimer sa spiritualité avec style et élégance.',

  contactPhone: '+33 1 23 45 67 89',
  contactEmail: 'contact@faith-shop.fr',
  contactAddress: '123 Rue de la Paix, 75001 Paris',
  supportHours: 'Lun-Ven 9h-18h, Sam 10h-17h',

  footerCopyright: 'Faith Shop. Tous droits réservés.',
  footerDescription: 'Mode chrétienne premium alliant style et spiritualité',

  cartEmptyText: 'Votre panier est vide',
  checkoutTitle: 'Finaliser ma commande',
  orderSuccessMessage: 'Merci pour votre commande ! Vous allez recevoir un email de confirmation.',
  shippingInfoText: 'Livraison offerte dès 100€ d\'achat',

  shippingPolicyText: 'Livraison gratuite dès 100€. Délai standard 2-3 jours ouvrés.',
  returnPolicyText: 'Retours gratuits sous 30 jours. Article en parfait état requis.',
  privacyPolicyText: 'Vos données sont protégées et utilisées uniquement pour traiter vos commandes.',

  addToCartText: 'Ajouter au panier',
  outOfStockText: 'Rupture de stock',
  lowStockWarning: 'Plus que {} exemplaires disponibles !',
  thankYouMessage: 'Merci de votre confiance !'
}

export default function ContentSettingsPage() {
  const [content, setContent] = useState<ContentConfig>(defaultContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const translationWatcherRef = useRef<TranslationWatcher | null>(null)

  useEffect(() => {
    loadContent()

    // Initialiser le système de surveillance des traductions
    translationWatcherRef.current = TranslationWatcher.getInstance()

    return () => {
      // Nettoyer les watchers au démontage
      translationWatcherRef.current?.cleanup()
    }
  }, [])

  const loadContent = async () => {
    try {
      const configs = await getSiteConfigs('content')
      const loadedContent = { ...defaultContent }

      configs.forEach(item => {
        const key = item.key.replace('content_', '')
        loadedContent[key as keyof ContentConfig] = item.value
      })

      setContent(loadedContent)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(content)) {
        await upsertSiteConfig({
          key: `content_${key}`,
          value: String(value),
          type: 'text',
          category: 'content',
          label: `Content ${key}`,
          description: `Contenu modifiable pour ${key}`
        })
      }

      toast.success('Contenu sauvegardé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (key: keyof ContentConfig, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }))

    // Déclencher auto-traduction en temps réel
    if (value.trim().length > 2) {
      setIsTranslating(true)
      translationWatcherRef.current?.watchValue(`content_${key}`, value)

      // Masquer l'indicateur de traduction après quelques secondes
      setTimeout(() => setIsTranslating(false), 5000)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contenus & Textes</h1>
          <p className="text-muted-foreground">
            Modifiez tous les textes affichés sur votre site
            {isTranslating && (
              <span className="inline-flex items-center gap-1 ml-2 text-blue-600">
                <Languages className="h-4 w-4 animate-pulse" />
                Traduction automatique en cours...
              </span>
            )}
          </p>
        </div>
        <Button onClick={saveContent} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      <Tabs defaultValue="main" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="main">Principal</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="policies">Politiques</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Textes principaux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="siteTitle">Titre du site</Label>
                  <Input
                    id="siteTitle"
                    value={content.siteTitle}
                    onChange={(e) => updateContent('siteTitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteSlogan">Slogan</Label>
                  <Input
                    id="siteSlogan"
                    value={content.siteSlogan}
                    onChange={(e) => updateContent('siteSlogan', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="heroTitle">Titre principal (Homepage)</Label>
                <Input
                  id="heroTitle"
                  value={content.heroTitle}
                  onChange={(e) => updateContent('heroTitle', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="heroSubtitle">Sous-titre (Homepage)</Label>
                <Textarea
                  id="heroSubtitle"
                  value={content.heroSubtitle}
                  onChange={(e) => updateContent('heroSubtitle', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="aboutTitle">Titre À Propos</Label>
                <Input
                  id="aboutTitle"
                  value={content.aboutTitle}
                  onChange={(e) => updateContent('aboutTitle', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="aboutDescription">Description À Propos</Label>
                <Textarea
                  id="aboutDescription"
                  value={content.aboutDescription}
                  onChange={(e) => updateContent('aboutDescription', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contactPhone">Téléphone</Label>
                  <Input
                    id="contactPhone"
                    value={content.contactPhone}
                    onChange={(e) => updateContent('contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    value={content.contactEmail}
                    onChange={(e) => updateContent('contactEmail', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactAddress">Adresse complète</Label>
                <Input
                  id="contactAddress"
                  value={content.contactAddress}
                  onChange={(e) => updateContent('contactAddress', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="supportHours">Horaires de support</Label>
                <Input
                  id="supportHours"
                  value={content.supportHours}
                  onChange={(e) => updateContent('supportHours', e.target.value)}
                  placeholder="Ex: Lun-Ven 9h-18h"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="footerCopyright">Copyright footer</Label>
                  <Input
                    id="footerCopyright"
                    value={content.footerCopyright}
                    onChange={(e) => updateContent('footerCopyright', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="footerDescription">Description footer</Label>
                  <Input
                    id="footerDescription"
                    value={content.footerDescription}
                    onChange={(e) => updateContent('footerDescription', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Textes de l'interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cartEmptyText">Panier vide</Label>
                  <Input
                    id="cartEmptyText"
                    value={content.cartEmptyText}
                    onChange={(e) => updateContent('cartEmptyText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="checkoutTitle">Titre checkout</Label>
                  <Input
                    id="checkoutTitle"
                    value={content.checkoutTitle}
                    onChange={(e) => updateContent('checkoutTitle', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="orderSuccessMessage">Message succès commande</Label>
                <Textarea
                  id="orderSuccessMessage"
                  value={content.orderSuccessMessage}
                  onChange={(e) => updateContent('orderSuccessMessage', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="shippingInfoText">Info livraison</Label>
                <Input
                  id="shippingInfoText"
                  value={content.shippingInfoText}
                  onChange={(e) => updateContent('shippingInfoText', e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="addToCartText">Bouton panier</Label>
                  <Input
                    id="addToCartText"
                    value={content.addToCartText}
                    onChange={(e) => updateContent('addToCartText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="outOfStockText">Rupture de stock</Label>
                  <Input
                    id="outOfStockText"
                    value={content.outOfStockText}
                    onChange={(e) => updateContent('outOfStockText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lowStockWarning">Alerte stock bas</Label>
                  <Input
                    id="lowStockWarning"
                    value={content.lowStockWarning}
                    onChange={(e) => updateContent('lowStockWarning', e.target.value)}
                    placeholder="Plus que {} exemplaires..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Politiques et conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shippingPolicyText">Politique de livraison</Label>
                <Textarea
                  id="shippingPolicyText"
                  value={content.shippingPolicyText}
                  onChange={(e) => updateContent('shippingPolicyText', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="returnPolicyText">Politique de retour</Label>
                <Textarea
                  id="returnPolicyText"
                  value={content.returnPolicyText}
                  onChange={(e) => updateContent('returnPolicyText', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="privacyPolicyText">Politique de confidentialité</Label>
                <Textarea
                  id="privacyPolicyText"
                  value={content.privacyPolicyText}
                  onChange={(e) => updateContent('privacyPolicyText', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages personnalisés</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="thankYouMessage">Message de remerciement</Label>
                <Textarea
                  id="thankYouMessage"
                  value={content.thankYouMessage}
                  onChange={(e) => updateContent('thankYouMessage', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Aperçu des modifications */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des modifications en temps réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 border-2 border-dashed border-border bg-secondary/20 space-y-4">
            <h2 className="font-serif text-2xl">{content.heroTitle}</h2>
            <p className="text-muted-foreground">{content.heroSubtitle}</p>
            <div className="flex gap-4 text-sm">
              <span>📞 {content.contactPhone}</span>
              <span>📧 {content.contactEmail}</span>
            </div>
            <Button variant="outline">
              {content.addToCartText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}