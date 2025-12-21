'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CreditCard,
  DollarSign,
  ArrowLeft,
  Check,
  AlertTriangle,
  Gift,
  Receipt,
  Search,
  Filter
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  total: number
  guestName: string
  guestEmail: string
  status: string
  paymentStatus: string
  stripePaymentIntentId: string | null
  createdAt: string
  refunds: Refund[]
  items: OrderItem[]
}

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
}

interface Refund {
  id: string
  amount: number
  currency: string
  reason: string
  type: 'FULL' | 'PARTIAL' | 'STORE_CREDIT'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  stripeRefundId?: string
  failureReason?: string
  createdAt: string
}

interface GiftCard {
  id: string
  code: string
  amount: number
  balance: number
  recipientEmail: string
  createdAt: string
  expiresAt: string
  isActive: boolean
}

export default function RefundManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundType, setRefundType] = useState<'FULL' | 'PARTIAL' | 'STORE_CREDIT'>('PARTIAL')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showGiftCardDialog, setShowGiftCardDialog] = useState(false)

  // Nouveaux avoirs
  const [newGiftCard, setNewGiftCard] = useState({
    amount: '',
    recipientEmail: '',
    message: '',
    expiryMonths: '12'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersResponse, giftCardsResponse] = await Promise.all([
        fetch('/api/admin/orders?limit=100'),
        fetch('/api/admin/gift-cards')
      ])

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }

      if (giftCardsResponse.ok) {
        const giftCardsData = await giftCardsResponse.json()
        setGiftCards(giftCardsData || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const processRefund = async () => {
    if (!selectedOrder || !refundAmount || !refundReason) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const amount = parseFloat(refundAmount)
    if (amount <= 0 || amount > selectedOrder.total) {
      toast.error('Montant invalide')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          amount,
          reason: refundReason,
          type: refundType
        })
      })

      if (response.ok) {
        toast.success('Remboursement traité avec succès')
        setShowRefundDialog(false)
        setRefundAmount('')
        setRefundReason('')
        fetchData()
      } else {
        toast.error('Erreur lors du remboursement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du remboursement')
    } finally {
      setProcessing(false)
    }
  }

  const createGiftCard = async () => {
    if (!newGiftCard.amount || !newGiftCard.recipientEmail) {
      toast.error('Veuillez remplir les champs requis')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(newGiftCard.amount),
          recipientEmail: newGiftCard.recipientEmail,
          message: newGiftCard.message,
          expiryMonths: parseInt(newGiftCard.expiryMonths)
        })
      })

      if (response.ok) {
        toast.success('Avoir créé avec succès')
        setShowGiftCardDialog(false)
        setNewGiftCard({
          amount: '',
          recipientEmail: '',
          message: '',
          expiryMonths: '12'
        })
        fetchData()
      } else {
        toast.error('Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; color: string }> = {
      PENDING: { variant: 'outline', color: 'text-yellow-600' },
      COMPLETED: { variant: 'default', color: 'text-green-600' },
      FAILED: { variant: 'destructive', color: 'text-red-600' },
    }

    const config = variants[status] || variants.PENDING
    return (
      <Badge variant={config.variant} className={config.color}>
        {status === 'PENDING' && 'En cours'}
        {status === 'COMPLETED' && 'Terminé'}
        {status === 'FAILED' && 'Échoué'}
      </Badge>
    )
  }

  const eligibleOrders = orders.filter(order =>
    order.paymentStatus === 'COMPLETED' &&
    order.status !== 'CANCELLED' &&
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

      {/* Actions principales */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Remboursements & Avoirs</h2>
          <p className="text-muted-foreground">Gérez les remboursements clients et créez des avoirs</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showGiftCardDialog} onOpenChange={setShowGiftCardDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Créer un avoir
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remboursements en cours</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.reduce((sum, order) =>
                sum + (order.refunds?.filter(r => r.status === 'PENDING').length || 0), 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avoirs actifs</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {giftCards.filter(gc => gc.isActive && gc.balance > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale avoirs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                giftCards.reduce((sum, gc) => sum + (gc.isActive ? gc.balance : 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des commandes éligibles */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Commandes éligibles aux remboursements</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eligibleOrders.map((order) => (
              <div key={order.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">#{order.orderNumber}</h3>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.guestName} • {order.guestEmail}
                    </p>
                    <p className="text-sm">
                      Total: {formatCurrency(order.total)} •
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {order.refunds && order.refunds.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Remboursements:</span>
                        {order.refunds.map((refund) => (
                          <div key={refund.id} className="flex items-center gap-1">
                            {getStatusBadge(refund.status)}
                            <span className="text-xs">{formatCurrency(refund.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Dialog open={showRefundDialog && selectedOrder?.id === order.id}
                          onOpenChange={(open) => {
                            setShowRefundDialog(open)
                            if (open) setSelectedOrder(order)
                          }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Rembourser
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Remboursement */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Traiter un remboursement</DialogTitle>
        </DialogHeader>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="p-3 bg-secondary/30 rounded">
              <p className="font-medium">#{selectedOrder.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                Total: {formatCurrency(selectedOrder.total)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-type">Type de remboursement</Label>
              <Select value={refundType} onValueChange={(value: any) => setRefundType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PARTIAL">Remboursement partiel</SelectItem>
                  <SelectItem value="FULL">Remboursement complet</SelectItem>
                  <SelectItem value="STORE_CREDIT">Avoir boutique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {refundType !== 'FULL' && (
              <div className="space-y-2">
                <Label htmlFor="refund-amount">Montant (€)</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={selectedOrder.total}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="refund-reason">Raison du remboursement</Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Ex: Produit défectueux, retour client..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRefundDialog(false)}
                disabled={processing}
              >
                Annuler
              </Button>
              <Button onClick={processRefund} disabled={processing}>
                {processing ? 'Traitement...' : 'Traiter le remboursement'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Dialog Créer Avoir */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un avoir boutique</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gift-amount">Montant (€)</Label>
            <Input
              id="gift-amount"
              type="number"
              step="0.01"
              value={newGiftCard.amount}
              onChange={(e) => setNewGiftCard({...newGiftCard, amount: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gift-email">Email du bénéficiaire</Label>
            <Input
              id="gift-email"
              type="email"
              value={newGiftCard.recipientEmail}
              onChange={(e) => setNewGiftCard({...newGiftCard, recipientEmail: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gift-message">Message (optionnel)</Label>
            <Textarea
              id="gift-message"
              value={newGiftCard.message}
              onChange={(e) => setNewGiftCard({...newGiftCard, message: e.target.value})}
              placeholder="Message personnalisé pour le bénéficiaire"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gift-expiry">Validité</Label>
            <Select
              value={newGiftCard.expiryMonths}
              onValueChange={(value) => setNewGiftCard({...newGiftCard, expiryMonths: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 mois</SelectItem>
                <SelectItem value="12">12 mois</SelectItem>
                <SelectItem value="24">24 mois</SelectItem>
                <SelectItem value="36">36 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGiftCardDialog(false)}
              disabled={processing}
            >
              Annuler
            </Button>
            <Button onClick={createGiftCard} disabled={processing}>
              {processing ? 'Création...' : 'Créer l\'avoir'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Liste des avoirs */}
      <Card>
        <CardHeader>
          <CardTitle>Avoirs boutique actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {giftCards.filter(gc => gc.isActive).map((giftCard) => (
              <div key={giftCard.id} className="p-4 border rounded-lg flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-mono text-sm font-medium">{giftCard.code}</p>
                  <p className="text-sm text-muted-foreground">{giftCard.recipientEmail}</p>
                  <p className="text-sm">
                    Solde: {formatCurrency(giftCard.balance)} / {formatCurrency(giftCard.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expire le: {new Date(giftCard.expiresAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Badge variant={giftCard.balance > 0 ? 'default' : 'outline'}>
                  {giftCard.balance > 0 ? 'Actif' : 'Utilisé'}
                </Badge>
              </div>
            ))}

            {giftCards.filter(gc => gc.isActive).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun avoir actif
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}