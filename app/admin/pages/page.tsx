'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getPages, createPage, deletePage } from '@/app/actions/admin/cms'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PagesAdmin() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPages()
  }, [])

  async function loadPages() {
    try {
      const data = await getPages()
      setPages(data)
    } catch (error) {
      toast.error('Erreur lors du chargement des pages')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return
    try {
      await deletePage(id)
      toast.success('Page supprimée')
      loadPages()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground mt-2">Gérez le contenu de vos pages personnalisées (Mentions légales, À propos, etc.)</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="mr-2 h-4 w-4" /> Créer une page
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">URL (Slug)</th>
                <th className="px-6 py-4">Dernière modification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">Chargement...</td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Aucune page trouvée.</td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{page.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">/{page.slug}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(page.updatedAt), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/${page.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/pages/${page.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
