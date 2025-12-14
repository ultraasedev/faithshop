// Test du système de traduction automatique
import { translateWithDeepL } from '../lib/deepl-translate'
import { onFrenchTextChanged } from '../lib/translation-watcher'
import { TranslationNotifications } from '../lib/translation-notifications'

async function testTranslationSystem() {
  console.log('🧪 Test du système de traduction automatique')

  // Test 1: Traduction directe avec DeepL
  console.log('\n1. Test traduction directe:')
  try {
    const result = await translateWithDeepL('Bonjour le monde', 'en')
    console.log(`   FR: "Bonjour le monde" → EN: "${result}"`)
  } catch (error) {
    console.error('   ❌ Erreur traduction directe:', error)
  }

  // Test 2: System de surveillance des modifications
  console.log('\n2. Test système de surveillance:')
  try {
    await onFrenchTextChanged('test_key', 'Faith Shop - Mode chrétienne premium')
    console.log('   ✅ Surveillance déclenchée pour "test_key"')

    // Attendre que les traductions se terminent
    await new Promise(resolve => setTimeout(resolve, 6000))

  } catch (error) {
    console.error('   ❌ Erreur surveillance:', error)
  }

  // Test 3: Traduction de textes plus longs
  console.log('\n3. Test textes longs:')
  try {
    const longText = 'Faith Shop est né d\'une passion pour la mode et la foi. Nous créons des vêtements qui permettent d\'exprimer sa spiritualité avec style et élégance.'
    const result = await translateWithDeepL(longText, 'es')
    console.log(`   FR: "${longText}"`)
    console.log(`   ES: "${result}"`)
  } catch (error) {
    console.error('   ❌ Erreur traduction longue:', error)
  }

  console.log('\n✅ Tests terminés')
}

if (require.main === module) {
  testTranslationSystem().catch(console.error)
}

export default testTranslationSystem