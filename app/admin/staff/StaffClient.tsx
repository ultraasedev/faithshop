'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  MoreHorizontal,
  UserCog,
  Shield,
  Mail,
  Clock,
  Activity,
  Edit,
  Trash2,
  Key,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface StaffMember {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  image: string | null
  createdAt: Date
  lastLoginAt: Date | null
  canManageProducts: boolean
  canManageOrders: boolean
  canManageUsers: boolean
  canManageSettings: boolean
  canManageDiscounts: boolean
  canManageShipping: boolean
  _count: {
    orders: number
    processedRefunds: number
  }
}

interface ActivityLog {
  id: string
  action: string
  details: string | null
  resource: string
  resourceId: string | null
  createdAt: Date
  user: { name: string | null; email: string } | null
}

interface StaffClientProps {
  staff: StaffMember[]
  activityLogs: ActivityLog[]
  currentUserId: string
  isSuperAdmin?: boolean
}

const permissions = [
  { key: 'canManageProducts', label: 'Produits', description: 'Créer, modifier, supprimer des produits' },
  { key: 'canManageOrders', label: 'Commandes', description: 'Gérer les commandes et remboursements' },
  { key: 'canManageUsers', label: 'Clients', description: 'Voir et gérer les comptes clients' },
  { key: 'canManageSettings', label: 'Paramètres', description: 'Modifier les paramètres du site' },
  { key: 'canManageDiscounts', label: 'Promotions', description: 'Créer des codes promo et cartes cadeaux' },
  { key: 'canManageShipping', label: 'Livraison', description: 'Gérer les options de livraison' }
]

