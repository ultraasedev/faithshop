'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createPage, updatePage, getPage } from '@/app/actions/admin/cms'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function PageEditor() {
  const router = useRouter()
  const params = useParams()
  const isNew = !params.id || params.id === 'new'
  
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '', // In a real app, use a Rich Text Editor (TipTap, Quill)
    metaTitle: '',
    metaDescription: '',
    isPublished: true
  })

  useEffect(() => {
    if (!isNew && params.id) {
      loadPage(params.id as string)
    }
  }, [params.id])

  async function loadPage(id: string) {
    try {
      const page = await getPage(id)
      if (page) {
        setFormData({
          title: page.title,
          slug: page.slug,
          content: page.content,
          metaTitle: page.metaTitle || '',
          metaDescription: page.metaDescription || '',
          isPublished: page.isPublished
        })
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (isNew) {
        await createPage(formData)
        toast.success('Page créée avec succès')
        router.push('/admin/pages')
      } else {
        await updatePage(params.id as string, formData)
        toast.success('Page mise à jour')
      }
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/pages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? 'Créer une page' : 'Modifier la page'}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="outline" asChild>
              <Link href={`/${formData.slug}`} target="_blank">
                Voir la page
              </Link>
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contenu (HTML/Texte)</label>
                <Textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[400px] font-mono"
                  placeholder="<p>Votre contenu ici...</p>"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Pour l'instant c'est un éditeur brut. HTML accepté.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO (Référencement)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre Meta</label>
                <Input 
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder={formData.title}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description Meta</label>
                <Textarea 
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">URL (Slug)</label>
                <div className="flex items-center mt-1">
                  <span className="text-muted-foreground text-sm mr-1">/</span>
                  <Input 
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <label className="text-sm font-medium">Publié</label>
                <Switch 
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
