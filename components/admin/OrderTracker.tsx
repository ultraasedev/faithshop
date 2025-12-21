'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Bell,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderStatus {
  id: string
  status: 'pending' | 'confirmed' | 'production' | 'shipped' | 'delivered'
  timestamp: Date
  location?: string
  description: string
}

interface Order {
  id: string
  customerName: string
  products: string[]
  totalAmount: number
  currentStatus: string
  trackingNumber?: string
  estimatedDelivery: Date
  timeline: OrderStatus[]
  isUrgent: boolean
}

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  production: { label: 'Production', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Expédiée', color: 'bg-green-100 text-green-800', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle }
}

export default function OrderTracker() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    // Mise à jour temps réel toutes les 30 secondes
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders/tracking')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
      // Données de fallback pour démonstration
      setOrders([
        {
          id: 'ORD-001',
          customerName: 'Marie Dupont',
          products: ['T-shirt Faith "Blessed"', 'Hoodie Premium'],
          totalAmount: 89.99,
          currentStatus: 'production',
          trackingNumber: 'FR123456789',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          isUrgent: true,
          timeline: [
            {
              id: '1',
              status: 'pending',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              description: 'Commande reçue'
            },
            {
              id: '2',
              status: 'confirmed',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              description: 'Paiement confirmé'
            },
            {
              id: '3',
              status: 'production',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              description: 'Impression en cours'
            }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, location?: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, location })
      })
      fetchOrders()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const getProgressPercentage = (status: string) => {
    const statusOrder = ['pending', 'confirmed', 'production', 'shipped', 'delivered']
    return ((statusOrder.indexOf(status) + 1) / statusOrder.length) * 100
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <RefreshCw className="h-8 w-8 animate-spin" />
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tracking des Commandes</h3>
          <p className="text-sm text-muted-foreground">Suivi en temps réel des commandes</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.currentStatus as keyof typeof statusConfig]?.icon || Clock
          const config = statusConfig[order.currentStatus as keyof typeof statusConfig]

          return (
            <Card key={order.id} className="relative">
              {order.isUrgent && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Urgent
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm">{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <Badge className={config.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progression</span>
                    <span>{Math.round(getProgressPercentage(order.currentStatus))}%</span>
                  </div>
                  <Progress value={getProgressPercentage(order.currentStatus)} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Produits:</span>
                    <p className="font-medium">{order.products.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Montant:</span>
                    <p className="font-medium">{order.totalAmount.toFixed(2)}€</p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Suivi:</span>
                    <code className="font-mono text-xs bg-secondary px-2 py-1 rounded">
                      {order.trackingNumber}
                    </code>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Livraison estimée: {order.estimatedDelivery.toLocaleDateString('fr-FR')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    {selectedOrder === order.id ? 'Masquer' : 'Détails'}
                  </Button>
                </div>

                {selectedOrder === order.id && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">Historique</h4>
                    <div className="space-y-2">
                      {order.timeline.map((event, index) => {
                        const EventIcon = statusConfig[event.status]?.icon || Clock
                        const isLast = index === order.timeline.length - 1

                        return (
                          <div key={event.id} className="flex items-start gap-3">
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full border-2",
                              isLast
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted border-muted-foreground"
                            )}>
                              <EventIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{event.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {event.timestamp.toLocaleString('fr-FR')}
                              </p>
                              {event.location && (
                                <p className="text-xs text-muted-foreground">{event.location}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'shipped', 'Centre de tri Paris')}
                      >
                        Marquer expédiée
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        Marquer livrée
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucune commande à suivre</p>
        </div>
      )}
    </div>
  )
}