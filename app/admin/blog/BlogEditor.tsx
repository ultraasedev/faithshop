'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Save, Loader2, Upload, Eye, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  author: string | null
  category: string | null
  tags: string[]
  isPublished: boolean
  isFeatured: boolean
}

interface BlogEditorProps {
  post?: BlogPost
}

const CATEGORIES = ['Foi', 'Mode', 'Inspiration', 'Lifestyle', 'Actualités', 'Témoignages']

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter()
  const isEditing = !!post

  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || '')
  const [coverImage, setCoverImage] = useState(post?.coverImage || '')
  const [author, setAuthor] = useState(post?.author || '')
  const [category, setCategory] = useState(post?.category || '')
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(', ') || '')
  const [isPublished, setIsPublished] = useState(post?.isPublished || false)
  const [isFeatured, setIsFeatured] = useState(post?.isFeatured || false)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isEditing || !post?.slug) {
      setSlug(generateSlug(val))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&folder=blog`, { method: 'POST', body: file })
      if (res.ok) {
        const data = await res.json()
        setCoverImage(data.url)
        toast.success('Image uploadée')
      } else {
        toast.error('Erreur upload')
      }
    } catch { toast.error('Erreur réseau') }
    finally { setUploading(false) }
  }

  const handleSave = useCallback(async (publish?: boolean) => {
    if (!title.trim()) { toast.error('Titre requis'); return }
    if (!content.trim()) { toast.error('Contenu requis'); return }

    setSaving(true)
    const shouldPublish = publish !== undefined ? publish : isPublished

    const body = {
      title,
      slug: slug || generateSlug(title),
      excerpt,
      content,
      coverImage: coverImage || null,
      author: author || null,
      category: category || null,
      tags: tagsInput.split(/[,;]/).map(t => t.trim()).filter(Boolean),
      isPublished: shouldPublish,
      isFeatured,
      ...(shouldPublish && !post?.isPublished ? { publishedAt: new Date().toISOString() } : {}),
    }

    try {
      const url = isEditing ? `/api/admin/blog/${post.id}` : '/api/admin/blog'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(isEditing ? 'Article mis à jour' : 'Article créé')
        if (!isEditing) {
          router.push(`/admin/blog/${data.id}/edit`)
        }
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Erreur')
      }
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }, [title, slug, excerpt, content, coverImage, author, category, tagsInput, isPublished, isFeatured, isEditing, post, router])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">{isEditing ? 'Modifier l\'article' : 'Nouvel article'}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
            <Eye className="h-4 w-4" /> {showPreview ? 'Éditeur' : 'Aperçu'}
          </Button>
          {!isPublished && (
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Brouillon
            </Button>
          )}
          <Button onClick={() => handleSave(true)} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPublished ? 'Mettre à jour' : 'Publier'}
          </Button>
        </div>
      </div>

      {showPreview ? (
        /* ─── Preview ─── */
        <Card>
          <CardContent className="p-0">
            {coverImage && (
              <div className="relative aspect-[21/9] w-full">
                <Image src={coverImage} alt={title} fill className="object-cover" unoptimized={coverImage.includes('blob.vercel-storage')} />
              </div>
            )}
            <div className="p-8 max-w-3xl mx-auto">
              {category && <span className="text-xs font-bold uppercase tracking-widest text-primary">{category}</span>}
              <h1 className="font-serif text-4xl font-bold mt-2 mb-4">{title || 'Titre de l\'article'}</h1>
              {author && <p className="text-sm text-muted-foreground mb-8">Par {author}</p>}
              <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content || '<p>Contenu de l\'article...</p>' }} />
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ─── Editor ─── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Le titre de votre article" className="text-lg font-semibold" />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/blog/</span>
                    <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="mon-article" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Résumé (affiché dans les cartes)</Label>
                  <textarea
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    placeholder="Un court résumé de l'article..."
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground text-right">{excerpt.length}/300</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Contenu</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={"<h2>Introduction</h2>\n<p>Votre contenu ici...</p>\n\n<h2>Section suivante</h2>\n<p>Continuez votre article...</p>\n\n<blockquote>Une citation inspirante</blockquote>"}
                  className="w-full min-h-[400px] px-3 py-2 rounded-md border border-input bg-background text-sm font-mono leading-relaxed"
                />
                <p className="text-xs text-muted-foreground mt-2">HTML supporté : h2, h3, p, strong, em, a, img, blockquote, ul, ol, li</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-4">
            {/* Cover image */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Image de couverture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coverImage ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image src={coverImage} alt="" fill className="object-cover" unoptimized={coverImage.includes('blob.vercel-storage')} />
                    <button onClick={() => setCoverImage('')} className="absolute top-2 right-2 p-1 bg-black/50 rounded text-white hover:bg-black/70 text-xs">X</button>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="URL de l'image" className="flex-1 text-xs" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button variant="outline" size="icon" asChild disabled={uploading}>
                      <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Meta */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Métadonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Auteur</Label>
                  <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nom de l'auteur" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Catégorie</Label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                    <option value="">Aucune</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tags (séparés par des virgules)</Label>
                  <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="foi, mode, inspiration" />
                </div>
              </CardContent>
            </Card>

            {/* Publish settings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm">Publié</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm">Mis en avant (à la une)</span>
                </label>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
