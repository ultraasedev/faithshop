'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getMenus, upsertMenu } from '@/app/actions/admin/cms'
import { toast } from 'sonner'
import { Loader2, Plus, GripVertical, Trash2, Save } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component
function SortableItem({ id, item, onChange, onRemove }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-background border p-3 rounded-md mb-2">
      <div {...attributes} {...listeners} className="cursor-move text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1">
        <Input 
          value={item.title} 
          onChange={(e) => onChange(item.id, 'title', e.target.value)}
          placeholder="Titre du lien"
        />
        <Input 
          value={item.url} 
          onChange={(e) => onChange(item.id, 'url', e.target.value)}
          placeholder="URL (ex: /shop)"
        />
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}

export default function NavigationPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<any[]>([])
  
  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadMenu()
  }, [])

  async function loadMenu() {
    try {
      const menus = await getMenus()
      const mainMenu = menus.find((m: any) => m.handle === 'main-menu')
      
      if (mainMenu && mainMenu.items) {
        setItems(mainMenu.items.map((i: any) => ({ ...i, id: i.id || Math.random().toString() })))
      } else {
        // Default items if empty
        setItems([
          { id: '1', title: 'Nouveautés', url: '/new' },
          { id: '2', title: 'Collection', url: '/shop' },
          { id: '3', title: 'L\'Atelier', url: '/about' },
        ])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), title: '', url: '' }])
  }

  const handleUpdateItem = (id: string, field: string, value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertMenu('main-menu', 'Menu Principal', items)
      toast.success('Menu enregistré')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
          <p className="text-muted-foreground mt-2">Gérez les liens du menu principal</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Enregistrer le menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item) => (
                  <SortableItem 
                    key={item.id} 
                    id={item.id} 
                    item={item} 
                    onChange={handleUpdateItem}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button variant="outline" className="w-full mt-4 border-dashed" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un lien
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
