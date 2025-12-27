'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Image as ImageIcon,
  Upload,
  Folder,
  Search,
  MoreHorizontal,
  Trash2,
  Copy,
  Download,
  HardDrive,
  FileImage,
  Grid3X3,
  List,
  X,
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Media {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  alt: string | null
  folder: string | null
  createdAt: Date
}

interface FolderInfo {
  name: string
  count: number
  size: number
}

interface Stats {
  totalFiles: number
  totalSize: number
  folders: number
}

interface MediaClientProps {
  media: Media[]
  folders: FolderInfo[]
  stats: Stats
}

export function MediaClient({ media: initialMedia, folders, stats }: MediaClientProps) {
  const router = useRouter()
  const [media, setMedia] = useState(initialMedia)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleUpload = async (files: FileList) => {
    setIsUploading(true)
    setUploadProgress(0)

    const totalFiles = files.length
    let completed = 0

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', selectedFolder === 'all' ? 'general' : selectedFolder)

      try {
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          completed++
          setUploadProgress(Math.round((completed / totalFiles) * 100))
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    setIsUploading(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce fichier ?')) return

    const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMedia(media.filter(m => m.id !== id))
      setSelectedMedia(null)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedItems.length} fichiers ?`)) return

    for (const id of selectedItems) {
      await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' })
    }
    setMedia(media.filter(m => !selectedItems.includes(m.id)))
    setSelectedItems([])
    router.refresh()
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const toggleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const filteredMedia = media.filter(m => {
    const matchesSearch = m.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = selectedFolder === 'all' || m.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Médiathèque
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {stats.totalFiles} fichiers - {formatSize(stats.totalSize)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer ({selectedItems.length})
            </Button>
          )}
          <label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <Button asChild className="cursor-pointer">
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Uploader
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileImage className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalFiles}</p>
              <p className="text-sm text-gray-500">Fichiers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <HardDrive className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatSize(stats.totalSize)}</p>
              <p className="text-sm text-gray-500">Espace utilisé</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Folder className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.folders}</p>
              <p className="text-sm text-gray-500">Dossiers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un fichier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-full sm:w-48">
                <Folder className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Dossier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les dossiers</SelectItem>
                {folders.map(f => (
                  <SelectItem key={f.name} value={f.name}>
                    {f.name} ({f.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Upload className="h-5 w-5 animate-pulse text-blue-600" />
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer border-2 transition-all",
                selectedItems.includes(item.id)
                  ? "border-blue-600 ring-2 ring-blue-600/20"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              )}
              onClick={() => setSelectedMedia(item)}
            >
              <Image
                src={item.url}
                alt={item.alt || item.filename}
                fill
                className="object-cover"
              />

              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSelect(item.id) }}
                className={cn(
                  "absolute top-2 left-2 h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
                  selectedItems.includes(item.id)
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100"
                )}
              >
                {selectedItems.includes(item.id) && <Check className="h-3 w-3" />}
              </button>

              {/* Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); copyUrl(item.url) }}>
                  {copiedUrl === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Filename */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs text-white truncate">{item.filename}</p>
              </div>
            </div>
          ))}

          {filteredMedia.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun fichier
              </h3>
              <p className="text-gray-500 mb-4">
                Uploadez vos premières images
              </p>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y dark:divide-gray-800">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                  <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <Image src={item.url} alt={item.filename} width={48} height={48} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.filename}</p>
                    <p className="text-sm text-gray-500">{item.folder || 'general'}</p>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-500">{formatSize(item.size)}</div>
                  <div className="hidden md:block text-sm text-gray-500">
                    {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyUrl(item.url)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier l'URL
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={item.url} download>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Detail Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedia.filename}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image src={selectedMedia.url} alt={selectedMedia.filename} fill className="object-contain" />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={selectedMedia.url} readOnly className="text-xs" />
                      <Button variant="outline" size="icon" onClick={() => copyUrl(selectedMedia.url)}>
                        {copiedUrl === selectedMedia.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium">{selectedMedia.mimeType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Taille</p>
                      <p className="font-medium">{formatSize(selectedMedia.size)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dossier</p>
                      <p className="font-medium">{selectedMedia.folder || 'general'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Uploadé le</p>
                      <p className="font-medium">{format(new Date(selectedMedia.createdAt), 'dd MMM yyyy', { locale: fr })}</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" asChild>
                  <a href={selectedMedia.url} download>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </a>
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(selectedMedia.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
