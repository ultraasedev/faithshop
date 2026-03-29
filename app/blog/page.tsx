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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Blog
            </p>
            <h1 className="font-serif text-4xl md:text-6xl">
              Faith Conseils
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Réflexions sur la foi, la mode éthique et l&apos;inspiration au quotidien.
            </p>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 md:py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
                À la une
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-secondary rounded-lg">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized={post.coverImage.includes('unsplash') || post.coverImage.includes('blob.vercel-storage')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="mt-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-wider">
                        {post.category && <span className="text-primary font-semibold">{post.category}</span>}
                        {post.publishedAt && (
                          <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        )}
                      </div>
                      <h2 className="mt-2 font-serif text-2xl md:text-3xl group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-muted-foreground line-clamp-2">{post.excerpt}</p>
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
          <section className="py-12 md:py-20 px-4 border-t border-border">
            <div className="max-w-6xl mx-auto">
              {featuredPosts.length > 0 && (
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">Tous les articles</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {regularPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary rounded-lg">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized={post.coverImage.includes('unsplash') || post.coverImage.includes('blob.vercel-storage')}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-wider">
                        {post.category && <span className="text-primary font-semibold">{post.category}</span>}
                        {post.publishedAt && (
                          <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        )}
                      </div>
                      <h3 className="mt-2 font-serif text-xl group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
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
            <p className="text-muted-foreground text-lg">Aucun article pour le moment.</p>
            <p className="mt-2 text-muted-foreground text-sm">Revenez bientôt pour découvrir nos premiers contenus.</p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
