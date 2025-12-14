// Système de notifications pour les traductions
import { toast } from 'sonner'

export class TranslationNotifications {
  private static activeTranslations = new Set<string>()

  static startTranslation(key: string, language: string) {
    const id = `${key}-${language}`
    this.activeTranslations.add(id)

    toast.loading(`🌐 Traduction en cours vers ${language.toUpperCase()}...`, {
      id,
      duration: 10000
    })
  }

  static completeTranslation(key: string, language: string, success: boolean = true) {
    const id = `${key}-${language}`
    this.activeTranslations.delete(id)

    if (success) {
      toast.success(`✅ Traduction ${language.toUpperCase()} terminée`, {
        id,
        duration: 3000
      })
    } else {
      toast.error(`❌ Erreur traduction ${language.toUpperCase()}`, {
        id,
        duration: 5000
      })
    }
  }

  static showBatchStarted(textCount: number, languageCount: number) {
    toast.info(`🚀 Début auto-traduction: ${textCount} texte(s) vers ${languageCount} langue(s)`, {
      duration: 4000
    })
  }

  static showBatchCompleted(successCount: number, totalCount: number) {
    if (successCount === totalCount) {
      toast.success(`🎉 Toutes les traductions terminées (${successCount}/${totalCount})`, {
        duration: 4000
      })
    } else {
      toast.warning(`⚠️ Traductions partielles: ${successCount}/${totalCount} réussies`, {
        duration: 6000
      })
    }
  }

  static showApiKeyMissing() {
    toast.error('🔑 Clé API DeepL manquante - Traductions désactivées', {
      duration: 8000,
      description: 'Configurez DEEPL_API_KEY dans vos variables d\'environnement'
    })
  }

  static showRateLimitWarning() {
    toast.warning('⏱️ Limite API atteinte - Traductions en pause', {
      duration: 6000,
      description: 'Les traductions reprendront automatiquement'
    })
  }

  static getActiveTranslationsCount(): number {
    return this.activeTranslations.size
  }
}