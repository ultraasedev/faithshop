# 🙏 Faith Shop - Boutique de Vêtements Chrétiens

Une boutique e-commerce moderne et élégante dédiée aux vêtements unisexe qui célèbrent la foi chrétienne.

## ✨ Fonctionnalités

### 🛍️ Boutique Client

- **Page d'accueil premium** avec design moderne et animations fluides
- **Catalogue de produits** avec filtres et recherche
- **Panier d'achat** avec gestion des quantités, tailles et couleurs
- **Processus de commande** complet avec paiement Stripe
- **Compte utilisateur** avec historique des commandes
- **Design responsive** mobile-first

### 🎨 Panel Admin Complet

- **Dashboard** avec statistiques en temps réel
- **Gestion des produits** (CRUD complet)
  - Upload d'images multiples
  - Gestion des variantes (tailles, couleurs)
  - Gestion du stock
  - Produits vedettes
- **Gestion des catégories**
- **Gestion des commandes**
  - Statuts de commande
  - Numéros de suivi
  - Gestion des expéditions
- **Gestion des clients**
- **Paramètres du site** (personnalisation complète)
  - Logo et favicon
  - Couleurs du thème
  - Textes de la page d'accueil
  - Informations de contact
  - Réseaux sociaux
  - Frais de livraison et taxes

## 🚀 Stack Technique

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: NextAuth.js v5
- **Paiement**: Stripe
- **State Management**: Zustand
- **Formulaires**: React Hook Form + Zod
- **Icons**: Lucide React
- **Package Manager**: pnpm

## 📦 Installation

### Prérequis

- Node.js 18+
- PostgreSQL
- pnpm

### Étapes

1. **Cloner le projet**

```bash
cd faith-shop
```

2. **Installer les dépendances**

```bash
pnpm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/faithshop?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Initialiser la base de données**

```bash
pnpm dlx prisma migrate dev --name init
pnpm dlx prisma generate
```

5. **Créer un utilisateur admin** (optionnel)

```bash
pnpm dlx prisma studio
# Créer un utilisateur et définir role = "ADMIN"
```

6. **Lancer le serveur de développement**

```bash
pnpm dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
faith-shop/
├── app/                      # Pages Next.js (App Router)
│   ├── admin/               # Panel admin
│   │   ├── products/        # Gestion des produits
│   │   ├── orders/          # Gestion des commandes
│   │   └── settings/        # Paramètres du site
│   ├── shop/                # Pages boutique
│   ├── cart/                # Panier
│   └── auth/                # Authentification
├── components/              # Composants React
│   ├── layout/             # Header, Footer
│   └── ui/                 # Composants UI réutilisables
├── lib/                     # Utilitaires
│   ├── prisma.ts           # Client Prisma
│   ├── auth.ts             # Configuration NextAuth
│   ├── utils.ts            # Fonctions utilitaires
│   └── store/              # Stores Zustand
├── prisma/                  # Schéma et migrations Prisma
├── public/                  # Assets statiques
│   └── products/           # Images des produits
└── types/                   # Types TypeScript

```

## 🎨 Design System

Le projet utilise un design system premium avec :

- **Palette de couleurs** inspirante (violet, rose, or)
- **Typographie** moderne (Inter)
- **Animations** fluides et élégantes
- **Composants** réutilisables avec Tailwind CSS
- **Dark mode** supporté

### Variables CSS Personnalisées

```css
--primary: #7c3aed (Violet)
--secondary: #f59e0b (Or)
--accent: #ec4899 (Rose)
--gradient-primary: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)
--gradient-divine: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)
```

## 🔐 Authentification

Le projet utilise NextAuth.js v5 avec :

- Authentification par email/password
- Gestion des rôles (USER, ADMIN)
- Sessions JWT
- Protection des routes admin

## 💳 Paiement

Intégration Stripe pour :

- Paiements sécurisés
- Webhooks pour la confirmation
- Gestion des remboursements

## 📱 Responsive Design

Le site est entièrement responsive avec une approche **mobile-first** :

- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
vercel
```

### Docker

```bash
docker build -t faith-shop .
docker run -p 3000:3000 faith-shop
```

## 📝 Scripts Disponibles

```bash
pnpm dev          # Serveur de développement
pnpm build        # Build de production
pnpm start        # Serveur de production
pnpm lint         # Linter
pnpm prisma:studio # Interface Prisma Studio
pnpm prisma:generate # Générer le client Prisma
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 🙏 Remerciements

Merci à tous ceux qui soutiennent ce projet et la mission de Faith Shop : célébrer la foi avec style et authenticité.

---

**Faith Shop** - Portez votre foi avec style 🙏✨
