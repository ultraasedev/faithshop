'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Edit2,
  ExternalLink,
  Menu
} from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MenuItem {
  id: string
  label: string
  url: string
  type: 'custom' | 'page' | 'collection' | 'product'
  target: '_self' | '_blank'
  children?: MenuItem[]
  isExpanded?: boolean
  order: number
}

interface NavigationEditorProps {
  navigation: MenuItem[]
  onSave: (navigation: MenuItem[]) => void
  availablePages?: Array<{ id: string; title: string; slug: string }>
  availableCollections?: Array<{ id: string; name: string; slug: string }>
}

const SortableMenuItem = ({
  item,
  onEdit,
  onDelete,
  onToggleExpand,
  level = 0,
  availablePages,
  availableCollections
}: {
  item: MenuItem
  onEdit: (id: string, data: Partial<MenuItem>) => void
  onDelete: (id: string) => void
  onToggleExpand: (id: string) => void
  level?: number
  availablePages?: Array<{ id: string; title: string; slug: string }>
  availableCollections?: Array<{ id: string; name: string; slug: string }>
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    label: item.label,
    url: item.url,
    type: item.type,
    target: item.target
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSaveEdit = () => {
    onEdit(item.id, editForm)
    setIsEditing(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return '📄'
      case 'collection':
        return '📂'
      case 'product':
        return '🛍️'
      default:
        return '🔗'
    }
  }

  const getUrlFromType = (type: string, value: string) => {
    switch (type) {
      case 'page':
        const page = availablePages?.find(p => p.id === value)
        return page ? `/${page.slug}` : ''
      case 'collection':
        const collection = availableCollections?.find(c => c.id === value)
        return collection ? `/collections/${collection.slug}` : ''
      default:
        return value
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`mb-2 ${isDragging ? 'ring-2 ring-primary' : ''}`} style={{ marginLeft: `${level * 2}rem` }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              {item.children && item.children.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpand(item.id)}
                >
                  {item.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}

              <div className="flex items-center gap-2">
                <span className="text-lg">{getTypeIcon(item.type)}</span>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.url}</div>
                </div>
              </div>

              <Badge variant="outline" className="ml-2">
                {item.type}
              </Badge>

              {item.target === '_blank' && (
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center gap-1">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier l'élément de navigation</DialogTitle>
                    <DialogDescription>
                      Modifiez les détails de cet élément de menu.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-label">Libellé</Label>
                      <Input
                        id="edit-label"
                        value={editForm.label}
                        onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="Libellé du menu"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-type">Type</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(value) => setEditForm(prev => ({
                          ...prev,
                          type: value as MenuItem['type'],
                          url: ''
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Lien personnalisé</SelectItem>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="collection">Collection</SelectItem>
                          <SelectItem value="product">Produit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editForm.type === 'custom' && (
                      <div>
                        <Label htmlFor="edit-url">URL</Label>
                        <Input
                          id="edit-url"
                          value={editForm.url}
                          onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="/exemple ou https://..."
                        />
                      </div>
                    )}

                    {editForm.type === 'page' && (
                      <div>
                        <Label htmlFor="edit-page">Page</Label>
                        <Select
                          value={editForm.url.replace('/', '')}
                          onValueChange={(value) => setEditForm(prev => ({
                            ...prev,
                            url: getUrlFromType('page', value)
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une page" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePages?.map(page => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {editForm.type === 'collection' && (
                      <div>
                        <Label htmlFor="edit-collection">Collection</Label>
                        <Select
                          value={editForm.url.replace('/collections/', '')}
                          onValueChange={(value) => setEditForm(prev => ({
                            ...prev,
                            url: getUrlFromType('collection', value)
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une collection" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCollections?.map(collection => (
                              <SelectItem key={collection.id} value={collection.id}>
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="edit-target">Cible</Label>
                      <Select
                        value={editForm.target}
                        onValueChange={(value) => setEditForm(prev => ({
                          ...prev,
                          target: value as MenuItem['target']
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_self">Même onglet</SelectItem>
                          <SelectItem value="_blank">Nouvel onglet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      Sauvegarder
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children */}
      {item.isExpanded && item.children && (
        <div className="ml-6">
          {item.children.map(child => (
            <SortableMenuItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
              level={level + 1}
              availablePages={availablePages}
              availableCollections={availableCollections}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function NavigationEditor({
  navigation,
  onSave,
  availablePages = [],
  availableCollections = []
}: NavigationEditorProps) {
  const [items, setItems] = useState<MenuItem[]>(navigation)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemForm, setNewItemForm] = useState({
    label: '',
    url: '',
    type: 'custom' as MenuItem['type'],
    target: '_self' as MenuItem['target']
  })

  const sensors = useSensors(useSensor(PointerSensor))

  const addItem = () => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: newItemForm.label,
      url: newItemForm.url,
      type: newItemForm.type,
      target: newItemForm.target,
      order: items.length,
      children: []
    }

    setItems(prev => [...prev, newItem])
    setNewItemForm({
      label: '',
      url: '',
      type: 'custom',
      target: '_self'
    })
    setIsAddingItem(false)
  }

  const editItem = (id: string, data: Partial<MenuItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...data } : item
    ))
  }

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const toggleExpand = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ))
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems(prev => {
        const oldIndex = prev.findIndex(item => item.id === active.id)
        const newIndex = prev.findIndex(item => item.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleSave = () => {
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))
    onSave(reorderedItems)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Navigation du site</h2>
          <p className="text-muted-foreground">Organisez les menus de votre site</p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un élément
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un élément de navigation</DialogTitle>
                <DialogDescription>
                  Créez un nouvel élément pour votre menu de navigation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-label">Libellé</Label>
                  <Input
                    id="new-label"
                    value={newItemForm.label}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Nom du menu"
                  />
                </div>

                <div>
                  <Label htmlFor="new-type">Type</Label>
                  <Select
                    value={newItemForm.type}
                    onValueChange={(value) => setNewItemForm(prev => ({
                      ...prev,
                      type: value as MenuItem['type'],
                      url: ''
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Lien personnalisé</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="collection">Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newItemForm.type === 'custom' && (
                  <div>
                    <Label htmlFor="new-url">URL</Label>
                    <Input
                      id="new-url"
                      value={newItemForm.url}
                      onChange={(e) => setNewItemForm(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="/exemple ou https://..."
                    />
                  </div>
                )}

                {newItemForm.type === 'page' && (
                  <div>
                    <Label htmlFor="new-page">Page</Label>
                    <Select
                      value={newItemForm.url}
                      onValueChange={(value) => {
                        const page = availablePages.find(p => p.id === value)
                        setNewItemForm(prev => ({
                          ...prev,
                          url: page ? `/${page.slug}` : ''
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une page" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePages.map(page => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newItemForm.type === 'collection' && (
                  <div>
                    <Label htmlFor="new-collection">Collection</Label>
                    <Select
                      value={newItemForm.url}
                      onValueChange={(value) => {
                        const collection = availableCollections.find(c => c.id === value)
                        setNewItemForm(prev => ({
                          ...prev,
                          url: collection ? `/collections/${collection.slug}` : ''
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCollections.map(collection => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="new-target">Cible</Label>
                  <Select
                    value={newItemForm.target}
                    onValueChange={(value) => setNewItemForm(prev => ({
                      ...prev,
                      target: value as MenuItem['target']
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Même onglet</SelectItem>
                      <SelectItem value="_blank">Nouvel onglet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={addItem}
                  disabled={!newItemForm.label || !newItemForm.url}
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave}>
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Éléments du menu ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Menu className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Aucun élément de menu</p>
              <p className="text-sm mb-4">Ajoutez votre premier élément de navigation</p>
              <Button onClick={() => setIsAddingItem(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un élément
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map(item => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      onEdit={editItem}
                      onDelete={deleteItem}
                      onToggleExpand={toggleExpand}
                      availablePages={availablePages}
                      availableCollections={availableCollections}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu de la navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/30">
            <nav className="flex flex-wrap gap-6">
              {items.map(item => (
                <a
                  key={item.id}
                  href="#"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  onClick={(e) => e.preventDefault()}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}