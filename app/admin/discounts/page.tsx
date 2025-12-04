'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Tag,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Trash2,
  Copy,
  Check
} from 'lucide-react'
import {
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode
} from '@/app/actions/admin/discounts'

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'

interface DiscountCode {
  id: string
  code: string
  description: string | null
  type: DiscountType
  value: number
  minPurchase: number | null
  maxDiscount: number | null
  usageLimit: number | null
  currentUsage: number
  startsAt: Date
  expiresAt: Date | null
  isActive: boolean
}

const typeConfig: Record<DiscountType, { label: string; icon: React.ElementType }> = {
  PERCENTAGE: { label: 'Pourcentage', icon: Percent },
  FIXED_AMOUNT: { label: 'Montant fixe', icon: DollarSign },
  FREE_SHIPPING: { label: 'Livraison gratuite', icon: Truck },
}

export default function DiscountsPage() {
  const [showModal, setShowModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])

  // Form state
  const [newCode, setNewCode] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as DiscountType,
    value: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const result = await getDiscountCodes()
      setDiscounts(result.codes.map(c => ({
        ...c,
        value: Number(c.value),
        minPurchase: c.minPurchase ? Number(c.minPurchase) : null,
        maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null
      })) as DiscountCode[])
    } catch (error) {
      console.error('Failed to load discount codes', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCreate = async () => {
    try {
      await createDiscountCode({
        code: newCode.code,
        description: newCode.description || undefined,
        type: newCode.type,
        value: parseFloat(newCode.value),
        minPurchase: newCode.minPurchase ? parseFloat(newCode.minPurchase) : undefined,
        maxDiscount: newCode.maxDiscount ? parseFloat(newCode.maxDiscount) : undefined,
        usageLimit: newCode.usageLimit ? parseInt(newCode.usageLimit) : undefined,
        expiresAt: newCode.expiresAt ? new Date(newCode.expiresAt) : undefined
      })
      setShowModal(false)
      setNewCode({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: '',
        minPurchase: '',
        maxDiscount: '',
        usageLimit: '',
        expiresAt: ''
      })
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateDiscountCode(id, { isActive: !isActive })
      await loadData()
    } catch (error) {
      console.error('Failed to update discount code', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return
    try {
      await deleteDiscountCode(id)
      await loadData()
    } catch (error) {
      console.error('Failed to delete discount code', error)
    }
  }

  const formatValue = (discount: DiscountCode) => {
    if (discount.type === 'PERCENTAGE') return `${discount.value}%`
    if (discount.type === 'FIXED_AMOUNT') return `${discount.value}€`
    return 'Gratuit'
  }

  const isExpired = (discount: DiscountCode) => {
    if (!discount.expiresAt) return false
    return new Date(discount.expiresAt) < new Date()
  }

  const isLimitReached = (discount: DiscountCode) => {
    if (!discount.usageLimit) return false
    return discount.currentUsage >= discount.usageLimit
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Codes Promo</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Codes actifs</p>
                <p className="text-2xl font-bold">{discounts.filter(d => d.isActive && !isExpired(d)).length}</p>
              </div>
              <Tag className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisations totales</p>
                <p className="text-2xl font-bold">{discounts.reduce((acc, d) => acc + d.currentUsage, 0)}</p>
              </div>
              <Check className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Codes expirés</p>
                <p className="text-2xl font-bold">{discounts.filter(d => isExpired(d)).length}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Limites atteintes</p>
                <p className="text-2xl font-bold">{discounts.filter(d => isLimitReached(d)).length}</p>
              </div>
              <Percent className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des codes */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les codes promo</CardTitle>
        </CardHeader>
        <CardContent>
          {discounts.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun code promo créé.</p>
              <Button className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un code
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Valeur</th>
                    <th className="text-left py-3 px-4 font-medium">Min. achat</th>
                    <th className="text-left py-3 px-4 font-medium">Utilisations</th>
                    <th className="text-left py-3 px-4 font-medium">Expiration</th>
                    <th className="text-left py-3 px-4 font-medium">Statut</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => {
                    const config = typeConfig[discount.type]
                    const expired = isExpired(discount)
                    const limitReached = isLimitReached(discount)

                    return (
                      <tr key={discount.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{discount.code}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyCode(discount.code)}
                            >
                              {copiedCode === discount.code ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          {discount.description && (
                            <p className="text-xs text-muted-foreground mt-1">{discount.description}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{config.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{formatValue(discount)}</span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {discount.minPurchase ? `${discount.minPurchase}€` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {discount.currentUsage}
                            {discount.usageLimit && ` / ${discount.usageLimit}`}
                          </span>
                          {discount.usageLimit && (
                            <div className="w-full h-1 bg-muted rounded mt-1">
                              <div
                                className={`h-1 rounded ${limitReached ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min((discount.currentUsage / discount.usageLimit) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {discount.expiresAt
                            ? new Date(discount.expiresAt).toLocaleDateString('fr-FR')
                            : 'Jamais'}
                        </td>
                        <td className="py-3 px-4">
                          {expired ? (
                            <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Expiré</Badge>
                          ) : limitReached ? (
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Limite atteinte</Badge>
                          ) : discount.isActive ? (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-pointer"
                              onClick={() => handleToggleActive(discount.id, discount.isActive)}
                            >
                              Actif
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
                              onClick={() => handleToggleActive(discount.id, discount.isActive)}
                            >
                              Inactif
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(discount.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Nouveau code promo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input
                  placeholder="SUMMER2024"
                  className="mt-1"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (optionnel)</label>
                <Input
                  placeholder="Promotion été 2024"
                  className="mt-1"
                  value={newCode.description}
                  onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                    value={newCode.type}
                    onChange={(e) => setNewCode({ ...newCode, type: e.target.value as DiscountType })}
                  >
                    <option value="PERCENTAGE">Pourcentage</option>
                    <option value="FIXED_AMOUNT">Montant fixe</option>
                    <option value="FREE_SHIPPING">Livraison gratuite</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Valeur {newCode.type === 'PERCENTAGE' ? '(%)' : newCode.type === 'FIXED_AMOUNT' ? '(€)' : ''}
                  </label>
                  <Input
                    type="number"
                    placeholder={newCode.type === 'FREE_SHIPPING' ? '0' : '10'}
                    className="mt-1"
                    value={newCode.value}
                    onChange={(e) => setNewCode({ ...newCode, value: e.target.value })}
                    disabled={newCode.type === 'FREE_SHIPPING'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Achat minimum (€)</label>
                  <Input
                    type="number"
                    placeholder="50"
                    className="mt-1"
                    value={newCode.minPurchase}
                    onChange={(e) => setNewCode({ ...newCode, minPurchase: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Réduction max (€)</label>
                  <Input
                    type="number"
                    placeholder="100"
                    className="mt-1"
                    value={newCode.maxDiscount}
                    onChange={(e) => setNewCode({ ...newCode, maxDiscount: e.target.value })}
                    disabled={newCode.type !== 'PERCENTAGE'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Limite d'utilisations</label>
                  <Input
                    type="number"
                    placeholder="100"
                    className="mt-1"
                    value={newCode.usageLimit}
                    onChange={(e) => setNewCode({ ...newCode, usageLimit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date d'expiration</label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={newCode.expiresAt}
                    onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate}>
                  Créer le code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
