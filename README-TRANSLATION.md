# Système de Traduction Automatique ⚡

## 🎯 Fonctionnalités

- **Auto-traduction temps réel** : Les textes français sont automatiquement traduits vers toutes les langues actives
- **Surveillance intelligente** : Détection des modifications de texte avec debouncing (2-3 secondes)
- **Notifications visuelles** : Toast notifications pour suivre les traductions en cours
- **API DeepL gratuite** : 500k caractères/mois, support de 15+ langues
- **Sauvegarde automatique** : Traductions stockées en base de données
- **Gestion des erreurs** : Fallbacks et notifications d'erreur

## 🚀 Configuration

### 1. Clé API DeepL (Gratuite)

1. Créez un compte gratuit sur https://www.deepl.com/pro-api
2. Récupérez votre clé API
3. Ajoutez dans votre fichier `.env.local` :

```bash
DEEPL_API_KEY=your_deepl_api_key_here
```

### 2. Activer les langues

1. Allez dans **Admin → Paramètres → Langues & i18n**
2. Activez les langues souhaitées (ex: EN, ES, DE...)
3. Le français est automatiquement configuré comme langue source

## 🔥 Utilisation

### Auto-traduction en temps réel

1. **Admin → Paramètres → Contenus & Textes**
2. Modifiez n'importe quel texte français
3. ⚡ **Traduction automatique en 2-3 secondes** vers toutes les langues actives !

### Traductions manuelles

1. **Admin → Paramètres → Langues & i18n**
2. Utilisez les boutons "Traduire vers [LANGUE]"
3. Éditez manuellement si nécessaire

## 🎬 Démonstration

```
1. ✏️  Tapez "Bienvenue chez Faith Shop"
2. ⏱️  Attendez 2 secondes...
3. 🌐 Auto-traduction vers EN, ES, DE...
4. ✅ Sauvegarde automatique en DB
5. 🎉 Notifications de succès
```

## 🛠️ Architecture

### Fichiers clés
- `lib/translation-watcher.ts` - Surveillance & queue des traductions
- `lib/deepl-translate.ts` - Intégration API DeepL
- `lib/translation-notifications.ts` - Notifications visuelles
- `components/admin/TranslationInput.tsx` - Composant avec auto-traduction

### Flux de traduction
```
Modification texte français
    ↓ (debounce 2-3s)
Queue de traduction
    ↓
API DeepL
    ↓
Sauvegarde DB
    ↓
Notifications utilisateur
```

## 🔧 Langues supportées

✅ **Disponibles** : EN, ES, DE, IT, PT, RU, JA, ZH, KO, NL, PL, SV, DA, FI, NO

## 🧪 Tests

```bash
# Tester le système complet
pnpm tsx scripts/test-translation.ts

# Vérifier les traductions en DB
SELECT * FROM SiteConfig WHERE category = 'i18n';
```

## 📈 Monitoring

### Console logs
- 🇫🇷 Détection modification française
- 🤖 Début traitement batch
- 🌐 Traduction par langue
- ✅ Succès / ❌ Erreurs

### Notifications Toast
- 🚀 Début batch traductions
- 🌐 Traduction en cours par langue
- ✅ Succès / ❌ Erreurs
- 🔑 Clé API manquante

## 💰 Coûts

**DeepL Free** : 500k caractères/mois
- Site e-commerce moyen : ~50k caractères
- **Largement suffisant pour la plupart des sites**

## 🔒 Sécurité

- Clé API DeepL stockée en variable d'environnement
- Validation des langues supportées
- Gestion des timeouts et erreurs réseau
- Pas d'exposition de données sensibles