export function StaffClient({ staff, activityLogs, currentUserId, isSuperAdmin = false }: StaffClientProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<StaffMember | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
    canManageProducts: true,
    canManageOrders: true,
    canManageUsers: false,
    canManageSettings: false,
    canManageDiscounts: true,
    canManageShipping: true
  })

  // State for showing generated password
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      canManageProducts: true,
      canManageOrders: true,
      canManageUsers: false,
      canManageSettings: false,
      canManageDiscounts: true,
      canManageShipping: true
    })
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.email) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // If no password provided, API will generate one
          password: formData.password || undefined
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsCreating(false)
        resetForm()

        // Show generated password if provided
        if (data.temporaryPassword) {
          setGeneratedPassword(data.temporaryPassword)
          setShowPasswordDialog(true)
        }

        router.refresh()
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (member: StaffMember) => {
    if (!confirm(`Voulez-vous réinitialiser le mot de passe de ${member.name || member.email} ? Un nouveau mot de passe sera généré et envoyé par email.`)) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/staff/${member.id}/reset-password`, {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setGeneratedPassword(data.temporaryPassword)
        setShowPasswordDialog(true)
      } else {
        alert(data.error || 'Erreur lors de la réinitialisation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la réinitialisation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!isEditing) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/staff/${isEditing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsEditing(null)
        resetForm()
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre de l\'équipe ?')) return

    await fetch(`/api/admin/staff/${userId}`, { method: 'DELETE' })
    router.refresh()
  }

  const openEditModal = (member: StaffMember) => {
    setFormData({
      name: member.name || '',
      email: member.email,
      password: '',
      role: member.role,
      canManageProducts: member.canManageProducts,
      canManageOrders: member.canManageOrders,
      canManageUsers: member.canManageUsers,
      canManageSettings: member.canManageSettings,
      canManageDiscounts: member.canManageDiscounts,
      canManageShipping: member.canManageShipping
    })
    setIsEditing(member)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Équipe
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {staff.length} membre{staff.length > 1 ? 's' : ''} de l'équipe
          </p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          {isSuperAdmin && (
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau membre de l'équipe</DialogTitle>
              <DialogDescription>
                Créez un compte administrateur avec des permissions personnalisées
              </DialogDescription>
            </DialogHeader>

            <StaffForm
              formData={formData}
              setFormData={setFormData}
              isNew
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                {isLoading ? 'Création...' : 'Créer le compte'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <UserCog className="h-4 w-4" />
            Membres
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <Card key={member.id} className="relative group">
                <CardContent className="p-6">
                  {/* Actions dropdown - Only visible to SUPER_ADMIN */}
                  {isSuperAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(member)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(member)}>
                          <Key className="h-4 w-4 mr-2" />
                          Réinitialiser le mot de passe
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600"
                          disabled={member.id === currentUserId}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Avatar & Info */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-14 w-14 rounded-xl flex items-center justify-center text-lg font-bold text-white",
                      member.role === 'SUPER_ADMIN'
                        ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                        : "bg-gradient-to-br from-gray-700 to-gray-900"
                    )}>
                      {member.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {member.name || 'Sans nom'}
                        </h3>
                        {member.id === currentUserId && (
                          <span className="text-xs text-gray-500">(vous)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          member.role === 'SUPER_ADMIN'
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        )}>
                          <Shield className="h-3 w-3" />
                          {member.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-500 mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {permissions.map((perm) => {
                        const hasPermission = member[perm.key as keyof StaffMember]
                        if (!hasPermission) return null
                        return (
                          <span
                            key={perm.key}
                            className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          >
                            {perm.label}
                          </span>
                        )
                      })}
                      {member.role === 'SUPER_ADMIN' && (
                        <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          Tous droits
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {member.lastLoginAt
                        ? formatDistanceToNow(new Date(member.lastLoginAt), { addSuffix: true, locale: fr })
                        : 'Jamais connecté'}
                    </div>
                    <div>
                      {member._count.processedRefunds} remb.
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {staff.length === 0 && (
              <div className="col-span-full text-center py-12">
                <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun membre
                </h3>
                <p className="text-gray-500 mb-4">
                  {isSuperAdmin ? "Ajoutez votre premier membre d'équipe" : "Aucun membre de l'équipe pour le moment"}
                </p>
                {isSuperAdmin && (
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un membre
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'activité</CardTitle>
              <CardDescription>Actions récentes de l'équipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{log.user?.name || log.user?.email || 'Système'}</span>
                        {' '}
                        <span className="text-gray-500">{log.action}</span>
                      </p>
                      {log.details && (
                        <p className="text-sm text-gray-500 mt-0.5">{log.details}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(log.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}

                {activityLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune activité enregistrée
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le membre</DialogTitle>
            <DialogDescription>
              Modifiez les informations et permissions
            </DialogDescription>
          </DialogHeader>

          <StaffForm
            formData={formData}
            setFormData={setFormData}
            isNew={false}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(null)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open)
        if (!open) {
          setGeneratedPassword(null)
          setShowPassword(false)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe temporaire</DialogTitle>
            <DialogDescription>
              Ce mot de passe a été envoyé par email. Vous pouvez également le copier ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <code className="flex-1 font-mono text-lg text-center">
                {showPassword ? generatedPassword : '••••••••••••'}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (generatedPassword) {
                    navigator.clipboard.writeText(generatedPassword)
                    alert('Mot de passe copié !')
                  }
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Ce mot de passe ne sera plus affiché après la fermeture de cette fenêtre.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPasswordDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface StaffFormProps {
  formData: {
    name: string
    email: string
    password: string
    role: 'ADMIN' | 'SUPER_ADMIN'
    canManageProducts: boolean
    canManageOrders: boolean
    canManageUsers: boolean
    canManageSettings: boolean
    canManageDiscounts: boolean
    canManageShipping: boolean
  }
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>
  isNew: boolean
}

function StaffForm({ formData, setFormData, isNew }: StaffFormProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nom complet</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Jean Dupont"
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jean@exemple.com"
            disabled={!isNew}
          />
        </div>

        {isNew && (
          <div className="space-y-2">
            <Label>Mot de passe (optionnel)</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Laissez vide pour générer automatiquement"
            />
            <p className="text-xs text-gray-500">
              Si vide, un mot de passe sera généré et envoyé par email
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Rôle</Label>
          <Select
            value={formData.role}
            onValueChange={(value: 'ADMIN' | 'SUPER_ADMIN') => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Les Super Admins ont accès à toutes les fonctionnalités
          </p>
        </div>
      </div>

      {/* Permissions */}
      {formData.role === 'ADMIN' && (
        <div className="space-y-4">
          <Label>Permissions</Label>
          <div className="space-y-3">
            {permissions.map((perm) => (
              <div
                key={perm.key}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div>
                  <p className="font-medium text-sm">{perm.label}</p>
                  <p className="text-xs text-gray-500">{perm.description}</p>
                </div>
                <Switch
                  checked={formData[perm.key as keyof typeof formData] as boolean}
                  onCheckedChange={(checked) => setFormData({ ...formData, [perm.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
