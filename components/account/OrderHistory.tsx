'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Package,
  Truck,
  CheckCircle,
  Eye,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  Euro
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'confirmed' | 'production' | 'shipped' | 'delivered'
  total: number
  items: {
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }[]
  trackingNumber?: string
  estimatedDelivery?: string
}

interface OrderHistoryProps {
  userId?: string
}

export default function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchOrders()
    }
  }, [userId])

  const fetchOrders = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/account/orders?userId=${userId}`)
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
      // Données de démonstration pour le développement
      setOrders([
        {
          id: '1',
          orderNumber: 'FS-2024-001',
          date: '2024-12-15',
          status: 'shipped',
          total: 89.99,
          trackingNumber: 'FR123456789',
          estimatedDelivery: '2024-12-23',
          items: [
            {
              id: '1',
              name: 'T-shirt Faith "Blessed" - Blanc',
              quantity: 1,
              price: 29.99,
              image: '/products/tshirt-blessed-white.jpg'
            },
            {
              id: '2',
              name: 'Hoodie Faith Premium - Noir',
              quantity: 1,
              price: 59.99,
              image: '/products/hoodie-premium-black.jpg'
            }
          ]
        },
        {
          id: '2',
          orderNumber: 'FS-2024-002',
          date: '2024-12-10',
          status: 'delivered',
          total: 45.99,
          items: [
            {
              id: '3',
              name: 'T-shirt Faith "Grace" - Rose',
              quantity: 1,
              price: 29.99,
              image: '/products/tshirt-grace-pink.jpg'
            }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', progress: 20 },
      confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', progress: 40 },
      production: { label: 'Production', color: 'bg-purple-100 text-purple-800', progress: 60 },
      shipped: { label: 'Expédiée', color: 'bg-green-100 text-green-800', progress: 80 },
      delivered: { label: 'Livrée', color: 'bg-emerald-100 text-emerald-800', progress: 100 }
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Package,
      confirmed: CheckCircle,
      production: Package,
      shipped: Truck,
      delivered: CheckCircle
    }
    return icons[status as keyof typeof icons] || Package
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg mb-2">Aucune commande pour le moment</p>
        <p className="text-sm mb-6">Découvrez nos collections et passez votre première commande !</p>
        <Button asChild>
          <Link href="/shop">Découvrir la boutique</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const statusConfig = getStatusConfig(order.status)
        const StatusIcon = getStatusIcon(order.status)

        return (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-6">
              {/* En-tête de la commande */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      {order.total.toFixed(2)}€
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Facture
                  </Button>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{statusConfig.progress}%</span>
                </div>
                <Progress value={statusConfig.progress} className="h-2" />
              </div>

              {/* Informations de livraison */}
              {order.trackingNumber && (
                <div className="bg-secondary/50 rounded p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Truck className="h-4 w-4" />
                        Suivi de livraison
                      </div>
                      <code className="text-xs font-mono mt-1 block">
                        {order.trackingNumber}
                      </code>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="text-right text-sm">
                        <div className="text-muted-foreground">Livraison estimée</div>
                        <div className="font-medium">
                          {new Date(order.estimatedDelivery).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Articles de la commande */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Articles ({order.items.length})
                </h4>
                <div className="grid gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded border">
                      <div className="w-12 h-12 bg-secondary rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=48&h=48&fit=crop&crop=center'
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {(item.price * item.quantity).toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                {order.status === 'delivered' && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      Laisser un avis
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Racheter
                    </Button>
                  </>
                )}
                {order.status === 'shipped' && (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`https://track.example.com/${order.trackingNumber}`} target="_blank" rel="noopener">
                      <MapPin className="h-4 w-4 mr-1" />
                      Suivre le colis
                    </a>
                  </Button>
                )}
                {['pending', 'confirmed'].includes(order.status) && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Modifier la commande
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Pagination si nécessaire */}
      {orders.length >= 10 && (
        <div className="flex justify-center">
          <Button variant="outline">
            Charger plus de commandes
          </Button>
        </div>
      )}
    </div>
  )
}