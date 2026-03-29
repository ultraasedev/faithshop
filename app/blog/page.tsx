import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog - Faith Shop',
  description: 'Découvrez nos articles sur la foi, la mode et l\'inspiration.',
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })

  const featuredPosts = posts.filter((p) => p.isFeatured)
  const regularPosts = posts.filter((p) => !p.isFeatured)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-neutral-200 py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">
              Journal
            </p>
            <h1 className="font-serif text-4xl md:text-6xl text-neutral-900">
              Le Blog
            </h1>
            <p className="mt-4 text-neutral-500 max-w-lg mx-auto">
              Réflexions sur la foi, la mode éthique et l&apos;inspiration au quotidien.
            </p>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 md:py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-8">
                À la une
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized={post.coverImage.includes('blob.vercel-storage')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="mt-5">
                      <div className="flex items-center gap-3 text-xs text-neutral-400 uppercase tracking-wider">
                        {post.category && <span>{post.category}</span>}
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
                      <h2 className="mt-2 font-serif text-2xl md:text-3xl text-neutral-900 group-hover:text-neutral-600 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-neutral-500 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Regular Posts Grid */}
        {regularPosts.length > 0 && (
          <section className="py-12 md:py-20 px-4 border-t border-neutral-100">
            <div className="max-w-6xl mx-auto">
              {featuredPosts.length > 0 && (
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-8">
                  Tous les articles
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {regularPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized={post.coverImage.includes('blob.vercel-storage')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-3 text-xs text-neutral-400 uppercase tracking-wider">
                        {post.category && <span>{post.category}</span>}
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
                      <h3 className="mt-2 font-serif text-xl text-neutral-900 group-hover:text-neutral-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-neutral-500 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <section className="py-24 px-4 text-center">
            <div className="max-w-md mx-auto">
              <p className="text-neutral-400 text-lg">
                Aucun article pour le moment.
              </p>
              <p className="mt-2 text-neutral-400 text-sm">
                Revenez bientôt pour découvrir nos premiers contenus.
              </p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
