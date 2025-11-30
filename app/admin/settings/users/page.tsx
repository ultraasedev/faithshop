'use client'

import { useState } from 'react'
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
  Key
} from 'lucide-react'

type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  image: string | null
  createdAt: string
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

  // Simulation de données
  const adminUsers: AdminUser[] = [
    {
      id: '1',
      name: 'Super Admin',
      email: 'superadmin@faith-shop.com',
      role: 'SUPER_ADMIN',
      image: null,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: {
        canManageProducts: true,
        canManageOrders: true,
        canManageUsers: true,
        canManageSettings: true,
        canManageDiscounts: true,
        canManageShipping: true,
      },
    },
    {
      id: '2',
      name: 'Marie Gestionnaire',
      email: 'marie@faith-shop.com',
      role: 'ADMIN',
      image: null,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: {
        canManageProducts: true,
        canManageOrders: true,
        canManageUsers: false,
        canManageSettings: false,
        canManageDiscounts: true,
        canManageShipping: true,
      },
    },
    {
      id: '3',
      name: 'Pierre Stock',
      email: 'pierre@faith-shop.com',
      role: 'ADMIN',
      image: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: {
        canManageProducts: true,
        canManageOrders: false,
        canManageUsers: false,
        canManageSettings: false,
        canManageDiscounts: false,
        canManageShipping: true,
      },
    },
  ]

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

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 mx-8">
                    <p className="text-xs text-muted-foreground mb-1">Permissions</p>
                    <div className="flex gap-1 flex-wrap">
                      {activePermissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
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
                        className="h-8 w-8 text-red-500"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
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
                  className="w-full mt-1 p-2 border rounded-md"
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
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions[key as keyof typeof formData.permissions]}
                        onChange={(e) => handlePermissionChange(key, e.target.checked)}
                        className="w-4 h-4"
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
                <Button onClick={() => setShowModal(false)}>
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
