import { prisma } from '../lib/prisma'

async function fixProductsStock() {
  try {
    console.log('🔧 Fixing products stock...')

    // Mettre un stock de 50 pour tous les produits
    const result = await prisma.product.updateMany({
      data: {
        stock: 50
      }
    })

    console.log(`✅ Updated ${result.count} products with stock: 50`)

    // Vérifier le résultat
    const updatedProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        isActive: true
      }
    })

    console.log('\n📊 Products after update:')
    console.log('─'.repeat(60))

    updatedProducts.forEach((product, index) => {
      const status = product.stock > 0 ? '✅ En stock' : '❌ Rupture'
      console.log(`${index + 1}. ${product.name} - Stock: ${product.stock} ${status}`)
    })

    console.log('\n🎉 All products now have stock!')

  } catch (error) {
    console.error('❌ Error fixing products stock:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductsStock()