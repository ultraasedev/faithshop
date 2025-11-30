import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

// Cette route permet de seed la base de données
// Appelez GET /api/seed une fois après le déploiement
export async function GET() {
  try {
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
        metaDescription: "Découvrez l'histoire de FAITH SHOP et nos valeurs.",
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

    // Produits par défaut
    const existingProducts = await prisma.product.count()
    let productsCreated = 0
    if (existingProducts === 0) {
      const products = [
        {
          name: 'T-Shirt Faith Classic',
          slug: 't-shirt-faith-classic',
          description: 'T-shirt premium en coton bio avec le logo Faith brodé. Coupe classique unisexe.',
          price: 45.00,
          images: ['/products/tshirt-1.jpg'],
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          colors: ['Noir', 'Blanc', 'Gris'],
          stock: 100,
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Hoodie Faith Premium',
          slug: 'hoodie-faith-premium',
          description: 'Hoodie oversize en coton épais 350gsm. Capuche doublée et poche kangourou.',
          price: 89.00,
          images: ['/products/hoodie-1.jpg'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Noir', 'Crème'],
          stock: 50,
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Casquette Faith Logo',
          slug: 'casquette-faith-logo',
          description: 'Casquette brodée avec logo Faith. Ajustable avec clip métal.',
          price: 35.00,
          images: ['/products/cap-1.jpg'],
          sizes: ['Unique'],
          colors: ['Noir', 'Beige'],
          stock: 75,
          isActive: true,
          isFeatured: false,
        },
        {
          name: 'Sweatshirt Faith Minimal',
          slug: 'sweatshirt-faith-minimal',
          description: 'Sweatshirt col rond au design minimaliste. Logo discret sur la poitrine.',
          price: 69.00,
          images: ['/products/sweat-1.jpg'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Noir', 'Gris chiné', 'Bleu marine'],
          stock: 60,
          isActive: true,
          isFeatured: true,
        },
        {
          name: 'Tote Bag Faith',
          slug: 'tote-bag-faith',
          description: 'Tote bag en coton canvas épais. Parfait pour vos courses ou la plage.',
          price: 25.00,
          images: ['/products/tote-1.jpg'],
          sizes: ['Unique'],
          colors: ['Naturel', 'Noir'],
          stock: 120,
          isActive: true,
          isFeatured: false,
        },
        {
          name: 'T-Shirt Faith Oversized',
          slug: 't-shirt-faith-oversized',
          description: 'T-shirt oversized avec print Faith au dos. Coupe ample et moderne.',
          price: 55.00,
          images: ['/products/tshirt-2.jpg'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Noir', 'Blanc cassé'],
          stock: 80,
          isActive: true,
          isFeatured: true,
        },
      ]

      for (const product of products) {
        await prisma.product.create({
          data: product,
        })
        productsCreated++
      }
      console.log('✅ Produits créés:', productsCreated)
    } else {
      console.log('✅ Produits déjà existants:', existingProducts)
    }

    // Créer des commandes test pour le client
    const products = await prisma.product.findMany({ take: 2 })
    if (products.length > 0) {
      const existingOrder = await prisma.order.findFirst({
        where: { userId: testClient.id }
      })

      if (!existingOrder) {
        // Commande livrée (éligible au retour)
        await prisma.order.create({
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
            subtotal: Number(products[0].price) * 2,
            shippingCost: 4.99,
            total: Number(products[0].price) * 2 + 4.99,
            paymentMethod: 'STRIPE',
            paymentStatus: 'COMPLETED',
            items: {
              create: [{
                productId: products[0].id,
                quantity: 2,
                price: Number(products[0].price) * 2,
                productName: products[0].name,
                productImage: products[0].images[0] || null,
                color: products[0].colors[0] || 'Noir',
                size: products[0].sizes[0] || 'M',
              }],
            },
            shipping: {
              create: {
                carrier: 'Colissimo',
                trackingNumber: 'FR123456789',
                trackingUrl: 'https://www.laposte.fr/outils/suivre-vos-envois?code=FR123456789',
                status: 'DELIVERED',
                deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                shippedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        })
        console.log('✅ Commande test 1 créée: FS-2024-001')

        // Commande en transit
        if (products.length > 1) {
          await prisma.order.create({
            data: {
              orderNumber: 'FS-2024-002',
              userId: testClient.id,
              shippingAddress: '42 Avenue des Champs-Élysées',
              shippingCity: 'Paris',
              shippingZip: '75008',
              shippingCountry: 'France',
              shippingPhone: '+33 6 12 34 56 78',
              status: 'SHIPPED',
              subtotal: Number(products[1].price),
              shippingCost: 0,
              total: Number(products[1].price),
              paymentMethod: 'STRIPE',
              paymentStatus: 'COMPLETED',
              items: {
                create: [{
                  productId: products[1].id,
                  quantity: 1,
                  price: Number(products[1].price),
                  productName: products[1].name,
                  productImage: products[1].images[0] || null,
                  color: products[1].colors[0] || 'Blanc',
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
          console.log('✅ Commande test 2 créée: FS-2024-002')
        }
      } else {
        console.log('✅ Commandes test déjà existantes')
      }
    }

    // Bannière promotionnelle
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
    }

    console.log('🎉 Seed terminé avec succès!')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        superAdmin: superAdmin.email,
        testClient: testClient.email,
        configs: defaultConfigs.length,
        themes: 2,
        welcomeCode: welcomeCode.code,
        products: productsCreated || existingProducts,
      },
    })
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
