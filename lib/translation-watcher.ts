// Surveillance en temps réel des modifications de texte français
// Auto-traduction automatique avec DeepL

import { translateText } from './hybrid-translate'
import { upsertSiteConfig, getSiteConfigs } from '@/app/actions/admin/settings'
import { TranslationNotifications } from './translation-notifications'

interface PendingTranslation {
  key: string
  frenchText: string
  timestamp: Date
}

// Queue des traductions en attente
let translationQueue: PendingTranslation[] = []
let isProcessing = false

// Détecter une modification de texte français
export async function onFrenchTextChanged(key: string, newFrenchText: string) {
  console.log(`🇫🇷 Texte français modifié: ${key} = "${newFrenchText}"`)

  // Ajouter à la queue
  translationQueue.push({
    key,
    frenchText: newFrenchText,
    timestamp: new Date()
  })

  // Traiter la queue (avec debounce de 2 secondes)
  setTimeout(() => processTranslationQueue(), 2000)
}

// Traiter la queue de traductions
async function processTranslationQueue() {
  if (isProcessing || translationQueue.length === 0) return

  isProcessing = true
  console.log(`🤖 Traitement de ${translationQueue.length} traductions en attente...`)

  try {
    // Récupérer les langues actives
    const activeLanguages = await getActiveLanguages()

    // Notifier le début du batch
    TranslationNotifications.showBatchStarted(translationQueue.length, activeLanguages.length - 1)

    let successCount = 0
    const totalCount = translationQueue.length * (activeLanguages.length - 1)

    // Traiter chaque modification
    for (const item of translationQueue) {
      const itemSuccessCount = await translateToAllLanguages(item.key, item.frenchText, activeLanguages)
      successCount += itemSuccessCount
    }

    // Notifier la fin du batch
    TranslationNotifications.showBatchCompleted(successCount, totalCount)

    // Vider la queue
    translationQueue = []
    console.log('✅ Toutes les traductions terminées')

  } catch (error) {
    console.error('❌ Erreur lors du traitement des traductions:', error)
    TranslationNotifications.showBatchCompleted(0, translationQueue.length)
  } finally {
    isProcessing = false
  }
}

// Traduire vers toutes les langues actives
async function translateToAllLanguages(key: string, frenchText: string, languages: string[]): Promise<number> {
  console.log(`🌐 Traduction "${key}" vers ${languages.length} langues...`)

  let successCount = 0

  for (const lang of languages) {
    if (lang === 'fr') continue // Skip français

    try {
      console.log(`  🔄 ${lang.toUpperCase()}: "${frenchText}"`)
      TranslationNotifications.startTranslation(key, lang)

      // Traduire avec système hybride (DeepL + Google)
      const result = await translateText(frenchText, lang, 'fr')

      // Vérifier si la traduction a réussi
      if (result.provider === 'none') {
        TranslationNotifications.showApiKeyMissing()
        TranslationNotifications.completeTranslation(key, lang, false)
        continue
      }

      // Sauvegarder en DB
      await upsertSiteConfig({
        key: `i18n_${lang}_${key}`,
        value: result.text,
        type: 'text',
        category: 'i18n',
        label: `Auto-translation ${lang} ${key}`,
        description: `Auto-translated from French via ${result.provider}: "${frenchText}"`
      })

      console.log(`  ✅ ${lang.toUpperCase()} (${result.provider}): "${result.text}"`)
      TranslationNotifications.completeTranslation(key, lang, true)
      successCount++

    } catch (error) {
      console.error(`  ❌ Erreur traduction ${lang}:`, error)
      TranslationNotifications.completeTranslation(key, lang, false)
    }
  }

  return successCount
}

// Récupérer les langues actives depuis la DB
async function getActiveLanguages(): Promise<string[]> {
  try {
    const configs = await getSiteConfigs('i18n')
    const activeLanguages = configs
      .filter(c => c.key.endsWith('_enabled') && c.value === 'true')
      .map(c => c.key.replace('i18n_', '').replace('_enabled', ''))

    return activeLanguages.length > 0 ? activeLanguages : ['fr']
  } catch (error) {
    console.error('Erreur récupération langues actives:', error)
    return ['fr', 'en'] // Fallback
  }
}

// Surveillance des modifications en temps réel
export class TranslationWatcher {
  private static instance: TranslationWatcher
  private watchers: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): TranslationWatcher {
    if (!TranslationWatcher.instance) {
      TranslationWatcher.instance = new TranslationWatcher()
    }
    return TranslationWatcher.instance
  }

  // Observer un input/textarea pour les modifications
  watchElement(element: HTMLInputElement | HTMLTextAreaElement, key: string) {
    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      const newValue = target.value.trim()

      if (newValue && newValue.length > 2) {
        // Debounce de 3 secondes pour éviter trop d'appels API
        if (this.watchers.has(key)) {
          clearTimeout(this.watchers.get(key))
        }

        const timeout = setTimeout(() => {
          onFrenchTextChanged(key, newValue)
          this.watchers.delete(key)
        }, 3000)

        this.watchers.set(key, timeout)
      }
    }

    element.addEventListener('input', handleChange)
    element.addEventListener('blur', handleChange)

    return () => {
      element.removeEventListener('input', handleChange)
      element.removeEventListener('blur', handleChange)
      if (this.watchers.has(key)) {
        clearTimeout(this.watchers.get(key))
        this.watchers.delete(key)
      }
    }
  }

  // Surveillance programmatique (pour les formulaires)
  watchValue(key: string, value: string) {
    if (value && value.length > 2) {
      if (this.watchers.has(key)) {
        clearTimeout(this.watchers.get(key))
      }

      const timeout = setTimeout(() => {
        onFrenchTextChanged(key, value)
        this.watchers.delete(key)
      }, 2000)

      this.watchers.set(key, timeout)
    }
  }

  // Nettoyer tous les watchers
  cleanup() {
    this.watchers.forEach(timeout => clearTimeout(timeout))
    this.watchers.clear()
  }
}