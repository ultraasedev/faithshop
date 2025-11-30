'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  FileText
} from 'lucide-react'
import Link from 'next/link'

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
type ShippingStatus = 'PENDING' | 'LABEL_CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED'

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PAID: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  PROCESSING: { label: 'En préparation', color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle },
  REFUNDED: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800', icon: XCircle },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Simulation de données - à remplacer par un appel API
  const order = {
    id: params.id as string,
    orderNumber: 'ORD-2024-001',
    status: 'PROCESSING' as OrderStatus,
    paymentStatus: 'COMPLETED',
    paymentMethod: 'STRIPE',
    total: 299.00,
    subtotal: 279.00,
    shippingCost: 10.00,
    discountAmount: 0,
    taxAmount: 10.00,
    createdAt: new Date().toISOString(),
    user: { name: 'Jean Dupont', email: 'jean@example.com', phone: '+33 6 12 34 56 78' },
    shippingAddress: '123 Rue de la Paix',
    shippingCity: 'Paris',
    shippingZip: '75001',
    shippingCountry: 'France',
    shippingPhone: '+33 6 12 34 56 78',
    billingAddress: '123 Rue de la Paix',
    billingCity: 'Paris',
    billingZip: '75001',
    billingCountry: 'France',
    items: [
      {
        id: '1',
        productName: 'Veste en cuir Premium',
        productImage: '/placeholder.jpg',
        quantity: 1,
        price: 249.00,
        color: 'Noir',
        size: 'M',
      },
      {
        id: '2',
        productName: 'T-shirt Basique',
        productImage: '/placeholder.jpg',
        quantity: 2,
        price: 15.00,
        color: 'Blanc',
        size: 'L',
      },
    ],
    shipping: {
      id: 's1',
      carrier: 'Colissimo',
      trackingNumber: 'FR123456789',
      trackingUrl: 'https://www.laposte.fr/outils/suivre-vos-envois?code=FR123456789',
      status: 'LABEL_CREATED' as ShippingStatus,
      labelUrl: '/api/shipping/label/1',
      events: [
        { timestamp: new Date().toISOString(), status: 'LABEL_CREATED', description: 'Étiquette créée' },
      ],
    },
    discountCode: null,
    giftCard: null,
    customerNote: 'Merci de livrer avant 18h si possible.',
    adminNote: '',
  }

  const config = statusConfig[order.status]

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setLoading(true)
    // Appel API pour mettre à jour le statut
    setTimeout(() => {
      setLoading(false)
      router.refresh()
    }, 500)
  }

  const handleGenerateLabel = async () => {
    setLoading(true)
    // Appel API pour générer l'étiquette
    setTimeout(() => {
      setLoading(false)
      window.open(order.shipping?.labelUrl, '_blank')
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Commande {order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={config.color}>
            <config.icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Produits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produits commandés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.color} / {item.size} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{order.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{order.shippingCost.toFixed(2)} €</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>-{order.discountAmount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{order.taxAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expédition */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Expédition
                </CardTitle>
                {order.shipping?.labelUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(order.shipping?.labelUrl, '_blank')}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer l'étiquette
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {order.shipping ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.shipping.carrier}</p>
                      {order.shipping.trackingNumber && (
                        <a
                          href={order.shipping.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {order.shipping.trackingNumber}
                        </a>
                      )}
                    </div>
                    <Badge variant="outline">{order.shipping.status}</Badge>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3">
                    {order.shipping.events.map((event, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Truck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-muted-foreground">Aucune expédition créée</p>
                  <Button className="mt-4" onClick={handleGenerateLabel} disabled={loading}>
                    Générer l'étiquette
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.customerNote && (
                <div>
                  <p className="text-sm font-medium mb-1">Note du client</p>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                    {order.customerNote}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1">Note interne</p>
                <textarea
                  className="w-full p-3 border rounded-md text-sm"
                  rows={3}
                  placeholder="Ajouter une note interne..."
                  defaultValue={order.adminNote}
                />
                <Button size="sm" className="mt-2">Enregistrer</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={handleGenerateLabel} disabled={loading}>
                <Printer className="h-4 w-4 mr-2" />
                Générer étiquette
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer email
              </Button>
              <div className="pt-4 border-t mt-4">
                <p className="text-sm font-medium mb-2">Changer le statut</p>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as OrderStatus)}
                  disabled={loading}
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{order.user.name}</p>
                <p className="text-sm text-muted-foreground">{order.user.email}</p>
                <p className="text-sm text-muted-foreground">{order.user.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Adresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Livraison</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress}<br />
                  {order.shippingZip} {order.shippingCity}<br />
                  {order.shippingCountry}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Facturation</p>
                <p className="text-sm text-muted-foreground">
                  {order.billingAddress}<br />
                  {order.billingZip} {order.billingCity}<br />
                  {order.billingCountry}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Méthode</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Codes promo / Cartes cadeaux */}
          {(order.discountCode || order.giftCard) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Réductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.discountCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4" />
                    <span>Code: {order.discountCode}</span>
                  </div>
                )}
                {order.giftCard && (
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4" />
                    <span>Carte: {order.giftCard}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
