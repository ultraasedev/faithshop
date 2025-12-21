'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Package,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  MoreHorizontal,
  Printer
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
    phone?: string
  }
  shippingAddress?: any
  items?: any[]
  paymentMethod?: string
  trackingNumber?: string
  notes?: string
}

interface AdvancedOrderManagerProps {
  orders: Order[]
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Clock,
    description: 'Commande reçue, en attente de traitement'
  },
  PROCESSING: {
    label: 'Traitement',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: RefreshCw,
    description: 'Commande en cours de préparation'
  },
  SHIPPED: {
    label: 'Expédiée',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: Truck,
    description: 'Commande expédiée vers le client'
  },
  DELIVERED: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
    description: 'Commande livrée avec succès'
  },
  CANCELLED: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
    description: 'Commande annulée'
  }
}

export default function AdvancedOrderManager({ orders: initialOrders }: AdvancedOrderManagerProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    let matchesDate = true
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt)
      const now = new Date()
      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= monthAgo
          break
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const handleUpdateStatus = async (orderId: string, newStatus: string, trackingNumber?: string, notes?: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber,
          notes
        })
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus, trackingNumber, notes }
            : order
        ))

        // Send notification email to customer
        if (newStatus === 'SHIPPED' && trackingNumber) {
          await fetch('/api/notifications/shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, trackingNumber })
          })
        }
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const exportOrders = () => {
    const csvContent = [
      ['Numéro', 'Client', 'Email', 'Total', 'Statut', 'Date'].join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.user?.name || '',
        order.user?.email || '',
        order.total,
        order.status,
        new Date(order.createdAt).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusCounts = () => {
    return {
      all: orders.length,
      PENDING: orders.filter(o => o.status === 'PENDING').length,
      PROCESSING: orders.filter(o => o.status === 'PROCESSING').length,
      SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
      DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter(o => o.status === 'CANCELLED').length
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des commandes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez toutes vos commandes de A à Z
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportOrders}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = status === 'all'
            ? { label: 'Total', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' }
            : statusConfig[status as keyof typeof statusConfig]

          return (
            <Card
              key={status}
              className={`border-0 shadow-sm cursor-pointer transition-all ${
                statusFilter === status ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setStatusFilter(status)}
            >
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className={`text-xs font-medium px-2 py-1 rounded-full ${config?.color}`}>
                  {config?.label}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par numéro, client ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setDateFilter('all')
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
          const StatusIcon = statusInfo.icon

          return (
            <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        #{order.orderNumber}
                      </h3>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      {order.trackingNumber && (
                        <Badge variant="outline">
                          📦 {order.trackingNumber}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Client</span>
                        </div>
                        <p className="text-gray-900 dark:text-white">{order.user?.name || 'Client'}</p>
                        <p className="text-gray-600 dark:text-gray-400">{order.user?.email}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Date</span>
                        </div>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Total</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          €{Number(order.total).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Articles</span>
                        </div>
                        <p className="text-gray-900 dark:text-white">
                          {order.items?.length || 0} article(s)
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Notes:</strong> {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Select
                      value={order.status}
                      onValueChange={(value) => {
                        if (value === 'SHIPPED') {
                          const trackingNumber = prompt('Numéro de suivi (optionnel):')
                          const notes = prompt('Notes (optionnel):')
                          handleUpdateStatus(order.id, value, trackingNumber || undefined, notes || undefined)
                        } else {
                          handleUpdateStatus(order.id, value)
                        }
                      }}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-40">
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
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
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
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Aucune commande ne correspond à vos filtres.'
                : 'Vous n\'avez pas encore de commandes.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Commande #{selectedOrder.orderNumber}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.description}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Informations client
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Nom:</strong> {selectedOrder.user?.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                    {selectedOrder.user?.phone && (
                      <p><strong>Téléphone:</strong> {selectedOrder.user.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Détails de la commande
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</p>
                    <p><strong>Total:</strong> €{Number(selectedOrder.total).toFixed(2)}</p>
                    <p><strong>Statut:</strong>
                      <Badge className={`ml-2 ${statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color}`}>
                        {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </p>
                    {selectedOrder.trackingNumber && (
                      <p><strong>Suivi:</strong> {selectedOrder.trackingNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Adresse de livraison
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Articles commandés
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold">€{Number(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" onClick={() => setSelectedOrder(null)}>
                  Fermer
                </Button>
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}