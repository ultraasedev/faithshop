import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { hash } from 'bcryptjs'

const connectionString = "postgresql://neondb_owner:npg_RM7YnUS4gFIV@ep-tiny-cake-adbyc3l9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Créer le super admin
  const hashedPassword = await hash('admin123', 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@faith-shop.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@faith-shop.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      canManageProducts: true,
      canManageOrders: true,
      canManageUsers: true,
      canManageSettings: true,
      canManageDiscounts: true,
      canManageShipping: true,
    },
  })
  console.log('✅ Super admin créé:', superAdmin.email)

  // Configurations du site par défaut
  const defaultConfigs = [
    { key: 'site_name', value: 'FAITH SHOP', type: 'text', category: 'general', label: 'Nom du site' },
    { key: 'site_description', value: 'Boutique de mode premium', type: 'text', category: 'general', label: 'Description du site' },
    { key: 'site_logo', value: '/logo.png', type: 'image', category: 'general', label: 'Logo' },
    { key: 'site_favicon', value: '/favicon.ico', type: 'image', category: 'general', label: 'Favicon' },
    { key: 'home_hero_title', value: 'Nouvelle Collection', type: 'text', category: 'homepage', label: 'Titre Hero' },
    { key: 'home_hero_subtitle', value: 'Découvrez notre sélection exclusive', type: 'text', category: 'homepage', label: 'Sous-titre Hero' },
    { key: 'home_hero_image', value: '/hero.jpg', type: 'image', category: 'homepage', label: 'Image Hero' },
    { key: 'home_hero_cta_text', value: 'Découvrir', type: 'text', category: 'homepage', label: 'Texte bouton Hero' },
    { key: 'home_hero_cta_link', value: '/shop', type: 'text', category: 'homepage', label: 'Lien bouton Hero' },
    { key: 'footer_text', value: '© 2024 Faith Shop. Tous droits réservés.', type: 'text', category: 'footer', label: 'Texte footer' },
    { key: 'footer_instagram', value: 'https://instagram.com/faithshop', type: 'text', category: 'footer', label: 'Instagram' },
    { key: 'footer_facebook', value: '', type: 'text', category: 'footer', label: 'Facebook' },
    { key: 'footer_twitter', value: '', type: 'text', category: 'footer', label: 'Twitter' },
    { key: 'contact_email', value: 'contact@faith-shop.com', type: 'text', category: 'contact', label: 'Email contact' },
    { key: 'contact_phone', value: '+33 1 23 45 67 89', type: 'text', category: 'contact', label: 'Téléphone' },
    { key: 'contact_address', value: '123 Rue de la Mode, 75001 Paris', type: 'text', category: 'contact', label: 'Adresse' },
  ]

  for (const config of defaultConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }
  console.log('✅ Configurations du site créées')

  // Thèmes par défaut
  const lightTheme = await prisma.themeConfig.upsert({
    where: { name: 'light' },
    update: {},
    create: {
      name: 'light',
      isDefault: true,
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      accentColor: '#666666',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      mutedColor: '#6b7280',
      borderColor: '#e5e7eb',
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
    },
  })

  const darkTheme = await prisma.themeConfig.upsert({
    where: { name: 'dark' },
    update: {},
    create: {
      name: 'dark',
      isDefault: false,
      primaryColor: '#ffffff',
      secondaryColor: '#000000',
      accentColor: '#a3a3a3',
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      mutedColor: '#a3a3a3',
      borderColor: '#262626',
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
    },
  })
  console.log('✅ Thèmes créés:', lightTheme.name, darkTheme.name)

  // Tarifs de livraison par défaut
  const existingRates = await prisma.shippingRate.count()
  if (existingRates === 0) {
    const shippingRates = [
      {
        name: 'Standard France',
        carrier: 'Colissimo',
        minWeight: 0,
        maxWeight: 5,
        price: 4.99,
        countries: ['FR'],
        minDays: 3,
        maxDays: 5,
        isActive: true,
      },
      {
        name: 'Express France',
        carrier: 'Chronopost',
        minWeight: 0,
        maxWeight: 10,
        price: 9.99,
        countries: ['FR'],
        minDays: 1,
        maxDays: 2,
        isActive: true,
      },
      {
        name: 'Europe Standard',
        carrier: 'Colissimo International',
        minWeight: 0,
        maxWeight: 5,
        price: 12.99,
        countries: ['BE', 'CH', 'LU', 'DE', 'ES', 'IT', 'NL', 'PT', 'AT'],
        minDays: 5,
        maxDays: 10,
        isActive: true,
      },
      {
        name: 'Livraison gratuite',
        carrier: 'Colissimo',
        minWeight: 0,
        maxWeight: 30,
        price: 0,
        countries: ['FR'],
        minDays: 5,
        maxDays: 7,
        isActive: true,
      },
    ]

    for (const rate of shippingRates) {
      await prisma.shippingRate.create({
        data: rate,
      })
    }
    console.log('✅ Tarifs de livraison créés')
  } else {
    console.log('✅ Tarifs de livraison déjà existants')
  }

  // Code promo de bienvenue
  const welcomeCode = await prisma.discountCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: 'Code de bienvenue - 10% de réduction',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 50,
      maxDiscount: 30,
      isActive: true,
    },
  })
  console.log('✅ Code promo de bienvenue créé:', welcomeCode.code)

  // Pages par défaut
  const pages = [
    {
      slug: 'home',
      title: 'Accueil',
      metaTitle: 'FAITH SHOP - Boutique de mode premium',
      metaDescription: 'Découvrez notre collection exclusive de vêtements et accessoires de mode.',
      content: JSON.stringify({
        sections: [
          {
            type: 'hero',
            title: 'Nouvelle Collection',
            subtitle: 'Découvrez notre sélection exclusive',
            image: '/hero.jpg',
            ctaText: 'Découvrir',
            ctaLink: '/shop',
          },
        ],
      }),
      isPublished: true,
    },
    {
      slug: 'about',
      title: 'À propos',
      metaTitle: 'À propos de FAITH SHOP',
      metaDescription: 'Découvrez l\'histoire de FAITH SHOP et nos valeurs.',
      content: JSON.stringify({
        sections: [
          {
            type: 'text',
            title: 'Notre Histoire',
            text: 'FAITH SHOP est née de la passion pour la mode éthique et responsable.',
          },
        ],
      }),
      isPublished: true,
    },
  ]

  for (const page of pages) {
    await prisma.pageContent.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    })
  }
  console.log('✅ Pages par défaut créées')

  console.log('🎉 Seed terminé avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
