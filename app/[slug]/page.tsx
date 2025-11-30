import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await prisma.pageContent.findUnique({
    where: { slug: params.slug }
  })

  if (!page) return {}

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await prisma.pageContent.findUnique({
    where: { slug: params.slug }
  })

  if (!page || !page.isPublished) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">{page.title}</h1>
        
        {/* Render HTML Content safely */}
        <div 
          className="prose prose-lg dark:prose-invert mx-auto"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}
