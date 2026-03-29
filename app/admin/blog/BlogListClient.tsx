'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Eye, EyeOff, Star, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  author: string | null
  category: string | null
  tags: string[]
  isPublished: boolean
  isFeatured: boolean
  publishedAt: Date | null
  createdAt: Date
}

export function BlogListClient({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const togglePublish = async (id: string, isPublished: boolean) => {
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isPublished: !isPublished,
        ...(!isPublished ? { publishedAt: new Date().toISOString() } : {}),
      }),
    })
    if (res.ok) {
      toast.success(isPublished ? 'Article dépublié' : 'Article publié')
      router.refresh()
    }
  }

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    })
    if (res.ok) { toast.success(isFeatured ? 'Retiré de la une' : 'Mis en avant'); router.refresh() }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Article supprimé'); router.refresh() }
    setDeleting(null)
  }

  const published = posts.filter(p => p.isPublished)
  const drafts = posts.filter(p => !p.isPublished)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground mt-1">{posts.length} article{posts.length > 1 ? 's' : ''} ({published.length} publié{published.length > 1 ? 's' : ''}, {drafts.length} brouillon{drafts.length > 1 ? 's' : ''})</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Nouvel article</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Aucun article pour le moment</p>
            <Link href="/admin/blog/new">
              <Button className="gap-2"><Plus className="h-4 w-4" /> Créer votre premier article</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Cover image */}
                <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt="" fill className="object-cover" unoptimized={post.coverImage.includes('blob.vercel-storage')} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">Pas d'image</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold truncate">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt || 'Pas de résumé'}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        post.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {post.isPublished ? 'Publié' : 'Brouillon'}
                      </span>
                      {post.isFeatured && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          A la une
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {post.category && <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{post.category}</span>}
                    {post.author && <span>par {post.author}</span>}
                    <span>{format(new Date(post.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                  </div>

                  <div className="flex items-center gap-1 mt-3">
                    <Link href={`/admin/blog/${post.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1 h-7 text-xs"><Edit className="h-3 w-3" /> Modifier</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => togglePublish(post.id, post.isPublished)}>
                      {post.isPublished ? <><EyeOff className="h-3 w-3 mr-1" /> Dépublier</> : <><Eye className="h-3 w-3 mr-1" /> Publier</>}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleFeatured(post.id, post.isFeatured)}>
                      <Star className={cn("h-3 w-3 mr-1", post.isFeatured && "fill-yellow-500 text-yellow-500")} /> Une
                    </Button>
                    {post.isPublished && (
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><ExternalLink className="h-3 w-3" /> Voir</Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive ml-auto" onClick={() => deletePost(post.id)} disabled={deleting === post.id}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
