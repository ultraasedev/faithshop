import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug, isPublished: true } })
  if (!post) return { title: 'Article introuvable - Faith Shop' }
  return {
    title: `${post.title} - Faith Shop`,
    description: post.excerpt || post.title,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug, isPublished: true } })
  if (!post) notFound()

  // Fetch related posts (same category, exclude current)
  const relatedPosts = post.category
    ? await prisma.blogPost.findMany({
        where: { isPublished: true, category: post.category, id: { not: post.id } },
        take: 3,
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, slug: true, coverImage: true, category: true, publishedAt: true },
      })
    : []

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Back link */}
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au blog
          </Link>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mt-8 max-w-5xl mx-auto px-4">
            <div className="relative aspect-[21/9] overflow-hidden bg-secondary rounded-xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized={post.coverImage.includes('unsplash') || post.coverImage.includes('blob.vercel-storage')}
              />
            </div>
          </div>
        )}

        {/* Article Header */}
        <header className="max-w-3xl mx-auto px-4 mt-10 md:mt-16 text-center">
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground uppercase tracking-[0.2em]">
            {post.category && (
              <span className="border border-border px-3 py-1 rounded-full text-primary font-semibold">
                {post.category}
              </span>
            )}
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
          </div>
          <h1 className="mt-6 font-serif text-3xl md:text-5xl lg:text-6xl leading-tight">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-6 text-sm text-muted-foreground uppercase tracking-wider">Par {post.author}</p>
          )}
        </header>

        {/* Divider */}
        <div className="max-w-16 mx-auto mt-10 border-t border-border" />

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-4 mt-10 mb-20 md:mb-32 blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 mb-16 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs uppercase tracking-wider text-muted-foreground border border-border px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-border py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl mb-10 text-center">Articles similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((rp) => (
                  <Link key={rp.id} href={`/blog/${rp.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary rounded-lg">
                      {rp.coverImage && (
                        <Image
                          src={rp.coverImage}
                          alt={rp.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized={rp.coverImage.includes('unsplash') || rp.coverImage.includes('blob.vercel-storage')}
                        />
                      )}
                    </div>
                    <h3 className="mt-4 font-serif text-lg group-hover:text-primary transition-colors">{rp.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />

      {/* Blog content styles — works with both light and dark themes */}
      <style>{`
        .blog-content {
          font-size: 1.125rem;
          line-height: 1.8;
        }
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6 {
          font-family: var(--font-serif, Georgia, serif);
          font-weight: 700;
          color: var(--foreground);
          line-height: 1.3;
        }
        .blog-content h1 { font-size: 2.25rem; margin-top: 2.5rem; margin-bottom: 1rem; }
        .blog-content h2 { font-size: 1.75rem; margin-top: 2.25rem; margin-bottom: 0.75rem; }
        .blog-content h3 { font-size: 1.375rem; margin-top: 2rem; margin-bottom: 0.5rem; }
        .blog-content p { margin-bottom: 1.25rem; }
        .blog-content a {
          color: var(--foreground);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }
        .blog-content a:hover { opacity: 0.6; }
        .blog-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 0.5rem;
        }
        .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .blog-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content blockquote {
          border-left: 3px solid var(--primary, #000);
          padding: 1rem 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: var(--muted-foreground);
          background: var(--secondary, #f5f5f5);
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .blog-content strong { font-weight: 700; color: var(--foreground); }
        .blog-content hr { border: none; border-top: 1px solid var(--border); margin: 2.5rem 0; }
        .blog-content pre {
          background: var(--secondary, #f5f5f5);
          border: 1px solid var(--border);
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-size: 0.875rem;
          border-radius: 0.5rem;
        }
        .blog-content code {
          background: var(--secondary, #f5f5f5);
          padding: 0.15rem 0.35rem;
          font-size: 0.875rem;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  )
}
