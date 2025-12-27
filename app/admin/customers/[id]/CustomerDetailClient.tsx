'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/common/StatusBadge'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  Star,
  Package,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CustomerDetailClientProps {
  customer: any
  stats: {
    totalOrders: number
    totalSpent: number
    avgOrderValue: number
    completedOrders: number
    lastOrderDate: Date | null
  }
}

export function CustomerDetailClient({ customer, stats }: CustomerDetailClientProps) {
  const router = useRouter()
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleSuspend = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          action: customer.status === 'SUSPENDED' ? 'activate' : 'suspend'
        })
      })

      if (!res.ok) throw new Error('Erreur')

      toast.success(
        customer.status === 'SUSPENDED'
          ? 'Compte client réactivé'
          : 'Compte client suspendu'
      )
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la modification')
    } finally {
      setLoading(false)
      setSuspendDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold">
              {customer.name?.charAt(0)?.toUpperCase() || customer.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer.name || 'Client sans nom'}
              </h1>
              <p className="text-gray-500">{customer.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={`mailto:${customer.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSuspendDialogOpen(true)}
                className={customer.status === 'SUSPENDED' ? 'text-green-600' : 'text-red-600'}
              >
                {customer.status === 'SUSPENDED' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Réactiver le compte
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Suspendre le compte
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSpent.toLocaleString('fr-FR')} €</p>
                <p className="text-xs text-gray-500">Total dépensé</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgOrderValue.toFixed(0)} €</p>
                <p className="text-xs text-gray-500">Panier moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customer._count.reviews}</p>
                <p className="text-xs text-gray-500">Avis laissés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {stats.lastOrderDate
                    ? format(new Date(stats.lastOrderDate), 'd MMM yyyy', { locale: fr })
                    : 'Jamais'
                  }
                </p>
                <p className="text-xs text-gray-500">Dernière commande</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Commandes récentes</CardTitle>
              <Link href={`/admin/orders?customer=${customer.id}`}>
                <Button variant="outline" size="sm">Voir tout</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {customer.orders.length > 0 ? (
                <div className="divide-y dark:divide-gray-800">
                  {customer.orders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-4 px-4 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(order.createdAt), "d MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.total.toLocaleString('fr-FR')} €</p>
                        <StatusBadge status={order.status} type="order" size="sm" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Aucune commande</p>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          {customer.reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Derniers avis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customer.reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(review.createdAt), "d MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-500">
                        Produit : {review.product.name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Client depuis {format(new Date(customer.createdAt), "MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <div className="pt-2 border-t dark:border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Statut du compte</p>
                <StatusBadge
                  status={customer.status || 'ACTIVE'}
                  type="customer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.addresses.length > 0 ? (
                <div className="space-y-4">
                  {customer.addresses.map((address: any) => (
                    <div
                      key={address.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm"
                    >
                      {address.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded mb-2 inline-block">
                          Par défaut
                        </span>
                      )}
                      <p className="font-medium">{address.firstName} {address.lastName}</p>
                      <p className="text-gray-600 dark:text-gray-400">{address.street}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {address.zipCode} {address.city}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{address.country}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">
                  Aucune adresse enregistrée
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {customer.status === 'SUSPENDED'
                ? 'Réactiver ce compte ?'
                : 'Suspendre ce compte ?'
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {customer.status === 'SUSPENDED'
                ? 'Le client pourra à nouveau se connecter et passer des commandes.'
                : 'Le client ne pourra plus se connecter ni passer de commandes.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={toggleSuspend}
              disabled={loading}
              className={customer.status === 'SUSPENDED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : customer.status === 'SUSPENDED' ? (
                'Réactiver'
              ) : (
                'Suspendre'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
