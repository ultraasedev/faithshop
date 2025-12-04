import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer le super admin
  const hashedPassword = await hash('admin123', 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'contact@faith-shop.fr' },
    update: { password: hashedPassword },
    create: {
      name: 'Super Admin',
      email: 'contact@faith-shop.fr',
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

  // Créer un client de test avec une commande
  const clientPassword = await hash('client123', 12)
  const testClient = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      name: 'Jean Dupont',
      email: 'client@test.com',
      password: clientPassword,
      role: 'USER',
      phone: '+33 6 12 34 56 78',
      address: '42 Avenue des Champs-Élysées',
      city: 'Paris',
      zipCode: '75008',
      country: 'France',
    },
  })
  console.log('✅ Client test créé:', testClient.email)

  // Récupérer un produit existant pour la commande test
  const products = await prisma.product.findMany({ take: 2 })

  if (products.length > 0) {
    // Créer une commande de test pour le client
    const existingOrder = await prisma.order.findFirst({
      where: { userId: testClient.id }
    })

    if (!existingOrder) {
      const testOrder = await prisma.order.create({
        data: {
          orderNumber: 'FS-2024-001',
          userId: testClient.id,
          shippingAddress: '42 Avenue des Champs-Élysées',
          shippingCity: 'Paris',
          shippingZip: '75008',
          shippingCountry: 'France',
          shippingPhone: '+33 6 12 34 56 78',
          billingAddress: '42 Avenue des Champs-Élysées',
          billingCity: 'Paris',
          billingZip: '75008',
          billingCountry: 'France',
          status: 'DELIVERED',
          subtotal: products[0] ? Number(products[0].price) * 2 : 90,
          shippingCost: 4.99,
          total: products[0] ? Number(products[0].price) * 2 + 4.99 : 94.99,
          paymentMethod: 'STRIPE',
          paymentStatus: 'COMPLETED',
          items: {
            create: products.slice(0, 1).map(product => ({
              productId: product.id,
              quantity: 2,
              price: Number(product.price) * 2,
              productName: product.name,
              productImage: product.images[0] || null,
              color: product.colors[0] || 'Noir',
              size: product.sizes[0] || 'M',
            })),
          },
          shipping: {
            create: {
              carrier: 'Colissimo',
              trackingNumber: 'FR123456789',
              trackingUrl: 'https://www.laposte.fr/outils/suivre-vos-envois?code=FR123456789',
              status: 'DELIVERED',
              deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Livré il y a 5 jours
              shippedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      })
      console.log('✅ Commande test créée:', testOrder.orderNumber)

      // Créer une deuxième commande en cours
      const testOrder2 = await prisma.order.create({
        data: {
          orderNumber: 'FS-2024-002',
          userId: testClient.id,
          shippingAddress: '42 Avenue des Champs-Élysées',
          shippingCity: 'Paris',
          shippingZip: '75008',
          shippingCountry: 'France',
          shippingPhone: '+33 6 12 34 56 78',
          status: 'SHIPPED',
          subtotal: products[1] ? Number(products[1].price) : 45,
          shippingCost: 0,
          total: products[1] ? Number(products[1].price) : 45,
          paymentMethod: 'STRIPE',
          paymentStatus: 'COMPLETED',
          items: {
            create: products.length > 1 ? [{
              productId: products[1].id,
              quantity: 1,
              price: Number(products[1].price),
              productName: products[1].name,
              productImage: products[1].images[0] || null,
              color: products[1].colors[0] || 'Blanc',
              size: 'L',
            }] : [{
              productId: products[0].id,
              quantity: 1,
              price: Number(products[0].price),
              productName: products[0].name,
              productImage: products[0].images[0] || null,
              color: 'Blanc',
              size: 'L',
            }],
          },
          shipping: {
            create: {
              carrier: 'Chronopost',
              trackingNumber: 'FR987654321',
              trackingUrl: 'https://www.chronopost.fr/tracking?code=FR987654321',
              status: 'IN_TRANSIT',
              shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            },
          },
        },
      })
      console.log('✅ Commande test 2 créée:', testOrder2.orderNumber)
    } else {
      console.log('✅ Commandes test déjà existantes')
    }
  } else {
    console.log('⚠️ Aucun produit trouvé, commandes test non créées')
  }

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

  // Bannière promotionnelle de test
  const existingBanner = await prisma.banner.findFirst()
  if (!existingBanner) {
    await prisma.banner.create({
      data: {
        text: '🎉 Livraison OFFERTE dès 50€ d\'achat avec le code WELCOME10 !',
        link: '/shop',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        isActive: true,
        position: 'top',
        order: 0,
      },
    })
    console.log('✅ Bannière promotionnelle créée')
  } else {
    console.log('✅ Bannière déjà existante')
  }

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
