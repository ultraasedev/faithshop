import { prisma } from '@/lib/prisma'
import { BlockRenderer } from '@/components/page-blocks/BlockRenderer'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const dynamic = 'force-dynamic'

interface PageBlock {
  id: string
  type: string
  content: Record<string, unknown>
  settings?: Record<string, unknown>
}

function parsePageContent(content: string): PageBlock[] {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
    }
    return []
  } catch {
    return []
  }
}

export default async function Home() {
  // Fetch the home page from PageContent
  const page = await prisma.pageContent.findFirst({
    where: { slug: 'home' }
  })

  // Fetch collections and products for block rendering
  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 50,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        isFeatured: true
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  const blocks = page ? parsePageContent(page.content) : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {blocks.length > 0 ? (
          <BlockRenderer
            blocks={blocks}
            collections={collections}
            products={products.map(p => ({
              ...p,
              price: Number(p.price),
              images: p.images as string[]
            }))}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-500">Configurez la page d'accueil dans le Page Builder</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
