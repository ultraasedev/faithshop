import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { BlogListClient } from './BlogListClient'
import { Skeleton } from '@/components/ui/skeleton'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

async function getData() {
  noStore()
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return posts.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    author: p.author,
    category: p.category,
    tags: p.tags,
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
  }))
}

async function Content() {
  const posts = await getData()
  return <BlogListClient posts={posts} />
}

export default function BlogAdminPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-9 w-48" /><Skeleton className="h-[400px]" /></div>}>
      <Content />
    </Suspense>
  )
}
