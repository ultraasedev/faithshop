// Système de traduction hybride : DeepL + Google Translate
// Utilise le meilleur service selon la langue cible

import { translateWithDeepL, isLanguageSupported as isDeepLSupported } from './deepl-translate'
import { translateWithGoogle, isGoogleLanguageSupported } from './google-translate'

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang = 'fr'
): Promise<{ text: string; provider: 'deepl' | 'google' | 'none' }> {

  // Priorité 1: DeepL (meilleure qualité pour langues supportées)
  if (isDeepLSupported(targetLang)) {
    try {
      const translated = await translateWithDeepL(text, targetLang, sourceLang.toUpperCase())

      // Vérifier si DeepL a vraiment traduit (pas juste retourné l'original)
      if (translated !== text) {
        return { text: translated, provider: 'deepl' }
      }
    } catch (error) {
      console.warn(`DeepL failed for ${targetLang}, trying Google Translate...`)
    }
  }

  // Priorité 2: Google Translate (pour arabe et autres langues)
  if (isGoogleLanguageSupported(targetLang)) {
    try {
      const translated = await translateWithGoogle(text, targetLang, sourceLang)
      return { text: translated, provider: 'google' }
    } catch (error) {
      console.warn(`Google Translate failed for ${targetLang}`)
    }
  }

  // Aucun service disponible
  return { text, provider: 'none' }
}

// Obtenir les langues supportées par l'ensemble du système
export function getAllSupportedLanguages(): string[] {
  const deepLLanguages = Object.keys(require('./deepl-translate').DEEPL_LANGUAGES)
  const googleLanguages = Object.keys(require('./google-translate').GOOGLE_TRANSLATE_LANGUAGES)

  // Fusionner et dédupliquer
  return [...new Set([...deepLLanguages, ...googleLanguages])].sort()
}

// Obtenir le provider recommandé pour une langue
export function getProviderForLanguage(langCode: string): 'deepl' | 'google' | 'none' {
  if (isDeepLSupported(langCode)) return 'deepl'
  if (isGoogleLanguageSupported(langCode)) return 'google'
  return 'none'
}

// Langues avec leur provider et qualité
export const LANGUAGE_INFO = {
  // DeepL (Qualité premium)
  'en': { name: 'Anglais', provider: 'deepl', quality: 'premium', flag: '🇬🇧' },
  'es': { name: 'Espagnol', provider: 'deepl', quality: 'premium', flag: '🇪🇸' },
  'de': { name: 'Allemand', provider: 'deepl', quality: 'premium', flag: '🇩🇪' },
  'it': { name: 'Italien', provider: 'deepl', quality: 'premium', flag: '🇮🇹' },
  'pt': { name: 'Portugais', provider: 'deepl', quality: 'premium', flag: '🇵🇹' },
  'ru': { name: 'Russe', provider: 'deepl', quality: 'premium', flag: '🇷🇺' },
  'ja': { name: 'Japonais', provider: 'deepl', quality: 'premium', flag: '🇯🇵' },
  'zh': { name: 'Chinois', provider: 'deepl', quality: 'premium', flag: '🇨🇳' },
  'ko': { name: 'Coréen', provider: 'deepl', quality: 'premium', flag: '🇰🇷' },
  'nl': { name: 'Néerlandais', provider: 'deepl', quality: 'premium', flag: '🇳🇱' },
  'pl': { name: 'Polonais', provider: 'deepl', quality: 'premium', flag: '🇵🇱' },
  'sv': { name: 'Suédois', provider: 'deepl', quality: 'premium', flag: '🇸🇪' },
  'da': { name: 'Danois', provider: 'deepl', quality: 'premium', flag: '🇩🇰' },
  'fi': { name: 'Finnois', provider: 'deepl', quality: 'premium', flag: '🇫🇮' },
  'no': { name: 'Norvégien', provider: 'deepl', quality: 'premium', flag: '🇳🇴' },

  // Google Translate (Langues additionnelles)
  'ar': { name: 'Arabe', provider: 'google', quality: 'standard', flag: '🇸🇦' },
  'hi': { name: 'Hindi', provider: 'google', quality: 'standard', flag: '🇮🇳' },
  'tr': { name: 'Turc', provider: 'google', quality: 'standard', flag: '🇹🇷' },
  'he': { name: 'Hébreu', provider: 'google', quality: 'standard', flag: '🇮🇱' },
  'th': { name: 'Thaï', provider: 'google', quality: 'standard', flag: '🇹🇭' },
  'vi': { name: 'Vietnamien', provider: 'google', quality: 'standard', flag: '🇻🇳' },
  'uk': { name: 'Ukrainien', provider: 'google', quality: 'standard', flag: '🇺🇦' },
  'cs': { name: 'Tchèque', provider: 'google', quality: 'standard', flag: '🇨🇿' },
  'hu': { name: 'Hongrois', provider: 'google', quality: 'standard', flag: '🇭🇺' },
  'ro': { name: 'Roumain', provider: 'google', quality: 'standard', flag: '🇷🇴' },
} as const