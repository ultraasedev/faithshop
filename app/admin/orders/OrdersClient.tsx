'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, Column } from '@/components/admin/common/DataTable'
import { StatusBadge, OrderStatus } from '@/components/admin/common/StatusBadge'
import {
  ShoppingCart,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  Euro,
  Eye,
  FileText,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: string
  total: number
  subtotal: number
  shippingCost: number
  discountAmount: number
  itemCount: number
  customerName: string
  customerEmail: string
  shippingCity: string
  shippingCountry: string
  hasRefund: boolean
  refundAmount: number
  createdAt: Date
}

interface OrdersClientProps {
  orders: Order[]
  stats: {
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    refunded: number
    todayOrders: number
    monthlyRevenue: number
  }
}

const statusFilters = [
  { value: 'all', label: 'Toutes les commandes', icon: ShoppingCart },
  { value: 'PENDING', label: 'En attente', icon: Clock },
  { value: 'PROCESSING', label: 'En préparation', icon: Package },
  { value: 'SHIPPED', label: 'Expédiées', icon: Truck },
  { value: 'DELIVERED', label: 'Livrées', icon: CheckCircle },
  { value: 'CANCELLED', label: 'Annulées', icon: XCircle },
  { value: 'REFUNDED', label: 'Remboursées', icon: RotateCcw },
]

export function OrdersClient({ orders, stats }: OrdersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  const [filter, setFilter] = useState<string>(initialStatus)

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter)

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Commande',
      sortable: true,
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {order.orderNumber}
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(order.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Client',
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {order.customerName}
          </p>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">
            {order.customerEmail}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      sortable: true,
      render: (order) => (
        <StatusBadge status={order.status} type="order" />
      )
    },
    {
      key: 'paymentStatus',
      header: 'Paiement',
      render: (order) => (
        <StatusBadge status={order.paymentStatus} type="payment" size="sm" />
      )
    },
    {
      key: 'items',
      header: 'Articles',
      render: (order) => (
        <span className="text-gray-600 dark:text-gray-400">
          {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
        </span>
      )
    },
    {
      key: 'location',
      header: 'Destination',
      render: (order) => (
        <span className="text-gray-600 dark:text-gray-400">
          {order.shippingCity}, {order.shippingCountry}
        </span>
      )
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (order) => (
        <div>
          <span className={cn(
            "font-medium",
            order.hasRefund ? "text-red-600 line-through" : "text-gray-900 dark:text-white"
          )}>
            {order.total.toLocaleString('fr-FR')} €
          </span>
          {order.hasRefund && (
            <p className="text-sm text-red-600">
              -{order.refundAmount.toLocaleString('fr-FR')} €
            </p>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Commandes
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {stats.todayOrders} commande{stats.todayOrders > 1 ? 's' : ''} aujourd'hui • {stats.monthlyRevenue.toLocaleString('fr-FR')} € ce mois
          </p>
        </div>
        <Button variant="outline" onClick={() => router.refresh()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {statusFilters.map((status) => {
          const count = status.value === 'all'
            ? stats.total
            : stats[status.value.toLowerCase() as keyof typeof stats] as number || 0
          const Icon = status.icon

          return (
            <Card
              key={status.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                filter === status.value && "ring-2 ring-gray-900 dark:ring-white"
              )}
              onClick={() => setFilter(status.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    "h-4 w-4",
                    filter === status.value
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400"
                  )} />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {count}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {status.label}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Actions Required */}
      {(stats.pending > 0 || stats.processing > 0) && (
        <div className="flex flex-wrap gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          {stats.pending > 0 && (
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Clock className="h-5 w-5" />
              <span className="font-medium">{stats.pending} commande{stats.pending > 1 ? 's' : ''} en attente de confirmation</span>
            </div>
          )}
          {stats.processing > 0 && (
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Package className="h-5 w-5" />
              <span className="font-medium">{stats.processing} commande{stats.processing > 1 ? 's' : ''} à expédier</span>
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            data={filteredOrders}
            columns={columns}
            keyField="id"
            searchPlaceholder="Rechercher une commande..."
            searchFields={['orderNumber', 'customerName', 'customerEmail']}
            selectable
            onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
            actions={[
              {
                label: 'Voir les détails',
                icon: <Eye className="h-4 w-4 mr-2" />,
                onClick: (order) => router.push(`/admin/orders/${order.id}`)
              },
              {
                label: 'Voir la facture',
                icon: <FileText className="h-4 w-4 mr-2" />,
                onClick: (order) => window.open(`/admin/orders/${order.id}/invoice`, '_blank')
              }
            ]}
            emptyMessage="Aucune commande trouvée"
          />
        </CardContent>
      </Card>
    </div>
  )
}
