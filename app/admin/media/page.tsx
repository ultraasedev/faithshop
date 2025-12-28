import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MediaClient } from './MediaClient'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  // Fetch media from Media table
  const mediaFromTable = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Also fetch product images to include in the library
  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true, createdAt: true }
  })

  // Convert product images to media format
  const productImages = products.flatMap(product =>
    (product.images || []).map((url, index) => ({
      id: `product-${product.id}-${index}`,
      filename: `${product.name.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.jpg`,
      url: url,
      mimeType: 'image/jpeg',
      size: 0, // Unknown size for product images
      alt: product.name,
      folder: 'products',
      createdAt: product.createdAt
    }))
  )

  // Combine both sources
  const allMedia = [...mediaFromTable, ...productImages]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const folders = await prisma.media.groupBy({
    by: ['folder'],
    _count: { id: true },
    _sum: { size: true }
  })

  const formattedFolders = folders.map(f => ({
    name: f.folder || 'general',
    count: f._count.id,
    size: f._sum.size || 0
  }))

  // Add products folder if not already present and there are product images
  if (productImages.length > 0 && !formattedFolders.some(f => f.name === 'products')) {
    formattedFolders.push({
      name: 'products',
      count: productImages.length,
      size: 0
    })
  } else if (productImages.length > 0) {
    const productsFolder = formattedFolders.find(f => f.name === 'products')
    if (productsFolder) {
      productsFolder.count += productImages.length
    }
  }

  const stats = {
    totalFiles: allMedia.length,
    totalSize: mediaFromTable.reduce((sum, m) => sum + m.size, 0),
    folders: formattedFolders.length
  }

  return (
    <MediaClient
      media={allMedia}
      folders={formattedFolders}
      stats={stats}
    />
  )
}
