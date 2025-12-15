#!/usr/bin/env tsx

import { put } from '@vercel/blob'
import { prisma } from '../lib/prisma'

// Couleurs pour générer des placeholders
const colors = [
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#6366F1', // indigo
]

async function generatePlaceholderSvg(productName: string, color: string): Promise<Buffer> {
  const initials = productName
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()

  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="${color}"/>
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="80" font-weight="bold"
            text-anchor="middle" dominant-baseline="middle" fill="white">${initials}</text>
      <text x="200" y="320" font-family="Arial, sans-serif" font-size="16" font-weight="normal"
            text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.8)">FAITH SHOP</text>
    </svg>
  `

  return Buffer.from(svg)
}

async function addPlaceholderImages() {
  try {
    console.log('🖼️  Ajout d\'images placeholder pour les produits sans images...\n')

    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, images: true }
    })

    // Filtrer ceux sans images
    const products = allProducts.filter(p =>
      !p.images || p.images.length === 0
    )

    console.log(`📦 ${products.length} produits sans images trouvés\n`)

    let totalAdded = 0

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const color = colors[i % colors.length]

      try {
        console.log(`🎨 Génération placeholder: ${product.name}`)

        // Générer SVG placeholder
        const svgBuffer = await generatePlaceholderSvg(product.name, color)

        // Upload vers Vercel Blob
        const { url } = await put(`products/${product.id}/placeholder.svg`, svgBuffer, {
          access: 'public',
          contentType: 'image/svg+xml'
        })

        // Mettre à jour le produit
        await prisma.product.update({
          where: { id: product.id },
          data: { images: [url] }
        })

        console.log(`   ✅ Placeholder ajouté: ${url.split('/').pop()}`)
        totalAdded++

      } catch (error) {
        console.error(`   ❌ Erreur pour ${product.name}:`, error)
      }

      console.log('')
    }

    console.log('📊 Résumé:')
    console.log(`   ✅ Placeholders ajoutés: ${totalAdded}`)
    console.log('\n✨ Placeholders générés avec succès!')

  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  addPlaceholderImages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}