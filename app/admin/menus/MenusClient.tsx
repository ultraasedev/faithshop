'use client'

import { useState } from 'react'
import {
  Menu, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  Link as LinkIcon, Edit2, Save, X, ExternalLink, FileText,
  Layers, Home, Settings, MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MenuItem {
  id: string
  title: string
  url: string
  order: number
  items?: MenuItem[]
}

interface MenuType {
  id: string
  handle: string
  title: string
  items: MenuItem[]
}

interface Page {
  id: string
  title: string
  slug: string
}

interface Collection {
  id: string
  name: string
  slug: string
}

interface MenusClientProps {
  menus: MenuType[]
  pages: Page[]
  collections: Collection[]
}

export function MenusClient({ menus: initialMenus, pages, collections }: MenusClientProps) {
  const [menus, setMenus] = useState<MenuType[]>(initialMenus)
  const [selectedMenu, setSelectedMenu] = useState<MenuType | null>(
    initialMenus.length > 0 ? initialMenus[0] : null
  )
  const [editedItems, setEditedItems] = useState<MenuItem[]>(
    initialMenus.length > 0 ? initialMenus[0].items : []
  )
  const [showNewMenuModal, setShowNewMenuModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [newMenu, setNewMenu] = useState({ handle: '', title: '' })
  const [newItem, setNewItem] = useState({ title: '', url: '', linkType: 'custom' })
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSelectMenu = (menu: MenuType) => {
    if (hasChanges) {
      if (!confirm('Vous avez des modifications non enregistrées. Continuer sans sauvegarder ?')) {
        return
      }
    }
    setSelectedMenu(menu)
    setEditedItems(menu.items)
    setHasChanges(false)
  }

  const handleCreateMenu = async () => {
    try {
      const res = await fetch('/api/admin/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMenu)
      })
      const data = await res.json()
      if (data.success) {
        setMenus([data.menu, ...menus])
        setSelectedMenu(data.menu)
        setEditedItems([])
        setShowNewMenuModal(false)
        setNewMenu({ handle: '', title: '' })
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating menu:', error)
      alert('Erreur lors de la création')
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Supprimer ce menu ?')) return

    try {
      const res = await fetch(`/api/admin/menus?id=${menuId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        const updated = menus.filter(m => m.id !== menuId)
        setMenus(updated)
        if (selectedMenu?.id === menuId) {
          setSelectedMenu(updated[0] || null)
          setEditedItems(updated[0]?.items || [])
        }
      }
    } catch (error) {
      console.error('Error deleting menu:', error)
    }
  }

  const handleAddItem = () => {
    let url = newItem.url
    if (newItem.linkType === 'page' && newItem.url) {
      url = `/${newItem.url}`
    } else if (newItem.linkType === 'collection' && newItem.url) {
      url = `/collections/${newItem.url}`
    } else if (newItem.linkType === 'home') {
      url = '/'
    }

    const item: MenuItem = {
      id: `temp-${Date.now()}`,
      title: newItem.title,
      url,
      order: editedItems.length,
      items: []
    }

    setEditedItems([...editedItems, item])
    setShowAddItemModal(false)
    setNewItem({ title: '', url: '', linkType: 'custom' })
    setHasChanges(true)
  }

  const handleUpdateItem = (itemId: string, updates: Partial<MenuItem>) => {
    const updateItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates }
        }
        if (item.items && item.items.length > 0) {
          return { ...item, items: updateItems(item.items) }
        }
        return item
      })
    }
    setEditedItems(updateItems(editedItems))
    setHasChanges(true)
  }

  const handleDeleteItem = (itemId: string) => {
    const deleteFromItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => item.id !== itemId)
        .map(item => ({
          ...item,
          items: item.items ? deleteFromItems(item.items) : []
        }))
    }
    setEditedItems(deleteFromItems(editedItems))
    setHasChanges(true)
  }

  const handleAddSubItem = (parentId: string) => {
    const subItem: MenuItem = {
      id: `temp-${Date.now()}`,
      title: 'Nouveau sous-menu',
      url: '#',
      order: 0,
      items: []
    }

    const addSubItem = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return { ...item, items: [...(item.items || []), subItem] }
        }
        if (item.items && item.items.length > 0) {
          return { ...item, items: addSubItem(item.items) }
        }
        return item
      })
    }

    setEditedItems(addSubItem(editedItems))
    setExpandedItems(new Set([...expandedItems, parentId]))
    setHasChanges(true)
    setEditingItem(subItem.id)
  }

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const moveInArray = (items: MenuItem[]): MenuItem[] => {
      const index = items.findIndex(item => item.id === itemId)
      if (index === -1) {
        return items.map(item => ({
          ...item,
          items: item.items ? moveInArray(item.items) : []
        }))
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= items.length) return items

      const newItems = [...items]
      const temp = newItems[index]
      newItems[index] = newItems[newIndex]
      newItems[newIndex] = temp
      return newItems.map((item, i) => ({ ...item, order: i }))
    }

    setEditedItems(moveInArray(editedItems))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!selectedMenu) return
    setSaving(true)

    try {
      const res = await fetch('/api/admin/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMenu.id,
          items: editedItems
        })
      })
      const data = await res.json()
      if (data.success) {
        // Update local state
        setMenus(menus.map(m => m.id === selectedMenu.id ? data.menu : m))
        setSelectedMenu(data.menu)
        setEditedItems(data.menu.items)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error saving menu:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasSubItems = item.items && item.items.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isEditing = editingItem === item.id

    return (
      <div key={item.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${depth > 0 ? 'ml-8 border-l-4 border-l-primary/20' : ''}`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

          {hasSubItems && (
            <button onClick={() => toggleExpand(item.id)} className="p-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          {!hasSubItems && <div className="w-6" />}

          <LinkIcon className="h-4 w-4 text-muted-foreground" />

          {isEditing ? (
            <>
              <Input
                value={item.title}
                onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                className="h-8 w-32"
              />
              <Input
                value={item.url}
                onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                className="h-8 flex-1"
                placeholder="URL"
              />
              <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                <Save className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="font-medium">{item.title}</span>
              <span className="text-sm text-muted-foreground truncate flex-1">
                {item.url}
              </span>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingItem(item.id)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              {depth === 0 && (
                <DropdownMenuItem onClick={() => handleAddSubItem(item.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter sous-menu
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => moveItem(item.id, 'up')}>
                Monter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => moveItem(item.id, 'down')}>
                Descendre
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteItem(item.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasSubItems && isExpanded && (
          <div className="mt-2 space-y-2">
            {item.items!.map(subItem => renderMenuItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Menus de navigation</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les menus de votre site
          </p>
        </div>
        <Button onClick={() => setShowNewMenuModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau menu
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Menu List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Menus
          </h3>
          {menus.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <Menu className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Aucun menu créé</p>
              </CardContent>
            </Card>
          ) : (
            menus.map(menu => (
              <Card
                key={menu.id}
                className={`cursor-pointer transition-colors ${selectedMenu?.id === menu.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                onClick={() => handleSelectMenu(menu)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{menu.title}</p>
                      <code className="text-sm text-foreground bg-muted px-1.5 py-0.5 rounded font-mono inline-block mt-1">
                        {menu.handle}
                      </code>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMenu(menu.id)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {menu.items.length} élément{menu.items.length > 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Menu Editor */}
        <div className="lg:col-span-3">
          {selectedMenu ? (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6">
                <div>
                  <CardTitle className="text-lg sm:text-xl">{selectedMenu.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Handle: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{selectedMenu.handle}</code>
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => setShowAddItemModal(true)} className="flex-1 sm:flex-none">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Ajouter un lien</span>
                    <span className="sm:hidden">Ajouter</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="flex-1 sm:flex-none"
                  >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editedItems.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <LinkIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">
                      Aucun élément dans ce menu
                    </p>
                    <Button variant="outline" onClick={() => setShowAddItemModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un lien
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editedItems.map(item => renderMenuItem(item))}
                  </div>
                )}

                {hasChanges && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                    Modifications non enregistrées
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Menu className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucun menu sélectionné</h3>
                <p className="text-muted-foreground mb-4">
                  Sélectionnez un menu à gauche ou créez-en un nouveau
                </p>
                <Button onClick={() => setShowNewMenuModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un menu
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Menu Modal */}
      <Dialog open={showNewMenuModal} onOpenChange={setShowNewMenuModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="menu-title">Nom du menu</Label>
              <Input
                id="menu-title"
                value={newMenu.title}
                onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
                placeholder="Menu principal"
              />
            </div>
            <div>
              <Label htmlFor="menu-handle">Handle (identifiant unique)</Label>
              <Input
                id="menu-handle"
                value={newMenu.handle}
                onChange={(e) => setNewMenu({ ...newMenu, handle: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="main-menu"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Utilisé pour récupérer le menu dans le code (ex: main-menu, footer-menu)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMenuModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateMenu}
              disabled={!newMenu.title || !newMenu.handle}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un lien</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type de lien</Label>
              <Select
                value={newItem.linkType}
                onValueChange={(value) => setNewItem({ ...newItem, linkType: value, url: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      URL personnalisée
                    </div>
                  </SelectItem>
                  <SelectItem value="home">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Page d'accueil
                    </div>
                  </SelectItem>
                  <SelectItem value="page">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Page du site
                    </div>
                  </SelectItem>
                  <SelectItem value="collection">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Collection
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item-title">Texte du lien</Label>
              <Input
                id="item-title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Accueil"
              />
            </div>

            {newItem.linkType === 'custom' && (
              <div>
                <Label htmlFor="item-url">URL</Label>
                <Input
                  id="item-url"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            {newItem.linkType === 'page' && (
              <div>
                <Label>Sélectionner une page</Label>
                <Select
                  value={newItem.url}
                  onValueChange={(value) => setNewItem({ ...newItem, url: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une page..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map(page => (
                      <SelectItem key={page.id} value={page.slug}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newItem.linkType === 'collection' && (
              <div>
                <Label>Sélectionner une collection</Label>
                <Select
                  value={newItem.url}
                  onValueChange={(value) => setNewItem({ ...newItem, url: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une collection..." />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map(col => (
                      <SelectItem key={col.id} value={col.slug}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={!newItem.title || (newItem.linkType === 'custom' && !newItem.url) || (newItem.linkType === 'page' && !newItem.url) || (newItem.linkType === 'collection' && !newItem.url)}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
