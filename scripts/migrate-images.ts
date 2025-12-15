#!/usr/bin/env tsx

import { put } from '@vercel/blob'
import { prisma } from '../lib/prisma'
import fetch from 'node-fetch'

async function migrateImages() {
  try {
    console.log('🚀 Début de la migration des images vers Vercel Blob...\n')

    const products = await prisma.product.findMany({
      select: { id: true, name: true, images: true }
    })

    let totalMigrated = 0
    let totalSkipped = 0
    let totalErrors = 0

    for (const product of products) {
      if (!product.images || product.images.length === 0) {
        console.log(`⏭️  ${product.name}: Aucune image à migrer`)
        continue
      }

      console.log(`📦 Migration: ${product.name}`)

      const newImageUrls: string[] = []

      for (const imageUrl of product.images) {
        try {
          // Skip si déjà sur Vercel Blob
          if (imageUrl.includes('blob.vercel-storage.com')) {
            newImageUrls.push(imageUrl)
            console.log(`   ✅ Déjà sur Vercel Blob: ${imageUrl.split('/').pop()}`)
            totalSkipped++
            continue
          }

          // Construire l'URL complète si c'est un chemin local
          let fullUrl = imageUrl
          if (imageUrl.startsWith('/')) {
            fullUrl = `https://faith-shop.fr${imageUrl}`
          }

          console.log(`   🔄 Migration: ${fullUrl}`)

          // Télécharger l'image
          const response = await fetch(fullUrl)

          if (!response.ok) {
            console.log(`   ❌ Erreur téléchargement (${response.status}): ${fullUrl}`)
            totalErrors++
            // Garder l'URL originale en cas d'erreur
            newImageUrls.push(imageUrl)
            continue
          }

          // Extraire le nom de fichier
          const fileName = imageUrl.split('/').pop() || `image-${Date.now()}.jpg`
          const blob = await response.blob()

          // Upload vers Vercel Blob
          const { url: newUrl } = await put(`products/${product.id}/${fileName}`, blob, {
            access: 'public',
          })

          newImageUrls.push(newUrl)
          console.log(`   ✅ Migré vers: ${newUrl.split('/').pop()}`)
          totalMigrated++

        } catch (error) {
          console.log(`   ❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
          totalErrors++
          // Garder l'URL originale en cas d'erreur
          newImageUrls.push(imageUrl)
        }
      }

      // Mettre à jour le produit avec les nouvelles URLs
      if (newImageUrls.length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: newImageUrls }
        })
        console.log(`   💾 Base de données mise à jour (${newImageUrls.length} images)\n`)
      }
    }

    console.log('📊 Résumé de la migration:')
    console.log(`   ✅ Images migrées: ${totalMigrated}`)
    console.log(`   ⏭️  Images déjà OK: ${totalSkipped}`)
    console.log(`   ❌ Erreurs: ${totalErrors}`)
    console.log('\n✨ Migration terminée!')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  migrateImages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}