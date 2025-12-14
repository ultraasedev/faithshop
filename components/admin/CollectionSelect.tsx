'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Collection {
  id: string
  name: string
}

interface Props {
  value: string
  onValueChange: (value: string) => void
  collections: Collection[]
  onCollectionCreated?: (collection: Collection) => void
}

export default function CollectionSelect({ value, onValueChange, collections, onCollectionCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Le nom de la collection est requis')
      return
    }

    setCreating(true)

    try {
      // Générer le slug automatiquement
      const slug = newCollectionName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          slug: slug,
          description: `Collection ${newCollectionName}`
        }),
      })

      const result = await response.json()

      if (result.success) {
        const newCollection = result.collection
        toast.success('Collection créée avec succès !')

        // Ajouter à la liste locale
        if (onCollectionCreated) {
          onCollectionCreated(newCollection)
        }

        // Sélectionner automatiquement la nouvelle collection
        onValueChange(newCollection.id)

        // Fermer le dialog et réinitialiser
        setOpen(false)
        setNewCollectionName('')
      } else {
        toast.error(result.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur création collection:', error)
      toast.error('Erreur lors de la création de la collection')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="px-3">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouvelle Collection
            </DialogTitle>
            <DialogDescription>
              Créez une nouvelle collection pour organiser vos produits.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="collection-name">Nom de la collection</Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Ex: Vêtements d'hiver"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !creating) {
                    handleCreateCollection()
                  }
                }}
              />
            </div>

            {newCollectionName && (
              <div className="text-sm text-muted-foreground">
                <strong>Slug:</strong> {newCollectionName
                  .toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim()}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleCreateCollection} disabled={creating || !newCollectionName.trim()}>
              {creating ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}