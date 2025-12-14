'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Plus,
  Trash2,
  Globe,
  Languages,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { getSiteConfigs, upsertSiteConfig, deleteSiteConfig } from '@/app/actions/admin/settings'

interface Language {
  code: string
  name: string
  flag: string
  enabled: boolean
  isDefault: boolean
  completionRate: number
}

interface Translation {
  key: string
  fr: string
  [key: string]: string // Autres langues
}

const availableLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

const baseTranslations = [
  'nav.home', 'nav.shop', 'nav.about', 'nav.contact',
  'cart.empty', 'cart.add', 'cart.total', 'cart.checkout',
  'product.add_to_cart', 'product.out_of_stock', 'product.in_stock',
  'checkout.title', 'checkout.secure_payment',
  'order.success_title', 'order.success_message',
  'general.loading', 'general.save', 'general.cancel',
  'shipping.free_from', 'footer.copyright'
]

export default function LanguagesSettingsPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('fr')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoTranslating, setAutoTranslating] = useState(false)

  useEffect(() => {
    loadLanguagesAndTranslations()
  }, [])

  const loadLanguagesAndTranslations = async () => {
    try {
      const configs = await getSiteConfigs('i18n')

      // Charger les langues configurées
      const enabledLangs = configs
        .filter(c => c.key.endsWith('_enabled'))
        .map(c => {
          const code = c.key.replace('i18n_', '').replace('_enabled', '')
          const langInfo = availableLanguages.find(l => l.code === code) || {
            code,
            name: code.toUpperCase(),
            flag: '🏳️'
          }

          return {
            ...langInfo,
            enabled: c.value === 'true',
            isDefault: code === 'fr', // TODO: récupérer depuis la config
            completionRate: 100 // TODO: calculer le taux de completion
          }
        })

      // Si aucune langue configurée, ajouter français par défaut
      if (enabledLangs.length === 0) {
        enabledLangs.push({
          code: 'fr',
          name: 'Français',
          flag: '🇫🇷',
          enabled: true,
          isDefault: true,
          completionRate: 100
        })
      }

      setLanguages(enabledLangs)

      // Charger les traductions
      const translationConfigs = configs.filter(c =>
        !c.key.endsWith('_enabled') && !c.key.endsWith('_default_locale')
      )

      const translationMap: Record<string, Record<string, string>> = {}

      translationConfigs.forEach(config => {
        const parts = config.key.split('_')
        const lang = parts[1] // i18n_fr_nav.home -> 'fr'
        const key = parts.slice(2).join('_') // 'nav.home'

        if (!translationMap[key]) {
          translationMap[key] = {}
        }
        translationMap[key][lang] = config.value
      })

      // Convertir en array avec clés de base
      const translationsArray = baseTranslations.map(key => ({
        key,
        fr: translationMap[key]?.fr || '',
        ...Object.fromEntries(
          enabledLangs
            .filter(l => l.code !== 'fr')
            .map(l => [l.code, translationMap[key]?.[l.code] || ''])
        )
      }))

      setTranslations(translationsArray)
    } catch (error) {
      console.error('Error loading languages:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = async (langCode: string, enabled: boolean) => {
    try {
      await upsertSiteConfig({
        key: `i18n_${langCode}_enabled`,
        value: enabled ? 'true' : 'false',
        type: 'boolean',
        category: 'i18n',
        label: `${langCode} enabled`,
        description: `Enable/disable ${langCode} language`
      })

      setLanguages(prev => prev.map(lang =>
        lang.code === langCode ? { ...lang, enabled } : lang
      ))

      toast.success(`Langue ${langCode} ${enabled ? 'activée' : 'désactivée'}`)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const addLanguage = async (langCode: string) => {
    const langInfo = availableLanguages.find(l => l.code === langCode)
    if (!langInfo) return

    try {
      await upsertSiteConfig({
        key: `i18n_${langCode}_enabled`,
        value: 'true',
        type: 'boolean',
        category: 'i18n',
        label: `${langCode} enabled`,
        description: `Enable ${langInfo.name} language`
      })

      const newLang = {
        ...langInfo,
        enabled: true,
        isDefault: false,
        completionRate: 0
      }

      setLanguages(prev => [...prev, newLang])
      toast.success(`Langue ${langInfo.name} ajoutée`)
    } catch (error) {
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const removeLanguage = async (langCode: string) => {
    if (langCode === 'fr') {
      toast.error('Impossible de supprimer la langue française (langue de base)')
      return
    }

    try {
      await deleteSiteConfig(`i18n_${langCode}_enabled`)

      // Supprimer toutes les traductions pour cette langue
      const translationKeys = translations.map(t => `i18n_${langCode}_${t.key}`)
      for (const key of translationKeys) {
        try {
          await deleteSiteConfig(key)
        } catch (e) {
          // Ignorer si la clé n'existe pas
        }
      }

      setLanguages(prev => prev.filter(lang => lang.code !== langCode))
      toast.success(`Langue supprimée`)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const updateTranslation = async (key: string, langCode: string, value: string) => {
    try {
      await upsertSiteConfig({
        key: `i18n_${langCode}_${key}`,
        value,
        type: 'text',
        category: 'i18n',
        label: `Translation ${langCode} ${key}`,
        description: `Translation for ${key} in ${langCode}`
      })

      setTranslations(prev => prev.map(t =>
        t.key === key ? { ...t, [langCode]: value } : t
      ))
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const autoTranslateWithDeepL = async (targetLang: string) => {
    setAutoTranslating(true)

    try {
      // Récupérer tous les textes français
      const frenchTexts = translations.map(t => t.fr).filter(Boolean)
      const translationKeys = translations.map(t => t.key)

      // Traduire en batch avec DeepL
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch',
          texts: frenchTexts,
          targetLang
        })
      })

      const result = await response.json()

      if (result.success && result.translation) {
        // Sauvegarder chaque traduction
        for (let i = 0; i < translationKeys.length; i++) {
          await updateTranslation(translationKeys[i], targetLang, result.translation[i])
        }

        toast.success(`Traductions DeepL générées pour ${targetLang}`)
      } else {
        throw new Error('DeepL translation failed')
      }
    } catch (error) {
      console.error('DeepL translation error:', error)

      // Fallback sur traductions manuelles
      await autoTranslateManual(targetLang)
    } finally {
      setAutoTranslating(false)
    }
  }

  const autoTranslateManual = async (targetLang: string) => {
    // Traductions manuelles de base (fallback)
    const autoTranslations: Record<string, Record<string, string>> = {
      en: {
        'nav.home': 'Home',
        'nav.shop': 'Shop',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'cart.empty': 'Your cart is empty',
        'cart.add': 'Add to cart',
        'cart.total': 'Total',
        'cart.checkout': 'Checkout',
        'product.add_to_cart': 'Add to cart',
        'product.out_of_stock': 'Out of stock',
        'product.in_stock': 'In stock',
        'checkout.title': 'Checkout',
        'checkout.secure_payment': 'Secure payment',
        'order.success_title': 'Order confirmed!',
        'order.success_message': 'Thank you for your order',
        'general.loading': 'Loading...',
        'general.save': 'Save',
        'general.cancel': 'Cancel',
        'shipping.free_from': 'Free shipping from €{}',
        'footer.copyright': 'All rights reserved'
      },
      es: {
        'nav.home': 'Inicio',
        'nav.shop': 'Tienda',
        'nav.about': 'Acerca',
        'nav.contact': 'Contacto',
        'cart.empty': 'Tu carrito está vacío',
        'cart.add': 'Añadir al carrito',
        'cart.total': 'Total',
        'cart.checkout': 'Finalizar compra',
        'product.add_to_cart': 'Añadir al carrito',
        'product.out_of_stock': 'Agotado',
        'product.in_stock': 'En stock',
        'checkout.title': 'Finalizar compra',
        'checkout.secure_payment': 'Pago seguro',
        'order.success_title': '¡Pedido confirmado!',
        'order.success_message': 'Gracias por tu pedido',
        'general.loading': 'Cargando...',
        'general.save': 'Guardar',
        'general.cancel': 'Cancelar',
        'shipping.free_from': 'Envío gratis desde €{}',
        'footer.copyright': 'Todos los derechos reservados'
      },
      de: {
        'nav.home': 'Startseite',
        'nav.shop': 'Shop',
        'nav.about': 'Über uns',
        'nav.contact': 'Kontakt',
        'cart.empty': 'Ihr Warenkorb ist leer',
        'cart.add': 'In den Warenkorb',
        'cart.total': 'Gesamt',
        'cart.checkout': 'Zur Kasse',
        'product.add_to_cart': 'In den Warenkorb',
        'product.out_of_stock': 'Nicht vorrätig',
        'product.in_stock': 'Auf Lager',
        'checkout.title': 'Kasse',
        'checkout.secure_payment': 'Sichere Bezahlung',
        'order.success_title': 'Bestellung bestätigt!',
        'order.success_message': 'Vielen Dank für Ihre Bestellung',
        'general.loading': 'Laden...',
        'general.save': 'Speichern',
        'general.cancel': 'Abbrechen',
        'shipping.free_from': 'Kostenloser Versand ab €{}',
        'footer.copyright': 'Alle Rechte vorbehalten'
      }
    }

    try {
      const targetTranslations = autoTranslations[targetLang] || {}

      for (const [key, value] of Object.entries(targetTranslations)) {
        await updateTranslation(key, targetLang, value)
      }

      toast.success(`Traductions automatiques générées pour ${targetLang}`)
    } catch (error) {
      toast.error('Erreur lors de la traduction automatique')
    }
  }

  const autoTranslate = autoTranslateWithDeepL

  const exportTranslations = () => {
    const exportData = {
      languages: languages.filter(l => l.enabled),
      translations: translations.reduce((acc, t) => {
        acc[t.key] = t
        return acc
      }, {} as Record<string, Translation>)
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `faith-shop-translations-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>
  }

  const availableToAdd = availableLanguages.filter(
    al => !languages.some(l => l.code === al.code)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Langues</h1>
          <p className="text-muted-foreground">
            Configurez les langues supportées et gérez les traductions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportTranslations}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => loadLanguagesAndTranslations()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="languages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="languages">Langues</TabsTrigger>
          <TabsTrigger value="translations">Traductions</TabsTrigger>
          <TabsTrigger value="auto">Auto-traduction</TabsTrigger>
        </TabsList>

        <TabsContent value="languages">
          <div className="space-y-6">
            {/* Langues actives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Langues configurées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languages.map((lang) => (
                    <div key={lang.code} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{lang.name}</span>
                            <Badge variant={lang.isDefault ? 'default' : 'secondary'}>
                              {lang.code.toUpperCase()}
                            </Badge>
                            {lang.isDefault && <Badge variant="outline">Par défaut</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Traduction: {lang.completionRate}% complète
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={lang.enabled}
                          onCheckedChange={(checked) => toggleLanguage(lang.code, checked)}
                          disabled={lang.isDefault}
                        />
                        {!lang.isDefault && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeLanguage(lang.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ajouter une langue */}
            {availableToAdd.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Ajouter une langue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {availableToAdd.map((lang) => (
                      <Button
                        key={lang.code}
                        variant="outline"
                        className="justify-start gap-3 h-auto p-4"
                        onClick={() => addLanguage(lang.code)}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="translations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Traductions par langue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {translations.map((translation) => (
                    <div key={translation.key} className="space-y-3">
                      <Label className="text-sm font-medium">{translation.key}</Label>
                      <div className="grid gap-3 md:grid-cols-2">
                        {languages
                          .filter(l => l.enabled)
                          .map((lang) => (
                            <div key={lang.code}>
                              <Label htmlFor={`${translation.key}-${lang.code}`} className="text-xs text-muted-foreground">
                                {lang.flag} {lang.name}
                              </Label>
                              <Input
                                id={`${translation.key}-${lang.code}`}
                                value={translation[lang.code] || ''}
                                onChange={(e) => updateTranslation(translation.key, lang.code, e.target.value)}
                                placeholder={lang.code === 'fr' ? 'Texte français (obligatoire)' : 'Traduction...'}
                                className={lang.code === 'fr' ? 'border-blue-200 bg-blue-50/50' : ''}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Traduction automatique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Note importante</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Les traductions automatiques sont basiques. Nous recommandons de les réviser pour une meilleure qualité.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {languages
                  .filter(l => l.enabled && l.code !== 'fr')
                  .map((lang) => (
                    <div key={lang.code} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        <Badge variant="outline">{lang.completionRate}%</Badge>
                      </div>
                      <Button
                        onClick={() => autoTranslate(lang.code)}
                        disabled={autoTranslating}
                        className="w-full"
                        variant="outline"
                      >
                        {autoTranslating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Auto-traduire
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
              </div>

              {languages.filter(l => l.enabled && l.code !== 'fr').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Languages className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Activez d'autres langues pour utiliser la traduction automatique</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}