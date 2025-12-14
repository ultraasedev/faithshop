# Documentation Synchronisation Stripe Bi-directionnelle

## ✅ Synchronisation Implémentée

### 1. Site → Stripe (Déjà fonctionnel)
- ✅ Création automatique de produits dans Stripe
- ✅ Mise à jour des prix (création de nouveaux prix Stripe)
- ✅ Synchronisation des images (maximum 8 images)
- ✅ Mise à jour du nom et description
- ✅ Gestion du statut actif/inactif

### 2. Stripe → Site (Nouvellement ajouté)
- ✅ Webhooks configurés pour les événements :
  - `product.updated` : Mise à jour nom, description, statut
  - `product.deleted` : Désactivation du produit local
  - `price.updated` : Mise à jour des prix
  - `payment_intent.succeeded` : Création des commandes

## 🎬 Gestion des Vidéos

### Limitations Stripe
Stripe ne supporte **PAS** les formats vidéo dans les images de produits :
- ❌ .mp4, .avi, .mov, .mkv, .webm
- ✅ .jpg, .jpeg, .png, .gif, .webp seulement

### Solution Implémentée
1. **Site → Stripe** : Seules les images sont synchronisées
2. **Stripe → Site** : Les vidéos locales sont préservées lors des mises à jour
3. **Stockage mixte** : Images dans Stripe + Vidéos en local uniquement

```typescript
// Exemple de gestion des médias mixtes
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const validImages = stripeProduct.images.filter(url =>
  imageExtensions.some(ext => url.toLowerCase().includes(ext))
)

// Conserver les vidéos existantes
const existingVideos = localProduct.images.filter(url =>
  !imageExtensions.some(ext => url.toLowerCase().includes(ext))
)

// Combiner images Stripe + vidéos locales
updateData.images = [...validImages, ...existingVideos]
```

## 🔧 Configuration Requise

### Webhooks Stripe à Configurer
```
URL: https://votre-site.com/api/webhook/stripe

Événements requis :
- product.updated
- product.deleted
- price.updated
- payment_intent.succeeded
```

### Variables d'Environnement
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📋 Comportements Spéciaux

### Suppression de Produits
- **Stripe supprimé** → **Local désactivé** (pas supprimé)
- **Local supprimé** → **Stripe archivé** (pas supprimé)

### Conflits de Prix
- **Priorité Stripe** : Si modifié dans Stripe, le site est mis à jour
- **Priorité Site** : Si modifié sur le site, Stripe est mis à jour

### Images vs Vidéos
- **Images** : Synchronisation bi-directionnelle complète
- **Vidéos** : Stockage local uniquement, préservées lors des updates

## 🧪 Test de Synchronisation

Utiliser le script de test :
```bash
pnpm tsx scripts/test-stripe-sync.ts
```

Le script vérifie :
- Cohérence des prix entre Stripe et local
- Configuration des webhooks
- Gestion des médias mixtes
- État de synchronisation des produits

## ⚠️ Points d'Attention

1. **Médias Lourds** : Les vidéos ne sont jamais envoyées à Stripe
2. **Performances** : Les webhooks sont asynchrones
3. **Erreurs** : En cas d'échec webhook, vérifier les logs
4. **Sécurité** : Validation des signatures webhook obligatoire

## 🔄 Flux de Synchronisation

```
┌─────────────┐    ┌─────────────┐
│    Site     │◄──►│   Stripe    │
│             │    │             │
│ Images ✓    │───►│ Images ✓    │
│ Vidéos ✓    │    │ Vidéos ✗    │
│ Prix ✓      │◄──►│ Prix ✓      │
│ Nom ✓       │◄──►│ Nom ✓       │
│ Stock ✓     │    │ Stock ✗     │
└─────────────┘    └─────────────┘
```

**Résumé** : Synchronisation bi-directionnelle complète sauf pour les vidéos qui restent exclusivement locales.