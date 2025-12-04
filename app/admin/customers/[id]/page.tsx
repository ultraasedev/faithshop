'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import { getUserById } from '@/app/actions/admin/users'

interface CustomerDetail {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  role: string
  address: string | null
  city: string | null
  zipCode: string | null
  country: string | null
  createdAt: Date
  orders: {
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: Date
    items: {
      id: string
      quantity: number
      price: number
      product: {
        name: string
        images: string[]
      }
    }[]
  }[]
  _count: {
    orders: number
  }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Payée', color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'En préparation', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800' },
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomer()
  }, [params.id])

  async function loadCustomer() {
    try {
      const data = await getUserById(params.id as string)
      setCustomer(data as CustomerDetail)
    } catch (error) {
      console.error('Failed to load customer', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client non trouvé</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Retour
        </Button>
      </div>
    )
  }

  const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Détails du client</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={customer.image || undefined} />
                <AvatarFallback className="text-lg">
                  {(customer.name || customer.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{customer.name || 'Sans nom'}</p>
                <Badge variant="outline">{customer.role}</Badge>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {customer.address}
                    {customer.zipCode && customer.city && (
                      <><br />{customer.zipCode} {customer.city}</>
                    )}
                    {customer.country && <>, {customer.country}</>}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Inscrit le {new Date(customer.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{customer._count.orders}</p>
                <p className="text-xs text-muted-foreground">Commandes</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{totalSpent.toFixed(2)}€</p>
                <p className="text-xs text-muted-foreground">Total dépensé</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Historique des commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune commande</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customer.orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <Badge className={statusConfig[order.status]?.color || 'bg-gray-100'}>
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Number(order.total).toFixed(2)}€</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1"
                        >
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-6 h-6 object-cover rounded"
                            />
                          )}
                          <span className="truncate max-w-[150px]">{item.product.name}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-sm text-muted-foreground">
                          +{order.items.length - 3} autre(s)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
