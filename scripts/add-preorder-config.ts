import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addPreorderConfig() {
  try {
    // Configuration pour activer/désactiver les pré-commandes
    await prisma.siteConfig.upsert({
      where: { key: 'preorder_enabled' },
      update: {},
      create: {
        key: 'preorder_enabled',
        value: 'true',
        type: 'boolean',
        category: 'shop',
        label: 'Activer les pré-commandes',
        description: 'Active/désactive le système de pré-commande sur le site'
      }
    })

    // Message du bandeau de pré-commande
    await prisma.siteConfig.upsert({
      where: { key: 'preorder_message' },
      update: {},
      create: {
        key: 'preorder_message',
        value: 'Expédition le 16 janvier 2025',
        type: 'text',
        category: 'shop',
        label: 'Message de pré-commande',
        description: 'Message affiché dans le bandeau de pré-commande'
      }
    })

    // Date d'expédition
    await prisma.siteConfig.upsert({
      where: { key: 'preorder_shipping_date' },
      update: {},
      create: {
        key: 'preorder_shipping_date',
        value: '2025-01-16',
        type: 'date',
        category: 'shop',
        label: 'Date d\'expédition',
        description: 'Date prévue pour l\'expédition des pré-commandes'
      }
    })

    // Pages où afficher le bandeau
    await prisma.siteConfig.upsert({
      where: { key: 'preorder_show_pages' },
      update: {},
      create: {
        key: 'preorder_show_pages',
        value: JSON.stringify(['product', 'checkout']),
        type: 'json',
        category: 'shop',
        label: 'Pages bandeau pré-commande',
        description: 'Pages où afficher le bandeau de pré-commande'
      }
    })

    console.log('✅ Configuration de pré-commande ajoutée avec succès')

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la configuration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addPreorderConfig()