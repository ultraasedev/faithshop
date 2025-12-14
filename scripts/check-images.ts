#!/usr/bin/env tsx

import { prisma } from '../lib/prisma'

async function checkImages() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, images: true }
    })

    console.log('🔍 Vérification des images des produits:\n')

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   ID: ${product.id}`)

      if (product.images && product.images.length > 0) {
        console.log(`   📸 ${product.images.length} image(s):`)
        product.images.slice(0, 3).forEach((url, imgIndex) => {
          const isVercelBlob = url.includes('blob.vercel-storage.com')
          const isLocal = url.startsWith('/')
          const isHttps = url.startsWith('https://')

          console.log(`     ${imgIndex + 1}. ${url.length > 60 ? url.substring(0, 60) + '...' : url}`)
          console.log(`        Type: ${isVercelBlob ? '✅ Vercel Blob' : isLocal ? '⚠️ Local' : isHttps ? '🌐 External HTTPS' : '❌ Autre'}`)
        })
        if (product.images.length > 3) {
          console.log(`     ... et ${product.images.length - 3} autres`)
        }
      } else {
        console.log(`   ❌ Aucune image`)
      }
      console.log('')
    })

  } catch (error) {
    console.error('Erreur:', error)
  }
}

checkImages()