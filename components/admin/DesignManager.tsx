'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Palette,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star,
  TrendingUp,
  Shirt,
  Grid,
  List,
  Filter,
  Search,
  Plus,
  Settings,
  Tag,
  Layers,
  Image as ImageIcon
} from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'

interface Design {
  id: string
  name: string
  description: string
  tags: string[]
  category: 'text' | 'graphic' | 'illustration' | 'pattern' | 'photo'

  // Fichiers
  files: {
    preview: string
    original: string    // Fichier haute résolution
    print: string      // Fichier optimisé pour impression
    mockups: string[]  // Mockups sur différents produits
  }

  // Métadonnées techniques
  technical: {
    resolution: string  // ex: "300 DPI"
    dimensions: string  // ex: "3000x3000px"
    formats: string[]   // ['PNG', 'SVG', 'AI']
    colorMode: 'RGB' | 'CMYK'
    hasTransparency: boolean
    fileSize: number    // en MB
  }

  // Configuration print-on-demand
  printConfig: {
    placement: {
      front?: { x: number; y: number; width: number; height: number }
      back?: { x: number; y: number; width: number; height: number }
      sleeve?: { x: number; y: number; width: number; height: number }
    }
    printMethods: ('dtg' | 'vinyl' | 'embroidery' | 'sublimation')[]
    minResolution: number
    maxPrintSize: { width: number; height: number }
    bleedArea: number
  }

  // Variations de produits
  variations: {
    productType: string[]  // ['t-shirt', 'hoodie', 'tank-top']
    colors: string[]       // Couleurs de produits compatibles
    sizes: string[]        // Tailles disponibles
    pricing: {
      baseCost: number     // Coût de base du design
      complexityMultiplier: number  // Multiplicateur selon la complexité
    }
  }

  // Analytics
  stats: {
    views: number
    orders: number
    revenue: number
    rating: number
    lastUsed: Date
    trending: boolean
  }

  // Statuts
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived'
  isActive: boolean
  isFeatured: boolean
  isExclusive: boolean

