'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Package,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  user?: {
    name?: string
    email?: string
  }
  shippingAddress?: any
  items?: any[]
}

interface SimpleOrderManagerProps {
  orders: Order[]
}

const statusConfig = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Traitement', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle }
}

export default function SimpleOrderManager({ orders }: SimpleOrderManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Commandes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{orders.length} commandes au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par numéro de commande ou email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="PROCESSING">Traitement</SelectItem>
            <SelectItem value="SHIPPED">Expédiée</SelectItem>
            <SelectItem value="DELIVERED">Livrée</SelectItem>
            <SelectItem value="CANCELLED">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
          const StatusIcon = statusInfo.icon

          return (
            <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        #{order.orderNumber}
                      </h3>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Client</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.user?.name || 'Client'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {order.user?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Total</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          €{Number(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleUpdateStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="PROCESSING">Traitement</SelectItem>
                        <SelectItem value="SHIPPED">Expédiée</SelectItem>
                        <SelectItem value="DELIVERED">Livrée</SelectItem>
                        <SelectItem value="CANCELLED">Annulée</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucune commande ne correspond à vos filtres.'
                : 'Vous n\'avez pas encore de commandes.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Détails de la commande #{selectedOrder.orderNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Client</h4>
                  <p>{selectedOrder.user?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Total</h4>
                  <p className="text-xl font-bold">€{Number(selectedOrder.total).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setSelectedOrder(null)} className="flex-1">
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}