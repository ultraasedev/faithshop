'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'

interface OrdersManagementProps {
  orders: any[]
}

export function OrdersManagement({ orders: initialOrders }: OrdersManagementProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const statusConfig = {
    PENDING: {
      label: 'En attente',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    PROCESSING: {
      label: 'Traitement',
      icon: Package,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    SHIPPED: {
      label: 'Expédiée',
      icon: Truck,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    DELIVERED: {
      label: 'Livrée',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    CANCELLED: {
      label: 'Annulée',
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
        toast.success('Statut mis à jour avec succès')

        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }))
        }
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const StatusIcon = config.icon

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <StatusIcon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Commandes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredOrders.length} commande(s) • {statusCounts.PENDING} en attente
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-200">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" className="border-gray-200">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'PENDING', label: 'En attente' },
          { key: 'PROCESSING', label: 'Traitement' },
          { key: 'SHIPPED', label: 'Expédiées' },
          { key: 'DELIVERED', label: 'Livrées' },
          { key: 'CANCELLED', label: 'Annulées' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
              statusFilter === tab.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              statusFilter === tab.key ? 'bg-gray-700' : 'bg-gray-200 dark:bg-gray-600'
            }`}>
              {statusCounts[tab.key as keyof typeof statusCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par numéro de commande, client ou email..."
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className="border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Commande #{order.orderNumber}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{order.user?.name || 'Client'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Client</p>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.user?.email || 'Email non disponible'}
                        </p>
                        {order.user?.city && (
                          <p className="text-gray-600 dark:text-gray-400">
                            {order.user.city}, {order.user.country}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Total</p>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        €{Number(order.total).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Statut</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Articles</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.items?.length || 1} article(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm min-w-32"
                  >
                    <option value="PENDING">En attente</option>
                    <option value="PROCESSING">Traitement</option>
                    <option value="SHIPPED">Expédiée</option>
                    <option value="DELIVERED">Livrée</option>
                    <option value="CANCELLED">Annulée</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucune commande ne correspond à vos critères de recherche.'
                : 'Aucune commande n\'a encore été passée.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Commande #{selectedOrder.orderNumber}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Statut de la commande</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    €{Number(selectedOrder.total).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Informations client
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{selectedOrder.user?.email}</span>
                    </div>
                    {selectedOrder.user?.name && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{selectedOrder.user.name}</span>
                      </div>
                    )}
                    {selectedOrder.user?.city && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedOrder.user.city}, {selectedOrder.user.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Actions
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer un email
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier la commande
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger facture
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Articles commandés
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.product?.name || 'Produit'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            €{(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Historique de la commande
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-400">Commande créée</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}