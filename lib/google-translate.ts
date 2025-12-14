// Google Translate API - Support 100+ langues dont l'arabe
// Alternative pour les langues non supportées par DeepL

interface GoogleTranslateResponse {
  data: {
    translations: Array<{
      translatedText: string
      detectedSourceLanguage?: string
    }>
  }
}

export async function translateWithGoogle(
  text: string,
  targetLang: string,
  sourceLang = 'fr'
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!apiKey) {
    console.warn('Google Translate API key not found, returning original text')
    return text
  }

  try {
    const url = new URL('https://translation.googleapis.com/language/translate/v2')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    })

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.statusText}`)
    }

    const data: GoogleTranslateResponse = await response.json()
    return data.data.translations[0]?.translatedText || text
  } catch (error) {
    console.error('Google Translate error:', error)
    return text
  }
}

// Langues supportées par Google Translate (principales)
export const GOOGLE_TRANSLATE_LANGUAGES = {
  // Langues principales
  'en': 'en', // Anglais
  'es': 'es', // Espagnol
  'de': 'de', // Allemand
  'it': 'it', // Italien
  'pt': 'pt', // Portugais
  'ru': 'ru', // Russe
  'ja': 'ja', // Japonais
  'zh': 'zh', // Chinois
  'ko': 'ko', // Coréen
  'ar': 'ar', // 🇸🇦 ARABE
  'hi': 'hi', // Hindi
  'tr': 'tr', // Turc
  'pl': 'pl', // Polonais
  'nl': 'nl', // Néerlandais
  'sv': 'sv', // Suédois
  'da': 'da', // Danois
  'fi': 'fi', // Finnois
  'no': 'no', // Norvégien
  'he': 'he', // Hébreu
  'th': 'th', // Thaï
  'vi': 'vi', // Vietnamien
  'uk': 'uk', // Ukrainien
  'cs': 'cs', // Tchèque
  'hu': 'hu', // Hongrois
  'ro': 'ro', // Roumain
} as const

export function isGoogleLanguageSupported(langCode: string): boolean {
  return langCode in GOOGLE_TRANSLATE_LANGUAGES
}