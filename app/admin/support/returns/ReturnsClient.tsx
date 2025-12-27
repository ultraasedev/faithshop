'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  RotateCcw,
  Search,
  MoreHorizontal,
  Package,
  Check,
  X,
  Truck,
  CreditCard,
  Clock,
  Filter
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ReturnRequest {
  id: string
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'RECEIVED' | 'REFUNDED' | 'CANCELLED'
  reason: string
  description: string | null
  returnTrackingNumber: string | null
  returnCarrier: string | null
  adminNotes: string | null
  createdAt: Date
  updatedAt: Date
  handledAt: Date | null
  order: {
    id: string
    orderNumber: string
    user: { id: string; name: string | null; email: string } | null
  }
  items: Array<{
    id: string
    quantity: number
    orderItem: {
      product: { name: string; images: string[]; price: number }
    }
  }>
  handledBy: { name: string | null; email: string } | null
  refund: { id: string; amount: number; status: string } | null
}

interface Stats {
  total: number
  requested: number
  approved: number
  received: number
  refunded: number
  rejected: number
}

interface ReturnsClientProps {
  returns: ReturnRequest[]
  stats: Stats
}

const statusConfig = {
  REQUESTED: { label: 'Demandé', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  APPROVED: { label: 'Approuvé', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Check },
  REJECTED: { label: 'Refusé', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: X },
  SHIPPED: { label: 'Expédié', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck },
  RECEIVED: { label: 'Reçu', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Package },
  REFUNDED: { label: 'Remboursé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CreditCard },
  CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: X }
}

export function ReturnsClient({ returns, stats }: ReturnsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredReturns = returns.filter(r => {
    const matchesSearch =
      r.order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.order.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || r.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const updateReturn = async (returnId: string, updates: any) => {
    setIsLoading(true)
    try {
      await fetch('/api/admin/support/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnId, ...updates })
      })
      router.refresh()
      if (updates.status) setSelectedReturn(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalValue = (items: ReturnRequest['items']) => {
    return items.reduce((sum, item) => sum + (Number(item.orderItem.product.price) * item.quantity), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Retours
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {stats.requested} demandes en attente
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-100' },
          { label: 'Demandés', value: stats.requested, color: 'bg-blue-100' },
          { label: 'Approuvés', value: stats.approved, color: 'bg-green-100' },
          { label: 'Reçus', value: stats.received, color: 'bg-amber-100' },
          { label: 'Remboursés', value: stats.refunded, color: 'bg-emerald-100' },
          { label: 'Refusés', value: stats.rejected, color: 'bg-red-100' }
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par commande, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="REQUESTED">Demandés</SelectItem>
                <SelectItem value="APPROVED">Approuvés</SelectItem>
                <SelectItem value="SHIPPED">Expédiés</SelectItem>
                <SelectItem value="RECEIVED">Reçus</SelectItem>
                <SelectItem value="REFUNDED">Remboursés</SelectItem>
                <SelectItem value="REJECTED">Refusés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Returns List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y dark:divide-gray-800">
            {filteredReturns.map((returnReq) => {
              const status = statusConfig[returnReq.status]
              const StatusIcon = status.icon

              return (
                <div
                  key={returnReq.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => {
                    setSelectedReturn(returnReq)
                    setAdminNotes(returnReq.adminNotes || '')
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Images */}
                    <div className="flex -space-x-2">
                      {returnReq.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border-2 border-white dark:border-gray-900">
                          {item.orderItem.product.images[0] ? (
                            <Image
                              src={item.orderItem.product.images[0]}
                              alt={item.orderItem.product.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="h-6 w-6 m-3 text-gray-400" />
                          )}
                        </div>
                      ))}
                      {returnReq.items.length > 3 && (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-sm font-medium">
                          +{returnReq.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm">#{returnReq.order.orderNumber}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1", status.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {returnReq.order.user?.name || 'Client'} - {returnReq.order.user?.email}
                      </p>
                      <p className="text-sm mt-1 font-medium">
                        Motif: {returnReq.reason}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{returnReq.items.length} article{returnReq.items.length > 1 ? 's' : ''}</span>
                        <span>{getTotalValue(returnReq.items).toFixed(2)} €</span>
                        <span>{formatDistanceToNow(new Date(returnReq.createdAt), { addSuffix: true, locale: fr })}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateReturn(returnReq.id, { status: 'APPROVED' })}>
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Approuver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateReturn(returnReq.id, { status: 'RECEIVED' })}>
                          <Package className="h-4 w-4 mr-2" />
                          Marquer reçu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateReturn(returnReq.id, { status: 'REFUNDED' })}>
                          <CreditCard className="h-4 w-4 mr-2 text-emerald-600" />
                          Marquer remboursé
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateReturn(returnReq.id, { status: 'REJECTED' })} className="text-red-600">
                          <X className="h-4 w-4 mr-2" />
                          Refuser
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}

            {filteredReturns.length === 0 && (
              <div className="text-center py-12">
                <RotateCcw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun retour
                </h3>
                <p className="text-gray-500">
                  {searchQuery || filterStatus !== 'all' ? 'Aucun résultat' : 'Aucune demande de retour'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Return Detail Modal */}
      <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReturn && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">#{selectedReturn.order.orderNumber}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[selectedReturn.status].color)}>
                    {statusConfig[selectedReturn.status].label}
                  </span>
                </div>
                <DialogTitle>Demande de retour</DialogTitle>
                <DialogDescription>
                  {selectedReturn.order.user?.name} - {selectedReturn.order.user?.email}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Items */}
                <div>
                  <h4 className="font-medium mb-3">Articles à retourner</h4>
                  <div className="space-y-2">
                    {selectedReturn.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="h-12 w-12 rounded overflow-hidden bg-gray-200">
                          {item.orderItem.product.images[0] && (
                            <Image src={item.orderItem.product.images[0]} alt="" width={48} height={48} className="object-cover w-full h-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.orderItem.product.name}</p>
                          <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{(Number(item.orderItem.product.price) * item.quantity).toFixed(2)} €</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h4 className="font-medium mb-2">Motif</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedReturn.reason}</p>
                  {selectedReturn.description && (
                    <p className="mt-2 text-sm text-gray-500">{selectedReturn.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Statut</Label>
                    <Select
                      value={selectedReturn.status}
                      onValueChange={(v) => updateReturn(selectedReturn.id, { status: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REQUESTED">Demandé</SelectItem>
                        <SelectItem value="APPROVED">Approuvé</SelectItem>
                        <SelectItem value="SHIPPED">Expédié</SelectItem>
                        <SelectItem value="RECEIVED">Reçu</SelectItem>
                        <SelectItem value="REFUNDED">Remboursé</SelectItem>
                        <SelectItem value="REJECTED">Refusé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Transporteur retour</Label>
                    <Input
                      value={selectedReturn.returnCarrier || ''}
                      onChange={(e) => updateReturn(selectedReturn.id, { returnCarrier: e.target.value })}
                      placeholder="Colissimo, Chronopost..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>N° de suivi retour</Label>
                  <Input
                    value={selectedReturn.returnTrackingNumber || ''}
                    onChange={(e) => updateReturn(selectedReturn.id, { returnTrackingNumber: e.target.value })}
                    placeholder="Numéro de suivi"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Notes internes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notes pour l'équipe..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReturn(null)}>
                  Fermer
                </Button>
                <Button
                  onClick={() => updateReturn(selectedReturn.id, { adminNotes })}
                  disabled={isLoading}
                >
                  Sauvegarder
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
