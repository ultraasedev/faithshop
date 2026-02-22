'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { StatusBadge } from '@/components/admin/common/StatusBadge'
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Send,
  RotateCcw,
  Loader2,
  ExternalLink,
  Copy
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface OrderDetailClientProps {
  order: any
}

const orderStatuses = [
  { value: 'PENDING', label: 'En attente', icon: Clock, color: 'text-yellow-600' },
  { value: 'PAID', label: 'Payée', icon: CreditCard, color: 'text-blue-600' },
  { value: 'PROCESSING', label: 'En préparation', icon: Package, color: 'text-purple-600' },
  { value: 'SHIPPED', label: 'Expédiée', icon: Truck, color: 'text-indigo-600' },
  { value: 'DELIVERED', label: 'Livrée', icon: CheckCircle, color: 'text-green-600' },
  { value: 'CANCELLED', label: 'Annulée', icon: XCircle, color: 'text-red-600' },
  { value: 'REFUNDED', label: 'Remboursée', icon: RotateCcw, color: 'text-gray-600 dark:text-gray-400' },
]

const shippingCarriers = [
  { value: 'colissimo', label: 'Colissimo', logo: '/logos/colissimo.svg', trackingUrl: 'https://www.laposte.fr/outils/suivre-vos-envois?code=' },
  { value: 'chronopost', label: 'Chronopost', logo: '/logos/chronopost.svg', trackingUrl: 'https://www.chronopost.fr/tracking-no-cms/suivi-page?liession=' },
  { value: 'ups', label: 'UPS', logo: '/logos/ups.svg', trackingUrl: 'https://www.ups.com/track?tracknum=' },
  { value: 'dhl', label: 'DHL', logo: '/logos/dhl.svg', trackingUrl: 'https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=' },
  { value: 'mondialrelay', label: 'Mondial Relay', logo: '/logos/mondial-relay.svg', trackingUrl: 'https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=' },
]

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [status, setStatus] = useState(order.status)

  // Shipping form
  const [carrier, setCarrier] = useState(order.shipping?.carrier || '')
  const [trackingNumber, setTrackingNumber] = useState(order.shipping?.trackingNumber || '')
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.shipping?.estimatedDelivery
      ? format(new Date(order.shipping.estimatedDelivery), 'yyyy-MM-dd')
      : ''
  )

  // Refund form
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refundType, setRefundType] = useState<'FULL' | 'PARTIAL'>('FULL')
  const [refundAmount, setRefundAmount] = useState(order.total.toString())
  const [refundReason, setRefundReason] = useState('')
  const [refunding, setRefunding] = useState(false)

  // Admin note
  const [adminNote, setAdminNote] = useState(order.adminNote || '')
  const [savingNote, setSavingNote] = useState(false)

  // Tracking refresh
  const [refreshingTracking, setRefreshingTracking] = useState(false)

  // Label generation
  const [generatingLabel, setGeneratingLabel] = useState(false)
  const [labelWeight, setLabelWeight] = useState(order.shipping?.weightKg?.toString() || '0.5')

  // Mondial Relay
  const [deliveryMode, setDeliveryMode] = useState<'relay' | 'home'>('relay')
  const [relayPoints, setRelayPoints] = useState<any[]>([])
  const [selectedRelayPoint, setSelectedRelayPoint] = useState<string>('')
  const [searchingRelayPoints, setSearchingRelayPoints] = useState(false)

  // Confirmation dialog for delivered status
  const [deliverConfirmOpen, setDeliverConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

  const handleStatusChange = (newStatus: string) => {
    // Si c'est "Livré", demander confirmation car c'est définitif
    if (newStatus === 'DELIVERED') {
      setPendingStatus(newStatus)
      setDeliverConfirmOpen(true)
      return
    }
    updateOrderStatus(newStatus)
  }

  const confirmDelivery = () => {
    if (pendingStatus) {
      updateOrderStatus(pendingStatus)
    }
    setDeliverConfirmOpen(false)
    setPendingStatus(null)
  }

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      setStatus(newStatus)
      toast.success('Statut mis à jour')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setUpdating(false)
    }
  }

  const updateShipping = async () => {
    if (!carrier || !trackingNumber) {
      toast.error('Veuillez remplir le transporteur et le numéro de suivi')
      return
    }

    setUpdating(true)
    try {
      const carrierInfo = shippingCarriers.find(c => c.value === carrier)
      const trackingUrl = carrierInfo ? `${carrierInfo.trackingUrl}${trackingNumber}` : null

      const response = await fetch(`/api/admin/orders/${order.id}/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier,
          trackingNumber,
          trackingUrl,
          estimatedDelivery: estimatedDelivery || null
        })
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      toast.success('Informations d\'expédition mises à jour')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'expédition')
    } finally {
      setUpdating(false)
    }
  }

  const processRefund = async () => {
    if (!refundReason.trim()) {
      toast.error('Veuillez indiquer une raison')
      return
    }

    setRefunding(true)
    try {
      const response = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          type: refundType,
          amount: refundType === 'PARTIAL' ? parseFloat(refundAmount) : order.total,
          reason: refundReason
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors du remboursement')
      }

      toast.success('Remboursement effectué')
      setRefundDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du remboursement')
    } finally {
      setRefunding(false)
    }
  }

  const saveAdminNote = async () => {
    setSavingNote(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote })
      })

      if (!response.ok) throw new Error('Erreur')

      toast.success('Note enregistrée')
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSavingNote(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papier')
  }

  const refreshTracking = async () => {
    if (!order.shipping?.trackingNumber) {
      toast.error('Aucun numéro de suivi à rafraîchir')
      return
    }
    setRefreshingTracking(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/track`, {
        method: 'POST'
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du rafraîchissement')
      }
      const data = await response.json()
      if (data.newEventsCount > 0) {
        toast.success(`${data.newEventsCount} nouvel(s) événement(s) ajouté(s)`)
      } else {
        toast.info('Aucun nouvel événement')
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du rafraîchissement du tracking')
    } finally {
      setRefreshingTracking(false)
    }
  }

  const generateShippingLabel = async () => {
    if (!carrier) {
      toast.error('Veuillez sélectionner un transporteur')
      return
    }
    const w = parseFloat(labelWeight)
    if (!w || w <= 0) {
      toast.error('Veuillez saisir un poids valide')
      return
    }
    setGeneratingLabel(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/generate-label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: carrier.toLowerCase(),
          weight: w,
          ...(carrier.toLowerCase() === 'mondialrelay' && {
            deliveryMode,
            relayPointId: deliveryMode === 'relay' ? selectedRelayPoint : undefined
          })
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la génération')
      }
      const data = await response.json()
      toast.success(`Étiquette générée ! N° suivi: ${data.trackingNumber}`)
      setTrackingNumber(data.trackingNumber)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la génération de l\'étiquette')
    } finally {
      setGeneratingLabel(false)
    }
  }

  const searchRelayPointsHandler = async () => {
    const zipCode = order.shippingZip
    if (!zipCode) {
      toast.error('Pas de code postal sur la commande')
      return
    }
    setSearchingRelayPoints(true)
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/relay-points?zipCode=${zipCode}&country=${order.shippingCountry || 'FR'}`
      )
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur de recherche')
      }
      const data = await response.json()
      setRelayPoints(data.relayPoints || [])
      if (data.relayPoints?.length === 0) {
        toast.info('Aucun point relais trouvé')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la recherche')
    } finally {
      setSearchingRelayPoints(false)
    }
  }

  const totalRefunded = order.refunds.reduce((sum: number, r: any) => sum + r.amount, 0)
  const canRefund = order.paymentStatus === 'COMPLETED' && totalRefunded < order.total

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {order.orderNumber}
              </h1>
              <StatusBadge status={status} type="order" />
            </div>
            <p className="text-gray-500">
              {format(new Date(order.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/orders/${order.id}/invoice`} target="_blank">
              <FileText className="h-4 w-4 mr-2" />
              Facture
            </Link>
          </Button>
          {canRefund && (
            <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rembourser
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rembourser la commande</DialogTitle>
                  <DialogDescription>
                    Le remboursement sera effectué via Stripe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type de remboursement</Label>
                    <Select value={refundType} onValueChange={(v: 'FULL' | 'PARTIAL') => setRefundType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL">Remboursement total ({order.total.toLocaleString('fr-FR')} €)</SelectItem>
                        <SelectItem value="PARTIAL">Remboursement partiel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {refundType === 'PARTIAL' && (
                    <div className="space-y-2">
                      <Label>Montant</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          max={order.total - totalRefunded}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Maximum: {(order.total - totalRefunded).toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Raison du remboursement</Label>
                    <Textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Ex: Produit défectueux, erreur de commande..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={processRefund} disabled={refunding}>
                    {refunding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      'Confirmer le remboursement'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y dark:divide-gray-800">
                {order.items.map((item: any) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                        {item.productImage || item.product?.images?.[0] ? (
                          <Image
                            src={item.productImage || item.product.images[0]}
                            alt={item.productName}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/products/${item.productId}`}
                          className="font-medium text-gray-900 dark:text-white hover:underline"
                        >
                          {item.productName}
                        </Link>
                        {item.variantTitle && (
                          <p className="text-sm text-gray-500">{item.variantTitle}</p>
                        )}
                        {item.variantSku && (
                          <p className="text-xs text-gray-400">SKU: {item.variantSku}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.price.toLocaleString('fr-FR')} €</p>
                        <p className="text-sm text-gray-500">× {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t dark:border-gray-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span>{order.subtotal.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span>{order.shippingCost.toLocaleString('fr-FR')} €</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction {order.discountCode?.code && `(${order.discountCode.code})`}</span>
                    <span>-{order.discountAmount.toLocaleString('fr-FR')} €</span>
                  </div>
                )}
                {totalRefunded > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Remboursé</span>
                    <span>-{totalRefunded.toLocaleString('fr-FR')} €</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-800">
                  <span>Total</span>
                  <span>{(order.total - totalRefunded).toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de la commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {orderStatuses.map((s) => {
                  const Icon = s.icon
                  const isActive = status === s.value
                  return (
                    <Button
                      key={s.value}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange(s.value)}
                      disabled={updating || isActive}
                      className={cn(
                        !isActive && s.color
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {s.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expédition</CardTitle>
              {carrier && shippingCarriers.find(c => c.value === carrier)?.logo && (
                <Image
                  src={shippingCarriers.find(c => c.value === carrier)!.logo!}
                  alt={shippingCarriers.find(c => c.value === carrier)!.label}
                  width={100}
                  height={30}
                  className="object-contain"
                />
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Transporteur</Label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingCarriers.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <span className="flex items-center gap-2">
                            {c.logo ? (
                              <Image src={c.logo} alt={c.label} width={60} height={20} className="object-contain" />
                            ) : (
                              <Truck className="h-4 w-4 text-muted-foreground" />
                            )}
                            {c.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Numéro de suivi</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ex: 1Z999AA10123456784"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date de livraison estimée</Label>
                <Input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updateShipping} disabled={updating}>
                  {updating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Mettre à jour et notifier le client
                </Button>
                {order.shipping?.trackingNumber && ['colissimo', 'chronopost'].includes(carrier.toLowerCase()) && (
                  <Button
                    variant="outline"
                    onClick={refreshTracking}
                    disabled={refreshingTracking}
                  >
                    {refreshingTracking ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Rafraîchir le suivi
                  </Button>
                )}
              </div>

              {/* Label Generation */}
              {carrier && ['colissimo', 'mondialrelay'].includes(carrier.toLowerCase()) && !order.shipping?.labelUrl && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
                  <h4 className="font-medium text-sm">Générer une étiquette {carrier === 'colissimo' ? 'Colissimo' : 'Mondial Relay'}</h4>

                  {/* Mondial Relay: delivery mode + relay points */}
                  {carrier.toLowerCase() === 'mondialrelay' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          variant={deliveryMode === 'relay' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDeliveryMode('relay')}
                        >
                          Point Relais
                        </Button>
                        <Button
                          variant={deliveryMode === 'home' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDeliveryMode('home')}
                        >
                          Domicile
                        </Button>
                      </div>

                      {deliveryMode === 'relay' && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={searchRelayPointsHandler}
                              disabled={searchingRelayPoints}
                            >
                              {searchingRelayPoints ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <MapPin className="h-4 w-4 mr-1" />
                              )}
                              Chercher points relais ({order.shippingZip})
                            </Button>
                          </div>
                          {relayPoints.length > 0 && (
                            <Select value={selectedRelayPoint} onValueChange={setSelectedRelayPoint}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir un point relais" />
                              </SelectTrigger>
                              <SelectContent>
                                {relayPoints.map((rp: any) => (
                                  <SelectItem key={rp.id} value={rp.id}>
                                    {rp.name} - {rp.address}, {rp.zipCode} {rp.city}
                                    {rp.distance ? ` (${rp.distance}m)` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-end gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Poids (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="30"
                        value={labelWeight}
                        onChange={(e) => setLabelWeight(e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <Button
                      onClick={generateShippingLabel}
                      disabled={generatingLabel || (carrier.toLowerCase() === 'mondialrelay' && deliveryMode === 'relay' && !selectedRelayPoint)}
                      variant="secondary"
                    >
                      {generatingLabel ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Générer l'étiquette
                    </Button>
                  </div>
                </div>
              )}

              {/* Label download + Tracking link */}
              <div className="flex flex-wrap gap-4">
                {order.shipping?.labelUrl && (
                  <a
                    href={order.shipping.labelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-green-600 hover:underline font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    Télécharger l'étiquette PDF
                  </a>
                )}
                {order.shipping?.trackingUrl && (
                  <a
                    href={order.shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir le suivi sur le site du transporteur
                  </a>
                )}
              </div>

              {/* Shipping Timeline */}
              {order.shipping?.events?.length > 0 && (
                <div className="mt-6 pt-6 border-t dark:border-gray-800">
                  <h4 className="font-medium mb-4">Historique</h4>
                  <div className="space-y-3">
                    {order.shipping.events.map((event: any, index: number) => (
                      <div key={event.id} className="flex gap-3">
                        <div className={cn(
                          "h-2 w-2 mt-2 rounded-full",
                          index === 0 ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <div>
                          <p className="font-medium">{event.description}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(event.timestamp), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                            {event.location && ` • ${event.location}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refunds History */}
          {order.refunds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des remboursements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.refunds.map((refund: any) => (
                    <div
                      key={refund.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={refund.status} type="payment" size="sm" />
                          <span className="font-medium">{refund.amount.toLocaleString('fr-FR')} €</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{refund.reason}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(refund.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                          {refund.adminUser && ` par ${refund.adminUser.name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.user?.name || order.guestName || 'Client anonyme'}
                </p>
                {(order.user?.email || order.guestEmail) && (
                  <button
                    onClick={() => copyToClipboard(order.user?.email || order.guestEmail)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <Mail className="h-4 w-4" />
                    {order.user?.email || order.guestEmail}
                    <Copy className="h-3 w-3" />
                  </button>
                )}
                {(order.user?.phone || order.guestPhone || order.shippingPhone) && (
                  <p className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" />
                    {order.user?.phone || order.guestPhone || order.shippingPhone}
                  </p>
                )}
              </div>
              {order.user && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/admin/customers/${order.user.id}`}>
                    Voir le profil client
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">{order.shippingAddress}</p>
              <p className="text-gray-500">{order.shippingZip} {order.shippingCity}</p>
              <p className="text-gray-500">{order.shippingCountry}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 -ml-2"
                onClick={() => copyToClipboard(`${order.shippingAddress}, ${order.shippingZip} ${order.shippingCity}, ${order.shippingCountry}`)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier l'adresse
              </Button>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Méthode</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <StatusBadge status={order.paymentStatus} type="payment" size="sm" />
              </div>
              {order.stripePaymentIntentId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2"
                  onClick={() => window.open(`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir sur Stripe
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Admin Note */}
          <Card>
            <CardHeader>
              <CardTitle>Note interne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ajouter une note..."
                rows={3}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={saveAdminNote}
                disabled={savingNote}
                className="w-full"
              >
                {savingNote ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Enregistrer la note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Delivered Status */}
      <Dialog open={deliverConfirmOpen} onOpenChange={setDeliverConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Confirmer la livraison
            </DialogTitle>
            <DialogDescription>
              Cette action est définitive. Une fois marquée comme livrée, la commande ne pourra plus être modifiée.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Attention :</strong> Marquer cette commande comme livrée enverra automatiquement une notification au client et figera le statut de la commande.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliverConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={confirmDelivery}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirmation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer la livraison
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