  // Métadonnées
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

interface DesignManagerProps {
  designs: Design[]
  onSave: (design: Design) => void
  onDelete: (designId: string) => void
  onUpload: (file: File) => Promise<Design>
}

const SortableDesignCard = ({ design, onEdit, onDelete, onDuplicate }: {
  design: Design
  onEdit: (design: Design) => void
  onDelete: (designId: string) => void
  onDuplicate: (design: Design) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: design.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getStatusColor = (status: Design['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-gray-100 text-gray-600'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getCategoryIcon = (category: Design['category']) => {
    switch (category) {
      case 'text': return '💬'
      case 'graphic': return '🎨'
      case 'illustration': return '✏️'
      case 'pattern': return '🔄'
      case 'photo': return '📷'
      default: return '🎯'
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden hover:shadow-lg transition-all ${isDragging ? 'ring-2 ring-primary' : ''}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-background/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Grid className="h-3 w-3 text-muted-foreground" />
      </div>

      {/* Status badges */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {design.isFeatured && (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Star className="h-2 w-2 mr-1" />
            Vedette
          </Badge>
        )}
        {design.stats.trending && (
          <Badge className="bg-blue-100 text-blue-800">
            <TrendingUp className="h-2 w-2 mr-1" />
            Tendance
          </Badge>
        )}
      </div>

      {/* Preview image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={design.files.preview}
          alt={design.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay avec actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(design)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="secondary">
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onDuplicate(design)}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(design.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{design.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{design.description}</p>
            </div>
            <span className="text-lg ml-2">{getCategoryIcon(design.category)}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {design.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {design.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{design.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{design.stats.orders} ventes</span>
            <span>{design.stats.revenue.toFixed(0)}€</span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(design.status)}>
              {design.status}
            </Badge>
            <div className="flex items-center gap-1 text-xs">
              <span>★ {design.stats.rating.toFixed(1)}</span>
              <span>({design.stats.views} vues)</span>
            </div>
          </div>

          {/* Tech info */}
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>{design.technical.resolution}</span>
              <span>{design.technical.fileSize.toFixed(1)}MB</span>
            </div>
            <div className="flex gap-1 mt-1">
              {design.printConfig.printMethods.map(method => (
                <Badge key={method} variant="outline" className="text-xs px-1 py-0">
                  {method.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DesignManager({ designs, onSave, onDelete, onUpload }: DesignManagerProps) {
  const [currentDesigns, setCurrentDesigns] = useState<Design[]>(designs)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'popularity' | 'revenue'>('date')

  const sensors = useSensors(useSensor(PointerSensor))

  const categories = [
    { id: 'all', name: 'Toutes', icon: '🎯' },
    { id: 'text', name: 'Texte', icon: '💬' },
    { id: 'graphic', name: 'Graphique', icon: '🎨' },
    { id: 'illustration', name: 'Illustration', icon: '✏️' },
    { id: 'pattern', name: 'Motif', icon: '🔄' },
    { id: 'photo', name: 'Photo', icon: '📷' }
  ]

  const statuses = [
    { id: 'all', name: 'Tous' },
    { id: 'draft', name: 'Brouillon' },
    { id: 'pending', name: 'En attente' },
    { id: 'approved', name: 'Approuvé' },
    { id: 'rejected', name: 'Rejeté' },
    { id: 'archived', name: 'Archivé' }
  ]

  const filteredDesigns = currentDesigns
    .filter(design => {
      const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           design.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || design.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || design.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popularity':
          return b.stats.orders - a.stats.orders
        case 'revenue':
          return b.stats.revenue - a.stats.revenue
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setCurrentDesigns(prev => {
        const oldIndex = prev.findIndex(design => design.id === active.id)
        const newIndex = prev.findIndex(design => design.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleEdit = (design: Design) => {
    // Ouvrir le modal d'édition
    console.log('Edit design:', design.id)
  }

  const handleDuplicate = (design: Design) => {
    const newDesign = {
      ...design,
      id: Date.now().toString(),
      name: `${design.name} (copie)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        ...design.stats,
        views: 0,
        orders: 0,
        revenue: 0
      }
    }
    setCurrentDesigns(prev => [newDesign, ...prev])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const newDesign = await onUpload(file)
        setCurrentDesigns(prev => [newDesign, ...prev])
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
  }

  const getStatsOverview = () => {
    const totalDesigns = currentDesigns.length
    const totalRevenue = currentDesigns.reduce((sum, design) => sum + design.stats.revenue, 0)
    const totalOrders = currentDesigns.reduce((sum, design) => sum + design.stats.orders, 0)
    const approvedDesigns = currentDesigns.filter(design => design.status === 'approved').length

    return { totalDesigns, totalRevenue, totalOrders, approvedDesigns }
  }

  const stats = getStatsOverview()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestionnaire de Designs</h2>
          <p className="text-muted-foreground">
            Faith Shop - Bibliothèque de designs pour print-on-demand
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <input
              type="file"
              accept="image/*,.ai,.psd,.svg"
              onChange={handleFileUpload}
              className="hidden"
              id="design-upload"
            />
            <label htmlFor="design-upload" className="flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              Nouveau design
            </label>
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Designs Total</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDesigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedDesigns} approuvés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Designs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(0)}€</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders} commandes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Populaire</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentDesigns.filter(d => d.stats.trending).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Designs en tendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentDesigns.filter(d => d.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              À valider
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et contrôles */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Recherche */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un design..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtres */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="date">Plus récent</option>
                <option value="name">Nom A-Z</option>
                <option value="popularity">Popularité</option>
                <option value="revenue">Revenus</option>
              </select>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille de designs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredDesigns.length} design{filteredDesigns.length !== 1 ? 's' : ''}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
          <Badge variant="outline">
            Glisser-déposer pour réorganiser
          </Badge>
        </div>

        {filteredDesigns.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Palette className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun design trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Aucun design ne correspond à votre recherche."
                  : "Commencez par ajouter votre premier design."
                }
              </p>
              <Button>
                <label htmlFor="design-upload" className="flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Ajouter un design
                </label>
              </Button>
            </div>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredDesigns.map(d => d.id)} strategy={rectSortingStrategy}>
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredDesigns.map(design => (
                  <SortableDesignCard
                    key={design.id}
                    design={design}
                    onEdit={handleEdit}
                    onDelete={onDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}