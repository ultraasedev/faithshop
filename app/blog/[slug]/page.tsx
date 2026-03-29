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
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
  })

  if (!post) {
    return { title: 'Article introuvable - Faith Shop' }
  }

  return {
    title: `${post.title} - Faith Shop`,
    description: post.excerpt || post.title,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Back link */}
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au blog
          </Link>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mt-8 max-w-5xl mx-auto px-4">
            <div className="relative aspect-[21/9] overflow-hidden bg-neutral-100">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized={post.coverImage.includes('blob.vercel-storage')}
              />
            </div>
          </div>
        )}

        {/* Article Header */}
        <header className="max-w-3xl mx-auto px-4 mt-10 md:mt-16 text-center">
          <div className="flex items-center justify-center gap-3 text-xs text-neutral-400 uppercase tracking-[0.2em]">
            {post.category && (
              <span className="border border-neutral-200 px-3 py-1">
                {post.category}
              </span>
            )}
            {post.publishedAt && (
              <span>
                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
          <h1 className="mt-6 font-serif text-3xl md:text-5xl lg:text-6xl text-neutral-900 leading-tight">
            {post.title}
          </h1>
          {post.author && (
            <p className="mt-6 text-sm text-neutral-400 uppercase tracking-wider">
              Par {post.author}
            </p>
          )}
        </header>

        {/* Divider */}
        <div className="max-w-16 mx-auto mt-10 border-t border-neutral-200" />

        {/* Article Content */}
        <article
          className="max-w-3xl mx-auto px-4 mt-10 mb-20 md:mb-32 blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 mb-20 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs uppercase tracking-wider text-neutral-400 border border-neutral-200 px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Blog content prose styles */}
      <style>{`
        .blog-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #404040;
        }
        .blog-content h1 {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 2.25rem;
          font-weight: 700;
          color: #171717;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .blog-content h2 {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1.75rem;
          font-weight: 700;
          color: #171717;
          margin-top: 2.25rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .blog-content h3 {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1.375rem;
          font-weight: 600;
          color: #171717;
          margin-top: 2rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1.125rem;
          font-weight: 600;
          color: #171717;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .blog-content p {
          margin-bottom: 1.25rem;
        }
        .blog-content a {
          color: #171717;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.2s;
        }
        .blog-content a:hover {
          opacity: 0.6;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
        }
        .blog-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .blog-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content blockquote {
          border-left: 2px solid #d4d4d4;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #737373;
        }
        .blog-content strong {
          font-weight: 600;
          color: #171717;
        }
        .blog-content em {
          font-style: italic;
        }
        .blog-content hr {
          border: none;
          border-top: 1px solid #e5e5e5;
          margin: 2.5rem 0;
        }
        .blog-content pre {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-size: 0.875rem;
        }
        .blog-content code {
          background: #fafafa;
          padding: 0.15rem 0.35rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}
