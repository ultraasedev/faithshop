'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/admin/common/StatusBadge'
import {
  Plus,
  FileText,
  Home,
  ShoppingBag,
  Mail,
  Info,
  Search,
  Edit,
  Eye,
  Trash2,
  Copy,
  MoreHorizontal,
  Globe,
  Clock,
  Lock,
  Scale,
  Shield,
  Truck
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Page {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isHomepage: boolean
  template: string | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: Date
  updatedAt: Date
  _count: { versions: number }
}

interface PagesClientProps {
  pages: Page[]
}

const pageIcons: Record<string, typeof FileText> = {
  home: Home,
  shop: ShoppingBag,
  contact: Mail,
  about: Info,
  cgv: Scale,
  legal: Scale,
  privacy: Shield,
  livraison: Truck,
}

const templates = [
  { value: 'blank', label: 'Page vierge' },
  { value: 'landing', label: 'Landing page' },
  { value: 'about', label: 'À propos' },
  { value: 'contact', label: 'Contact' },
  { value: 'faq', label: 'FAQ' },
]

export function PagesClient({ pages }: PagesClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newPage, setNewPage] = useState({ title: '', slug: '', template: 'blank' })
  const [isLoading, setIsLoading] = useState(false)

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(search.toLowerCase()) ||
    page.slug.toLowerCase().includes(search.toLowerCase())
  )

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCreatePage = async () => {
    if (!newPage.title.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPage.title,
          slug: newPage.slug || generateSlug(newPage.title),
          template: newPage.template,
          status: 'DRAFT'
        })
      })

      if (res.ok) {
        const page = await res.json()
        setIsCreating(false)
        setNewPage({ title: '', slug: '', template: 'blank' })
        router.push(`/admin/pages/${page.slug}/edit`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return

    await fetch(`/api/admin/pages/${pageId}`, { method: 'DELETE' })
    router.refresh()
  }

  const handleDuplicatePage = async (page: Page) => {
    const res = await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${page.title} (copie)`,
        slug: `${page.slug}-copy`,
        template: page.template,
        status: 'DRAFT',
        duplicateFrom: page.id
      })
    })

    if (res.ok) {
      router.refresh()
    }
  }

  const getPageIcon = (page: Page) => {
    if (page.isHomepage) return Home
    const iconKey = Object.keys(pageIcons).find(key => page.slug.includes(key))
    return iconKey ? pageIcons[iconKey] : FileText
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pages
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {pages.length} page{pages.length > 1 ? 's' : ''} • Créez et modifiez vos pages
          </p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle page</DialogTitle>
              <DialogDescription>
                Choisissez un modèle et commencez à construire votre page
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Titre de la page</Label>
                <Input
                  placeholder="Ma nouvelle page"
                  value={newPage.title}
                  onChange={(e) => setNewPage({
                    ...newPage,
                    title: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>URL (slug)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">/</span>
                  <Input
                    placeholder="ma-nouvelle-page"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Modèle</Label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.value}
                      onClick={() => setNewPage({ ...newPage, template: template.value })}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        newPage.template === template.value
                          ? "border-gray-900 bg-gray-50 dark:border-white dark:bg-gray-800"
                          : "border-gray-200 hover:border-gray-400 dark:border-gray-700"
                      )}
                    >
                      <p className="font-medium text-sm">{template.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreatePage} disabled={isLoading || !newPage.title}>
                {isLoading ? 'Création...' : 'Créer la page'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher une page..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => {
          const Icon = getPageIcon(page)

          return (
            <Card key={page.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      page.isHomepage
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {page.title}
                      </h3>
                      <p className="text-sm text-gray-500">/{page.slug}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(page.template === 'fixed' ? `/admin/pages/${page.slug}` : `/admin/pages/${page.slug}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/${page.slug === 'home' ? '' : page.slug}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir la page
                      </DropdownMenuItem>
                      {page.template !== 'fixed' && (
                        <DropdownMenuItem onClick={() => handleDuplicatePage(page)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                      )}
                      {page.template !== 'fixed' && <DropdownMenuSeparator />}
                      {page.template !== 'fixed' && (
                        <DropdownMenuItem
                          onClick={() => handleDeletePage(page.id)}
                          className="text-red-600"
                          disabled={page.isHomepage}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <StatusBadge
                    status={page.status}
                    type="page"
                    size="sm"
                  />
                  {page.isHomepage && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      <Home className="h-3 w-3" />
                      Accueil
                    </span>
                  )}
                  {page.template === 'fixed' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Lock className="h-3 w-3" />
                      Design fixe
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(page.updatedAt), 'dd MMM yyyy', { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    {page._count.versions} version{page._count.versions > 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(page.template === 'fixed' ? `/admin/pages/${page.slug}` : `/admin/pages/${page.slug}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {page.template === 'fixed' ? 'Modifier le contenu' : 'Éditer avec le Page Builder'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}

        {filteredPages.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {search ? 'Aucune page trouvée' : 'Aucune page'}
            </h3>
            <p className="text-gray-500 mb-4">
              {search
                ? 'Essayez une autre recherche'
                : 'Commencez par créer votre première page'}
            </p>
            {!search && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une page
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
