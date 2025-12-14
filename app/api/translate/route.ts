import { NextRequest, NextResponse } from 'next/server'
import { translateWithDeepL, translateBatchWithDeepL, isLanguageSupported } from '@/lib/deepl-translate'
import { upsertSiteConfig } from '@/app/actions/admin/settings'

export async function POST(request: NextRequest) {
  try {
    const { action, text, texts, targetLang, translationKey } = await request.json()

    if (!isLanguageSupported(targetLang)) {
      return NextResponse.json(
        { error: `Language ${targetLang} not supported by DeepL` },
        { status: 400 }
      )
    }

    let result: string | string[]

    if (action === 'single' && text && translationKey) {
      // Traduire un seul texte
      result = await translateWithDeepL(text, targetLang)

      // Sauvegarder automatiquement dans la DB
      await upsertSiteConfig({
        key: `i18n_${targetLang}_${translationKey}`,
        value: result as string,
        type: 'text',
        category: 'i18n',
        label: `Translation ${targetLang} ${translationKey}`,
        description: `Auto-translated from French to ${targetLang}`
      })

    } else if (action === 'batch' && texts) {
      // Traduire plusieurs textes
      result = await translateBatchWithDeepL(texts, targetLang)

    } else {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      translation: result,
      targetLang,
      provider: 'deepl'
    })

  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}