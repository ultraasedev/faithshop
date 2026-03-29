import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { BlogEditor } from '../../BlogEditor'

export const dynamic = 'force-dynamic'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.blogPost.findUnique({ where: { id } })

  if (!post) return notFound()

  return (
    <BlogEditor
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        author: post.author,
        category: post.category,
        tags: post.tags,
        isPublished: post.isPublished,
        isFeatured: post.isFeatured,
      }}
    />
  )
}
