'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Gift,
  Percent,
  Euro,
  Truck,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar,
  Users,
  TrendingUp,
  Search
} from 'lucide-react'

interface DiscountCode {
  id: string
  code: string
  description: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageLimitPerUser?: number
  currentUsage: number
  expiresAt?: string
  isActive: boolean
  firstTimeCustomer: boolean
  combinableWithOthers: boolean
  createdAt: string
}

export default function AdvancedDiscountManager() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [stats, setStats] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [codesRes, statsRes] = await Promise.all([
        fetch('/api/admin/discount-codes'),
        fetch('/api/admin/discount-codes/stats')
      ])

      if (codesRes.ok) {
        const codes = await codesRes.json()
        setDiscountCodes(codes)
      }

      if (statsRes.ok) {
        const stats = await statsRes.json()
        setStats(stats)
      }
    } catch (error) {
      console.error('Erreur chargement codes promo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCodes = discountCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || code.type === typeFilter
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && code.isActive && (!code.expiresAt || new Date(code.expiresAt) > new Date())) ||
                         (statusFilter === 'expired' && code.expiresAt && new Date(code.expiresAt) <= new Date()) ||
                         (statusFilter === 'inactive' && !code.isActive)

    return matchesSearch && matchesType && matchesStatus
  })

  const handleSave = async (formData: any) => {
    try {
      const url = selectedCode ? `/api/admin/discount-codes/${selectedCode.id}` : '/api/admin/discount-codes'
      const method = selectedCode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        loadData()
        setIsEditing(false)
        setIsCreating(false)
        setSelectedCode(null)
      }
    } catch (error) {
      console.error('Erreur sauvegarde code promo:', error)
    }
  }

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        setDiscountCodes(codes =>
          codes.map(code =>
            code.id === codeId ? { ...code, isActive } : code
          )
        )
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
    }
  }

  const handleDelete = async (codeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      try {
        const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setDiscountCodes(codes => codes.filter(code => code.id !== codeId))
        }
      } catch (error) {
        console.error('Erreur suppression code promo:', error)
      }
    }
  }

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return Percent
      case 'FIXED_AMOUNT': return Euro
      case 'FREE_SHIPPING': return Truck
      default: return Gift
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'Pourcentage'
      case 'FIXED_AMOUNT': return 'Montant fixe'
      case 'FREE_SHIPPING': return 'Livraison gratuite'
      default: return type
    }
  }

  const formatValue = (code: DiscountCode) => {
    switch (code.type) {
      case 'PERCENTAGE': return `${code.value}%`
      case 'FIXED_AMOUNT': return `€${code.value}`
      case 'FREE_SHIPPING': return 'Gratuite'
      default: return code.value
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Codes promotionnels</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Créez et gérez vos campagnes de réduction
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau code promo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Gift className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCodes || 0}
            </p>
            <p className="text-xs text-gray-600 font-medium">Codes créés</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.activeCodes || 0}
            </p>
            <p className="text-xs text-gray-600 font-medium">Actifs</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalUsage || 0}
            </p>
            <p className="text-xs text-gray-600 font-medium">Utilisations</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Euro className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              €{stats.totalSavings || 0}
            </p>
            <p className="text-xs text-gray-600 font-medium">Économies clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un code..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de réduction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Montant fixe</SelectItem>
                <SelectItem value="FREE_SHIPPING">Livraison gratuite</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Discount Codes List */}
      <div className="space-y-4">
        {filteredCodes.map((code) => {
          const TypeIcon = getTypeIcon(code.type)
          const isExpired = code.expiresAt && new Date(code.expiresAt) <= new Date()
          const usagePercent = code.usageLimit ? (code.currentUsage / code.usageLimit) * 100 : 0

          return (
            <Card key={code.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {code.code}
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyCodeToClipboard(code.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {code.description || 'Aucune description'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getTypeLabel(code.type)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Valeur</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatValue(code)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Utilisations</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {code.currentUsage}{code.usageLimit ? ` / ${code.usageLimit}` : ''}
                        </p>
                        {code.usageLimit && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Expire</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {code.expiresAt
                            ? new Date(code.expiresAt).toLocaleDateString('fr-FR')
                            : 'Jamais'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Badge
                        variant={code.isActive && !isExpired ? 'default' : 'secondary'}
                        className={
                          code.isActive && !isExpired
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : ''
                        }
                      >
                        {isExpired ? 'Expiré' : code.isActive ? 'Actif' : 'Inactif'}
                      </Badge>

                      {code.firstTimeCustomer && (
                        <Badge variant="outline">Nouveau client</Badge>
                      )}

                      {code.combinableWithOthers && (
                        <Badge variant="outline">Cumulable</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Switch
                      checked={code.isActive}
                      onCheckedChange={(checked) => handleToggleActive(code.id, checked)}
                      disabled={isExpired}
                    />

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCode(code)
                          setIsEditing(true)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(code.id)}
                        disabled={code.currentUsage > 0}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCodes.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun code promo trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucun code ne correspond à vos filtres.'
                : 'Créez votre premier code promotionnel.'}
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un code promo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || isEditing) && (
        <DiscountCodeModal
          code={selectedCode}
          isOpen={isCreating || isEditing}
          onClose={() => {
            setIsCreating(false)
            setIsEditing(false)
            setSelectedCode(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function DiscountCodeModal({ code, isOpen, onClose, onSave }: {
  code?: DiscountCode | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    code: code?.code || '',
    description: code?.description || '',
    type: code?.type || 'PERCENTAGE',
    value: code?.value || 0,
    minPurchase: code?.minPurchase || '',
    maxDiscount: code?.maxDiscount || '',
    usageLimit: code?.usageLimit || '',
    usageLimitPerUser: code?.usageLimitPerUser || '',
    expiresAt: code?.expiresAt ? code.expiresAt.split('T')[0] : '',
    firstTimeCustomer: code?.firstTimeCustomer || false,
    combinableWithOthers: code?.combinableWithOthers || false
  })

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code: result })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      ...formData,
      minPurchase: formData.minPurchase ? Number(formData.minPurchase) : null,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      usageLimitPerUser: formData.usageLimitPerUser ? Number(formData.usageLimitPerUser) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
    }

    onSave(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {code ? 'Modifier le code promo' : 'Nouveau code promotionnel'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Code promotionnel</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="PROMO2024"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Générer
                  </Button>
                </div>
              </div>

              <div>
                <Label>Type de réduction</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Montant fixe</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Livraison gratuite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du code promo..."
                className="mt-1"
              />
            </div>

            {/* Value */}
            {formData.type !== 'FREE_SHIPPING' && (
              <div>
                <Label>
                  Valeur {formData.type === 'PERCENTAGE' ? '(%)' : '(€)'}
                </Label>
                <Input
                  type="number"
                  step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                  max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            )}

            {/* Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Achat minimum (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  className="mt-1"
                />
              </div>

              {formData.type === 'PERCENTAGE' && (
                <div>
                  <Label>Réduction maximum (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Limite d'utilisation totale</Label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Limite par utilisateur</Label>
                <Input
                  type="number"
                  value={formData.usageLimitPerUser}
                  onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Expiry */}
            <div>
              <Label>Date d'expiration</Label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="firstTimeCustomer"
                  checked={formData.firstTimeCustomer}
                  onCheckedChange={(checked) => setFormData({ ...formData, firstTimeCustomer: checked })}
                />
                <Label htmlFor="firstTimeCustomer">Réservé aux nouveaux clients</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="combinableWithOthers"
                  checked={formData.combinableWithOthers}
                  onCheckedChange={(checked) => setFormData({ ...formData, combinableWithOthers: checked })}
                />
                <Label htmlFor="combinableWithOthers">Cumulable avec d'autres codes</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {code ? 'Mettre à jour' : 'Créer le code promo'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}