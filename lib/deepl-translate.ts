// DeepL API gratuite - 500k caractères/mois
// Inscription : https://www.deepl.com/pro-api

interface DeepLResponse {
  translations: Array<{
    detected_source_language: string
    text: string
  }>
}

export async function translateWithDeepL(
  text: string,
  targetLang: string,
  sourceLang = 'FR'
): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY

  if (!apiKey) {
    console.warn('DeepL API key not found, returning original text')
    return text
  }

  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        source_lang: sourceLang,
        target_lang: targetLang.toUpperCase(),
        formality: 'default'
      })
    })

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`)
    }

    const data: DeepLResponse = await response.json()
    return data.translations[0]?.text || text
  } catch (error) {
    console.error('DeepL translation error:', error)
    return text // Fallback : retourner le texte original
  }
}

// Traduire plusieurs textes en batch (plus efficace)
export async function translateBatchWithDeepL(
  texts: string[],
  targetLang: string,
  sourceLang = 'FR'
): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY

  if (!apiKey) {
    console.warn('DeepL API key not found, returning original texts')
    return texts
  }

  try {
    const params = new URLSearchParams()
    texts.forEach(text => params.append('text', text))
    params.append('source_lang', sourceLang)
    params.append('target_lang', targetLang.toUpperCase())
    params.append('formality', 'default')

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    })

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`)
    }

    const data: DeepLResponse = await response.json()
    return data.translations.map(t => t.text)
  } catch (error) {
    console.error('DeepL batch translation error:', error)
    return texts
  }
}

// Langues supportées par DeepL
export const DEEPL_LANGUAGES = {
  'en': 'EN',
  'es': 'ES',
  'de': 'DE',
  'it': 'IT',
  'pt': 'PT',
  'ru': 'RU',
  'ja': 'JA',
  'zh': 'ZH',
  'ko': 'KO',
  'nl': 'NL',
  'pl': 'PL',
  'sv': 'SV',
  'da': 'DA',
  'fi': 'FI',
  'no': 'NB'
} as const

export function isLanguageSupported(langCode: string): boolean {
  return langCode in DEEPL_LANGUAGES
}