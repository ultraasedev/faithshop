import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { BlockRenderer } from '@/components/page-blocks/BlockRenderer'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const dynamic = 'force-dynamic'

const PAGE_SLUG = 'privacy'

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.pageContent.findUnique({
    where: { slug: PAGE_SLUG }
  })

  return {
    title: page?.metaTitle || page?.title || 'Politique de Confidentialité - Faith Shop',
    description: page?.metaDescription || 'Politique de confidentialité de Faith Shop',
  }
}

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
    if (parsed?.blocks && Array.isArray(parsed.blocks)) return parsed.blocks
    return []
  } catch {
    return []
  }
}

export default async function PrivacyPage() {
  const page = await prisma.pageContent.findUnique({
    where: { slug: PAGE_SLUG }
  })

  const blocks = page ? parsePageContent(page.content) : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24">
        <BlockRenderer blocks={blocks} />
      </main>
      <Footer />
    </div>
  )
}
