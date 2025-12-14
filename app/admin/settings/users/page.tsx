'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  UserCog,
  Shield,
  Edit,
  Trash2,
  Mail,
  Key,
  Loader2
} from 'lucide-react'
import { getAdmins, createAdminUser, updateUser, deleteUser } from '@/app/actions/admin/users'
import { toast } from 'sonner'

type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

interface AdminUser {
  id: string
  name: string | null
  email: string
  role: Role
  image: string | null
  createdAt: Date
  permissions: {
    canManageProducts: boolean
    canManageOrders: boolean
    canManageUsers: boolean
    canManageSettings: boolean
    canManageDiscounts: boolean
    canManageShipping: boolean
  }
}

const roleConfig: Record<Role, { label: string; color: string }> = {
  USER: { label: 'Utilisateur', color: 'bg-gray-100 text-gray-800' },
  ADMIN: { label: 'Administrateur', color: 'bg-blue-100 text-blue-800' },
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
}

const permissionLabels: Record<string, string> = {
  canManageProducts: 'Produits',
  canManageOrders: 'Commandes',
  canManageUsers: 'Utilisateurs',
  canManageSettings: 'Paramètres',
  canManageDiscounts: 'Promotions',
  canManageShipping: 'Livraison',
}

export default function AdminUsersPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as Role,
    permissions: {
      canManageProducts: true,
      canManageOrders: true,
      canManageUsers: false,
      canManageSettings: false,
      canManageDiscounts: true,
      canManageShipping: true,
    },
  })

  useEffect(() => {
    loadAdmins()
  }, [])

  async function loadAdmins() {
    setLoading(true)
    try {
      const users = await getAdmins()
      // Map Prisma user to AdminUser interface (flatten permissions)
      const mappedUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        image: u.image,
        createdAt: u.createdAt, // Keep as Date object
        permissions: {
          canManageProducts: u.canManageProducts,
          canManageOrders: u.canManageOrders,
          canManageUsers: u.canManageUsers,
          canManageSettings: u.canManageSettings,
          canManageDiscounts: u.canManageDiscounts,
          canManageShipping: u.canManageShipping,
        }
      }))
      setAdminUsers(mappedUsers as unknown as AdminUser[])
    } catch (error) {
      console.error('Failed to load admins', error)
      toast.error('Erreur lors du chargement des administrateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name || '',
        email: user.email,
        password: '',
        role: user.role,
        permissions: user.permissions,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
        permissions: {
          canManageProducts: true,
          canManageOrders: true,
          canManageUsers: false,
          canManageSettings: false,
          canManageDiscounts: true,
          canManageShipping: true,
        },
      })
    }
    setShowModal(true)
  }

  const handlePermissionChange = (key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: value,
      },
    }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...formData.permissions
        })
        toast.success('Administrateur mis à jour')
      } else {
        if (!formData.password) {
          toast.error('Le mot de passe est requis')
          setSaving(false)
          return
        }
        await createAdminUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          permissions: formData.permissions
        })
        toast.success('Administrateur créé')
      }
      setShowModal(false)
      await loadAdmins()
    } catch (error: any) {
      console.error('Failed to save admin', error)
      toast.error(error.message || 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) return
    try {
      await deleteUser(id)
      toast.success('Administrateur supprimé')
      await loadAdmins()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Utilisateurs Admin</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel administrateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold">
                  {adminUsers.filter(u => u.role === 'SUPER_ADMIN').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administrateurs</p>
                <p className="text-2xl font-bold">
                  {adminUsers.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
              <UserCog className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{adminUsers.length}</p>
              </div>
              <UserCog className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des admins */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les administrateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.map((user) => {
              const config = roleConfig[user.role]
              const activePermissions = Object.entries(user.permissions)
                .filter(([, value]) => value)
                .map(([key]) => permissionLabels[key])

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-lg text-primary">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name || 'Sans nom'}</p>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 mx-8 hidden md:block">
                    <p className="text-xs text-muted-foreground mb-1">Permissions</p>
                    <div className="flex gap-1 flex-wrap">
                      {activePermissions.length > 0 ? (
                        activePermissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Aucune permission</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenModal(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.role !== 'SUPER_ADMIN' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingUser ? 'Modifier l\'administrateur' : 'Nouvel administrateur'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jean Dupont"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean@faith-shop.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                  disabled={editingUser?.role === 'SUPER_ADMIN'}
                >
                  <option value="ADMIN">Administrateur</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={formData.permissions[key as keyof typeof formData.permissions]}
                        onChange={(e) => handlePermissionChange(key, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        disabled={formData.role === 'SUPER_ADMIN'}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
                {formData.role === 'SUPER_ADMIN' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Les Super Admins ont automatiquement toutes les permissions.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingUser ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
