import { prisma } from '../lib/prisma'

async function checkProductsStock() {
  try {
    console.log('📦 Checking products stock status...')

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n📊 Found ${products.length} products:`)
    console.log('─'.repeat(80))

    products.forEach((product, index) => {
      const status = product.stock > 0 ? '✅ En stock' : '❌ Rupture'
      const active = product.isActive ? '🟢 Actif' : '🔴 Inactif'

      console.log(`${index + 1}. ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Stock: ${product.stock} ${status}`)
      console.log(`   Status: ${active}`)
      console.log(`   Créé: ${product.createdAt.toLocaleDateString('fr-FR')}`)
      console.log('─'.repeat(40))
    })

    // Statistiques
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.isActive).length
    const inStockProducts = products.filter(p => p.stock > 0).length
    const outOfStockProducts = products.filter(p => p.stock === 0).length

    console.log('\n📈 Statistiques:')
    console.log(`Total produits: ${totalProducts}`)
    console.log(`Produits actifs: ${activeProducts}`)
    console.log(`En stock: ${inStockProducts}`)
    console.log(`Rupture de stock: ${outOfStockProducts}`)

  } catch (error) {
    console.error('❌ Error checking products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductsStock()