'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Mail,
  MapPin,
  CreditCard,
  Tag,
  Gift,
  FileText,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { updateOrderStatus, addOrderNote } from '@/app/actions/admin/orders'
import { toast } from 'sonner'

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PAID: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  PROCESSING: { label: 'En préparation', color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle },
  REFUNDED: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800', icon: XCircle },
}

interface OrderDetailClientProps {
  order: any // Type depuis Prisma
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [editingNote, setEditingNote] = useState(false)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true)
    try {
      await updateOrderStatus(order.id, newStatus)
      toast.success('Statut mis à jour')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return

    try {
      await addOrderNote(order.id, noteText)
      toast.success('Note ajoutée')
      setNoteText('')
      setEditingNote(false)
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la note')
    }
  }

  const currentStatus = statusConfig[order.status as OrderStatus]
  const Icon = currentStatus?.icon || Clock

  const customerName = order.user?.name || order.guestName || 'Invité'
  const customerEmail = order.user?.email || order.guestEmail || ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux commandes
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Commande {order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={currentStatus?.color || 'bg-gray-100'}>
            <Icon className="h-3 w-3 mr-1" />
            {currentStatus?.label || order.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Contacter
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">

          {/* Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Articles commandés ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {item.color && <span>Couleur: {item.color}</span>}
                        {item.size && <span>Taille: {item.size}</span>}
                        <span>Qté: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{Number(item.price).toFixed(2)} €</p>
                      <p className="text-sm text-muted-foreground">
                        Total: {(Number(item.price) * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="border-t mt-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{Number(order.subtotal).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{Number(order.shippingCost).toFixed(2)} €</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-{Number(order.discountAmount).toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>{Number(order.total).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expédition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Expédition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Transporteur</span>
                    <span className="font-medium">{order.shipping.carrier}</span>
                  </div>
                  {order.shipping.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span>Numéro de suivi</span>
                      <span className="font-mono">{order.shipping.trackingNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Statut</span>
                    <Badge variant="outline">{order.shipping.status}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune expédition créée</p>
              )}
            </CardContent>
          </Card>

          {/* Notes admin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes internes
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingNote(!editingNote)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.adminNote && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{order.adminNote}</p>
                </div>
              )}

              {editingNote && (
                <div className="space-y-3">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Ajouter une note interne..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNote}>
                      Ajouter
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingNote(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleStatusChange('PROCESSING')}
                disabled={loading || order.status === 'PROCESSING'}
              >
                <Package className="h-4 w-4 mr-2" />
                Marquer en préparation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleStatusChange('SHIPPED')}
                disabled={loading || order.status === 'SHIPPED'}
              >
                <Truck className="h-4 w-4 mr-2" />
                Marquer comme expédiée
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleStatusChange('DELIVERED')}
                disabled={loading || order.status === 'DELIVERED'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marquer comme livrée
              </Button>
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <p>{customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p>{customerEmail}</p>
              </div>
              {order.user && (
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Badge variant="outline">Compte client</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adresse de livraison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic">
                {order.shippingAddress}
              </address>
            </CardContent>
          </Card>

          {/* Informations paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Statut</label>
                <p>
                  <Badge variant={order.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                    {order.paymentStatus === 'COMPLETED' ? 'Payé' : order.paymentStatus}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Méthode</label>
                <p>Stripe ({order.paymentMethod})</p>
              </div>
              {order.stripePaymentIntentId && (
                <div>
                  <label className="text-sm font-medium">ID Transaction</label>
                  <p className="font-mono text-sm">{order.stripePaymentIntentId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}