'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Percent,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Gift,
  DollarSign
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

interface DiscountCode {
  id: string
  code: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageLimitPerUser?: number
  currentUsage: number
  startsAt: string
  expiresAt?: string
  isActive: boolean
  firstTimeCustomer: boolean
  combinableWithOthers: boolean
}

interface DiscountStats {
  totalCodes: number
  activeCodes: number
  totalUsage: number
  totalSavings: number
}

export default function DiscountManager() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [stats, setStats] = useState<DiscountStats | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null)
  const [loading, setLoading] = useState(true)

  // Formulaire nouveau code
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as const,
    value: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    usageLimitPerUser: '',
    expiresAt: '',
    firstTimeCustomer: false,
    combinableWithOthers: false
  })

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    setLoading(true)
    try {
      const [discountsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/discount-codes'),
        fetch('/api/admin/discount-codes/stats')
      ])

      if (discountsResponse.ok) {
        const data = await discountsResponse.json()
        setDiscounts(data)
      }

      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const createDiscount = async () => {
    if (!newDiscount.code || !newDiscount.value) {
      toast.error('Code et valeur requis')
      return
    }

    try {
      const response = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: newDiscount.code.toUpperCase(),
          description: newDiscount.description,
          type: newDiscount.type,
          value: parseFloat(newDiscount.value),
          minPurchase: newDiscount.minPurchase ? parseFloat(newDiscount.minPurchase) : undefined,
          maxDiscount: newDiscount.maxDiscount ? parseFloat(newDiscount.maxDiscount) : undefined,
          usageLimit: newDiscount.usageLimit ? parseInt(newDiscount.usageLimit) : undefined,
          usageLimitPerUser: newDiscount.usageLimitPerUser ? parseInt(newDiscount.usageLimitPerUser) : undefined,
          expiresAt: newDiscount.expiresAt ? new Date(newDiscount.expiresAt) : undefined,
          firstTimeCustomer: newDiscount.firstTimeCustomer,
          combinableWithOthers: newDiscount.combinableWithOthers
        })
      })

      if (response.ok) {
        toast.success('Code promo créé avec succès')
        setShowCreateDialog(false)
        resetForm()
        fetchDiscounts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création')
    }
  }

  const toggleDiscountStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast.success(isActive ? 'Code activé' : 'Code désactivé')
        fetchDiscounts()
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const deleteDiscount = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return

    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Code promo supprimé')
        fetchDiscounts()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copié dans le presse-papiers')
  }

  const generateRandomCode = () => {
    const prefixes = ['FAITH', 'BLESSED', 'HOPE', 'GRACE', 'JOY']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = Math.random().toString(36).substr(2, 4).toUpperCase()
    const code = `${prefix}${suffix}`
    setNewDiscount({ ...newDiscount, code })
  }

  const resetForm = () => {
    setNewDiscount({
      code: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      usageLimitPerUser: '',
      expiresAt: '',
      firstTimeCustomer: false,
      combinableWithOthers: false
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'Pourcentage'
      case 'FIXED_AMOUNT': return 'Montant fixe'
      case 'FREE_SHIPPING': return 'Livraison gratuite'
      default: return type
    }
  }

  const getValueDisplay = (discount: DiscountCode) => {
    switch (discount.type) {
      case 'PERCENTAGE':
        return `${discount.value}%`
      case 'FIXED_AMOUNT':
        return `${discount.value}€`
      case 'FREE_SHIPPING':
        return 'Livraison gratuite'
      default:
        return discount.value
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Codes Promo & Réductions</h2>
          <p className="text-muted-foreground">Créez et gérez vos codes promotionnels</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer un code promo
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Codes actifs</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCodes}</div>
              <p className="text-xs text-muted-foreground">
                / {stats.totalCodes} codes total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">
                Fois utilisé
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Économies totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSavings)}</div>
              <p className="text-xs text-muted-foreground">
                Économisé par les clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux d'utilisation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCodes > 0 ? Math.round((stats.totalUsage / stats.totalCodes) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Efficacité moyenne
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des codes */}
      <Card>
        <CardHeader>
          <CardTitle>Codes promotionnels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{discount.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(discount.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {discount.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {discount.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(discount.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getValueDisplay(discount)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{discount.currentUsage}</span>
                        {discount.usageLimit && (
                          <span className="text-muted-foreground">
                            / {discount.usageLimit}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={discount.isActive}
                        onCheckedChange={(checked) => toggleDiscountStatus(discount.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {discount.expiresAt ? (
                        <div className="text-sm">
                          {new Date(discount.expiresAt) < new Date() ? (
                            <Badge variant="destructive">Expiré</Badge>
                          ) : (
                            new Date(discount.expiresAt).toLocaleDateString('fr-FR')
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Permanent</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDiscount(discount)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDiscount(discount.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {discounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun code promo créé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Création */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouveau code promo</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code promotionnel</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  placeholder="FAITH2024"
                  className="font-mono"
                />
                <Button type="button" variant="outline" onClick={generateRandomCode}>
                  Générer
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type de réduction</Label>
              <Select
                value={newDiscount.type}
                onValueChange={(value: any) => setNewDiscount({ ...newDiscount, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Montant fixe (€)</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Livraison gratuite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={newDiscount.description}
              onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
              placeholder="Code de bienvenue pour les nouveaux clients"
            />
          </div>

          {newDiscount.type !== 'FREE_SHIPPING' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  {newDiscount.type === 'PERCENTAGE' ? 'Pourcentage' : 'Montant (€)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  step={newDiscount.type === 'PERCENTAGE' ? '1' : '0.01'}
                  value={newDiscount.value}
                  onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                  placeholder={newDiscount.type === 'PERCENTAGE' ? '10' : '5.00'}
                />
              </div>
              {newDiscount.type === 'PERCENTAGE' && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscount">Réduction max (€)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    value={newDiscount.maxDiscount}
                    onChange={(e) => setNewDiscount({ ...newDiscount, maxDiscount: e.target.value })}
                    placeholder="50.00"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Achat min (€)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  step="0.01"
                  value={newDiscount.minPurchase}
                  onChange={(e) => setNewDiscount({ ...newDiscount, minPurchase: e.target.value })}
                  placeholder="50.00"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Limite d'usage total</Label>
              <Input
                id="usageLimit"
                type="number"
                value={newDiscount.usageLimit}
                onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageLimitPerUser">Limite par client</Label>
              <Input
                id="usageLimitPerUser"
                type="number"
                value={newDiscount.usageLimitPerUser}
                onChange={(e) => setNewDiscount({ ...newDiscount, usageLimitPerUser: e.target.value })}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Date d'expiration</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={newDiscount.expiresAt}
                onChange={(e) => setNewDiscount({ ...newDiscount, expiresAt: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="firstTime"
                checked={newDiscount.firstTimeCustomer}
                onCheckedChange={(checked) => setNewDiscount({ ...newDiscount, firstTimeCustomer: checked })}
              />
              <Label htmlFor="firstTime">Réservé aux nouveaux clients</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="combinable"
                checked={newDiscount.combinableWithOthers}
                onCheckedChange={(checked) => setNewDiscount({ ...newDiscount, combinableWithOthers: checked })}
              />
              <Label htmlFor="combinable">Cumulable avec d'autres codes</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={createDiscount}>
              Créer le code promo
            </Button>
          </div>
        </div>
      </DialogContent>
    </div>
  )
}