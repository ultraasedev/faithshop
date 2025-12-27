'use client'

import { cn } from '@/lib/utils'

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'IN_TRANSIT' | 'RECEIVED' | 'REFUNDED' | 'COMPLETED'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

type StatusType = OrderStatus | PaymentStatus | ProductStatus | StockStatus | ReturnStatus | TicketStatus | PageStatus | string

interface StatusBadgeProps {
  status: StatusType
  type?: 'order' | 'payment' | 'product' | 'stock' | 'return' | 'ticket' | 'page' | 'custom'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  PAID: {
    label: 'Payée',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  },
  PROCESSING: {
    label: 'En préparation',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  },
  SHIPPED: {
    label: 'Expédiée',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
  },
  DELIVERED: {
    label: 'Livrée',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  CANCELLED: {
    label: 'Annulée',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  },
  REFUNDED: {
    label: 'Remboursée',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  COMPLETED: {
    label: 'Complété',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  FAILED: {
    label: 'Échoué',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  },
  REFUNDED: {
    label: 'Remboursé',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
  PARTIALLY_REFUNDED: {
    label: 'Partiellement remboursé',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  },
}

const productStatusConfig: Record<ProductStatus, { label: string; className: string }> = {
  active: {
    label: 'Actif',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  inactive: {
    label: 'Inactif',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
  draft: {
    label: 'Brouillon',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  archived: {
    label: 'Archivé',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  },
}

const stockStatusConfig: Record<StockStatus, { label: string; className: string }> = {
  in_stock: {
    label: 'En stock',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  low_stock: {
    label: 'Stock bas',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  out_of_stock: {
    label: 'Rupture',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  },
}

const returnStatusConfig: Record<ReturnStatus, { label: string; className: string }> = {
  REQUESTED: {
    label: 'Demandé',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  APPROVED: {
    label: 'Approuvé',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  },
  REJECTED: {
    label: 'Refusé',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  },
  IN_TRANSIT: {
    label: 'En transit',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
  },
  RECEIVED: {
    label: 'Reçu',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  },
  REFUNDED: {
    label: 'Remboursé',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  COMPLETED: {
    label: 'Terminé',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
}

const ticketStatusConfig: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: {
    label: 'Ouvert',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  },
  IN_PROGRESS: {
    label: 'En cours',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  },
  WAITING_CUSTOMER: {
    label: 'En attente client',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  RESOLVED: {
    label: 'Résolu',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  CLOSED: {
    label: 'Fermé',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
}

const pageStatusConfig: Record<PageStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Brouillon',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  PUBLISHED: {
    label: 'Publiée',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  ARCHIVED: {
    label: 'Archivée',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export function StatusBadge({ status, type = 'custom', className, size = 'md' }: StatusBadgeProps) {
  let config: { label: string; className: string } | undefined

  switch (type) {
    case 'order':
      config = orderStatusConfig[status as OrderStatus]
      break
    case 'payment':
      config = paymentStatusConfig[status as PaymentStatus]
      break
    case 'product':
      config = productStatusConfig[status as ProductStatus]
      break
    case 'stock':
      config = stockStatusConfig[status as StockStatus]
      break
    case 'return':
      config = returnStatusConfig[status as ReturnStatus]
      break
    case 'ticket':
      config = ticketStatusConfig[status as TicketStatus]
      break
    case 'page':
      config = pageStatusConfig[status as PageStatus]
      break
    default:
      config = {
        label: status,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        sizeClasses[size],
        config?.className,
        className
      )}
    >
      {config?.label || status}
    </span>
  )
}
