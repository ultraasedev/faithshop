'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  MoveUp,
  MoveDown,
} from 'lucide-react'
import { toast } from 'sonner'

interface Banner {
  id: string
  text: string
  link?: string
  backgroundColor: string
  textColor: string
  isActive: boolean
  position: 'top' | 'bottom'
  startDate?: string
  endDate?: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Banner>>({
    text: '',
    link: '',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    isActive: true,
    position: 'top',
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners')
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingId ? 'Bannière mise à jour' : 'Bannière créée')
        fetchBanners()
        resetForm()
      } else {
        toast.error('Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette bannière ?')) return

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Bannière supprimée')
        fetchBanners()
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      })

      if (response.ok) {
        toast.success(banner.isActive ? 'Bannière désactivée' : 'Bannière activée')
        fetchBanners()
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    }
  }

  const resetForm = () => {
    setFormData({
      text: '',
      link: '',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      isActive: true,
      position: 'top',
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  const startEdit = (banner: Banner) => {
    setFormData(banner)
    setEditingId(banner.id)
    setShowAddForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bannières Promotionnelles</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les bannières affichées en haut ou en bas du site
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle bannière
        </Button>
      </div>

      {/* Prévisualisation */}
      {banners.filter(b => b.isActive && b.position === 'top').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prévisualisation (haut de page)</CardTitle>
          </CardHeader>
          <CardContent>
            {banners
              .filter(b => b.isActive && b.position === 'top')
              .map((banner) => (
                <div
                  key={banner.id}
                  className="py-2 px-4 text-center text-sm font-medium"
                  style={{
                    backgroundColor: banner.backgroundColor,
                    color: banner.textColor,
                  }}
                >
                  {banner.text}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Formulaire d'ajout/édition */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingId ? 'Modifier la bannière' : 'Nouvelle bannière'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Texte de la bannière *</label>
              <Input
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="🎉 Livraison offerte dès 50€ d'achat !"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Lien (optionnel)</label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/shop?promo=true"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Couleur de fond</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="h-10 w-16 rounded border cursor-pointer"
                  />
                  <Input
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Couleur du texte</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="h-10 w-16 rounded border cursor-pointer"
                  />
                  <Input
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as 'top' | 'bottom' })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="top">Haut de page</option>
                  <option value="bottom">Bas de page</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Statut</label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date de début (optionnel)</label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date de fin (optionnel)</label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Prévisualisation en temps réel */}
            {formData.text && (
              <div>
                <label className="text-sm font-medium mb-2 block">Aperçu</label>
                <div
                  className="py-2 px-4 text-center text-sm font-medium rounded"
                  style={{
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                  }}
                >
                  {formData.text}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={!formData.text}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des bannières */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les bannières</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucune bannière créée
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une bannière
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0}>
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === banners.length - 1}>
                        <MoveDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: banner.backgroundColor }}
                    />

                    <div className="flex-1">
                      <p className="font-medium">{banner.text}</p>
                      <p className="text-sm text-muted-foreground">
                        Position: {banner.position === 'top' ? 'Haut' : 'Bas'}
                        {banner.link && ` • Lien: ${banner.link}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                      {banner.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(banner)}
                    >
                      {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
