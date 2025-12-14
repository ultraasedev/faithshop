// Test spécifique pour l'arabe et autres langues
import { translateText, LANGUAGE_INFO } from '../lib/hybrid-translate'

async function testArabicSupport() {
  console.log('🔥 Test du support de l\'arabe et autres langues')

  // Test 1: Arabe (via Google Translate)
  console.log('\n🇸🇦 Test Arabe:')
  try {
    const result = await translateText('Bienvenue chez Faith Shop', 'ar', 'fr')
    console.log(`   Provider: ${result.provider}`)
    console.log(`   FR: "Bienvenue chez Faith Shop"`)
    console.log(`   AR: "${result.text}"`)
  } catch (error) {
    console.error('   ❌ Erreur arabe:', error)
  }

  // Test 2: Comparaison DeepL vs Google pour l'espagnol
  console.log('\n🇪🇸 Test Espagnol (DeepL prioritaire):')
  try {
    const result = await translateText('Mode chrétienne premium', 'es', 'fr')
    console.log(`   Provider: ${result.provider}`)
    console.log(`   FR: "Mode chrétienne premium"`)
    console.log(`   ES: "${result.text}"`)
  } catch (error) {
    console.error('   ❌ Erreur espagnol:', error)
  }

  // Test 3: Afficher toutes les langues supportées
  console.log('\n🌐 Langues supportées:')
  console.log('   📍 DeepL (Premium):')
  Object.entries(LANGUAGE_INFO).forEach(([code, info]) => {
    if (info.provider === 'deepl') {
      console.log(`     ${info.flag} ${code.toUpperCase()} - ${info.name}`)
    }
  })

  console.log('\n   📍 Google Translate (Standard):')
  Object.entries(LANGUAGE_INFO).forEach(([code, info]) => {
    if (info.provider === 'google') {
      console.log(`     ${info.flag} ${code.toUpperCase()} - ${info.name}`)
    }
  })

  console.log('\n✅ Tests terminés')
}

if (require.main === module) {
  testArabicSupport().catch(console.error)
}

export default testArabicSupport