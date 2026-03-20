'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, Column } from '@/components/admin/common/DataTable'
import { StatusBadge } from '@/components/admin/common/StatusBadge'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Euro,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

interface Refund {
  id: string
  amount: number
  type: string
  status: string
  reason: string | null
  stripeRefundId: string | null
  createdAt: Date
}

interface Transaction {
  id: string
  orderNumber: string
  paymentMethod: string
  paymentStatus: string
  stripePaymentIntentId: string | null
  paypalOrderId: string | null
  total: number
  subtotal: number
  shippingCost: number
  discountAmount: number
  taxAmount: number
  customerName: string
  customerEmail: string
  createdAt: Date
  updatedAt: Date
  refunds: Refund[]
  totalRefunded: number
}

interface Stats {
  totalCount: number
  totalCompleted: number
  totalFailed: number
  totalPending: number
  totalRefunded: number
  monthRevenue: number
  lastMonthRevenue: number
  totalRefundAmount: number
}

interface TransactionsClientProps {
  transactions: Transaction[]
  stats: Stats
}

const paymentStatusFilters = [
  { value: 'all', label: 'Toutes', icon: CreditCard },
  { value: 'COMPLETED', label: 'Réussies', icon: CheckCircle },
  { value: 'FAILED', label: 'Échouées', icon: XCircle },
  { value: 'PENDING', label: 'En attente', icon: Clock },
  { value: 'REFUNDED', label: 'Remboursées', icon: RotateCcw },
  { value: 'PARTIALLY_REFUNDED', label: 'Remb. partiel', icon: RotateCcw },
]

const paymentMethodLabels: Record<string, string> = {
  STRIPE: 'Carte bancaire',
  STRIPE_INSTALLMENTS: 'Paiement en 3x/4x',
  PAYPAL: 'PayPal',
}

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Réussi', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  FAILED: { label: 'Échoué', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  REFUNDED: { label: 'Remboursé', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  PARTIALLY_REFUNDED: { label: 'Remb. partiel', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
}

const AUTO_REFRESH_INTERVAL = 30_000

export function TransactionsClient({ transactions, stats }: TransactionsClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('all')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(() => {
    setIsRefreshing(true)
    router.refresh()
    setLastRefresh(new Date())
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [router])

  useEffect(() => {
    if (!isAutoRefresh) return
    const interval = setInterval(refresh, AUTO_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [isAutoRefresh, refresh])

  const filteredTransactions = filter === 'all'
    ? transactions
    : filter === 'REFUNDED'
      ? transactions.filter(t => t.paymentStatus === 'REFUNDED' || t.paymentStatus === 'PARTIALLY_REFUNDED')
      : transactions.filter(t => t.paymentStatus === filter)

  const revenueGrowth = stats.lastMonthRevenue > 0
    ? ((stats.monthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100)
    : 0

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié !')
  }

  const columns: Column<Transaction>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (tx) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {format(new Date(tx.createdAt), 'dd MMM yyyy', { locale: fr })}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(tx.createdAt), 'HH:mm', { locale: fr })}
          </p>
        </div>
      )
    },
    {
      key: 'orderNumber',
      header: 'Commande',
      sortable: true,
      render: (tx) => (
        <Link
          href={`/admin/orders/${tx.id}`}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          {tx.orderNumber}
          <ExternalLink className="h-3 w-3" />
        </Link>
      )
    },
    {
      key: 'customer',
      header: 'Client',
      render: (tx) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {tx.customerName}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[180px]">
            {tx.customerEmail}
          </p>
        </div>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Moyen',
      render: (tx) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {paymentMethodLabels[tx.paymentMethod] || tx.paymentMethod}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      header: 'Statut',
      sortable: true,
      render: (tx) => {
        const status = paymentStatusLabels[tx.paymentStatus]
        return status ? (
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', status.color)}>
            {status.label}
          </span>
        ) : (
          <StatusBadge status={tx.paymentStatus} type="payment" />
        )
      }
    },
    {
      key: 'total',
      header: 'Montant',
      sortable: true,
      render: (tx) => (
        <div>
          <span className={cn(
            "font-semibold text-sm",
            tx.paymentStatus === 'FAILED' && "text-red-500 line-through",
            tx.paymentStatus === 'COMPLETED' && "text-green-700 dark:text-green-400",
            tx.paymentStatus === 'REFUNDED' && "text-purple-600 line-through",
            tx.paymentStatus === 'PARTIALLY_REFUNDED' && "text-orange-600",
            tx.paymentStatus === 'PENDING' && "text-yellow-700 dark:text-yellow-400",
          )}>
            {tx.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </span>
          {tx.totalRefunded > 0 && (
            <p className="text-xs text-purple-600 dark:text-purple-400">
              -{tx.totalRefunded.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € remboursé
            </p>
          )}
        </div>
      )
    },
    {
      key: 'stripeId',
      header: 'Réf. Stripe',
      render: (tx) => {
        const ref = tx.stripePaymentIntentId || tx.paypalOrderId
        if (!ref) return <span className="text-gray-400 text-xs">-</span>
        return (
          <button
            onClick={(e) => { e.stopPropagation(); copyToClipboard(ref) }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-mono max-w-[120px]"
            title={ref}
          >
            <span className="truncate">{ref.slice(-12)}</span>
            <Copy className="h-3 w-3 flex-shrink-0" />
          </button>
        )
      }
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {stats.totalCount} transaction{stats.totalCount > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            MAJ {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className="gap-1 text-xs"
          >
            <RefreshCw className={cn("h-3 w-3", isAutoRefresh && "animate-spin")} />
            Auto
          </Button>
          <Button variant="outline" onClick={refresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ce mois</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.monthRevenue.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                revenueGrowth >= 0
                  ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                  : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
              )}>
                {revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(0)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('COMPLETED')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Réussies</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCompleted}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('FAILED')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Échouées</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalFailed}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('REFUNDED')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Remboursé</p>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats.totalRefundAmount.toLocaleString('fr-FR')} €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {paymentStatusFilters.map((f) => {
          const Icon = f.icon
          const isActive = filter === f.value
          const count = f.value === 'all'
            ? stats.totalCount
            : f.value === 'COMPLETED' ? stats.totalCompleted
            : f.value === 'FAILED' ? stats.totalFailed
            : f.value === 'PENDING' ? stats.totalPending
            : f.value === 'REFUNDED' ? stats.totalRefunded
            : null

          return (
            <Button
              key={f.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {f.label}
              {count !== null && (
                <span className={cn(
                  'text-xs ml-1 px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                )}>
                  {count}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            data={filteredTransactions}
            columns={columns}
            keyField="id"
            searchPlaceholder="Rechercher par n° commande, client, email, Stripe ID..."
            searchFields={['orderNumber', 'customerName', 'customerEmail', 'stripePaymentIntentId']}
            onRowClick={(tx) => router.push(`/admin/orders/${tx.id}`)}
            actions={[
              {
                label: 'Voir la commande',
                icon: <ExternalLink className="h-4 w-4 mr-2" />,
                onClick: (tx) => router.push(`/admin/orders/${tx.id}`)
              },
            ]}
            emptyMessage="Aucune transaction trouvée"
          />
        </CardContent>
      </Card>
    </div>
  )
}
