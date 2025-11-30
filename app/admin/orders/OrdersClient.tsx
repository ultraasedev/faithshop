'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Printer,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { getOrders, getOrderStats } from '@/app/actions/admin/orders'

// Types
type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

interface OrderItem {
  quantity: number
  productName: string
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  createdAt: Date
  user?: { name: string | null; email: string } | null
  guestName?: string | null
  guestEmail?: string | null
  items: OrderItem[]
  shipping?: { carrier: string; trackingNumber?: string | null } | null
}

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  totalRevenue: number
  thisMonthRevenue: number
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PAID: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  PROCESSING: { label: 'En préparation', color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle },
  REFUNDED: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800', icon: XCircle },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getOrders({
        page,
        limit: 20,
        status: filter !== 'ALL' ? filter : undefined,
        search: search || undefined,
      })

      // Transform data to match our interface
      const transformedOrders: Order[] = result.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status as OrderStatus,
        total: order.total,
        createdAt: order.createdAt,
        user: order.user,
        guestName: order.guestName,
        guestEmail: order.guestEmail,
        items: order.items.map((item) => ({
          quantity: item.quantity,
          productName: item.productName,
        })),
        shipping: order.shipping ? {
          carrier: order.shipping.carrier,
          trackingNumber: order.shipping.trackingNumber,
        } : null,
      }))

      setOrders(transformedOrders)
      setTotalPages(result.pagination.totalPages || 1)
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filter, search])

  const loadStats = useCallback(async () => {
    try {
      const orderStats = await getOrderStats()
      setStats(orderStats)
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { loadOrders(); loadStats(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { status: 'PENDING' as const, count: stats?.pendingOrders || 0 },
          { status: 'PROCESSING' as const, count: stats?.processingOrders || 0 },
          { status: 'SHIPPED' as const, count: stats?.shippedOrders || 0 },
          { status: 'DELIVERED' as const, count: orders.filter(o => o.status === 'DELIVERED').length },
        ].map(({ status, count }) => {
          const config = statusConfig[status]
          return (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setFilter(status); setPage(1); }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <config.icon className={`h-8 w-8 ${filter === status ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Card */}
      {stats && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires total</p>
                <p className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)} €</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ce mois</p>
                <p className="text-xl font-semibold text-green-600">{stats.thisMonthRevenue.toFixed(2)} €</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher par numéro, nom, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value as OrderStatus | 'ALL'); setPage(1); }}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">Tous les statuts</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Plus de filtres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {orders.length > 0
              ? `${orders.length} commande${orders.length > 1 ? 's' : ''}`
              : 'Aucune commande'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune commande trouvée</p>
              <p className="text-sm mt-2">Les commandes apparaîtront ici une fois que des clients auront passé commande.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Commande</th>
                      <th className="text-left py-3 px-4 font-medium">Client</th>
                      <th className="text-left py-3 px-4 font-medium">Produits</th>
                      <th className="text-left py-3 px-4 font-medium">Total</th>
                      <th className="text-left py-3 px-4 font-medium">Statut</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const config = statusConfig[order.status]
                      const customerName = order.user?.name || order.guestName || 'Invité'
                      const customerEmail = order.user?.email || order.guestEmail || ''

                      return (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-mono font-medium">{order.orderNumber}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{customerName}</p>
                              <p className="text-sm text-muted-foreground">{customerEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">
                              {order.items.reduce((acc, item) => acc + item.quantity, 0)} article(s)
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{order.total.toFixed(2)} €</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={config.color}>
                              <config.icon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
