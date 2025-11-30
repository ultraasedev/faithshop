import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Download, RotateCcw } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PAID: { label: 'Payée', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  PROCESSING: { label: 'En préparation', color: 'bg-purple-100 text-purple-800', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: Clock },
  REFUNDED: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800', icon: RotateCcw },
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/orders/' + id)
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shipping: true,
      user: true,
    },
  })

  if (!order) {
    redirect('/account')
  }

  const status = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = status.icon

  // Check if return is eligible (within 14 days of delivery)
  const deliveredAt = order.shipping?.deliveredAt
  const isReturnEligible = order.status === 'DELIVERED' &&
    deliveredAt &&
    new Date().getTime() - new Date(deliveredAt).getTime() < 14 * 24 * 60 * 60 * 1000

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 bg-secondary/10">
        <div className="mx-auto max-w-4xl">
          <Link href="/account" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Retour à mon compte
          </Link>

          <div className="bg-background border border-border p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl">Commande #{order.orderNumber}</h1>
                <p className="text-muted-foreground mt-1">
                  Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </div>
            </div>

            {/* Tracking */}
            {order.shipping?.trackingNumber && (
              <div className="bg-secondary/50 p-4 rounded-lg mb-8">
                <p className="text-sm font-medium mb-1">Numéro de suivi</p>
                <p className="font-mono text-lg">{order.shipping.trackingNumber}</p>
                {order.shipping.trackingUrl && (
                  <a
                    href={order.shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Suivre ma livraison →
                  </a>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-4 mb-8">
              <h2 className="font-medium text-lg">Articles commandés</h2>
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-border">
                  <div className="h-20 w-16 bg-secondary flex-shrink-0">
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.size && `Taille: ${item.size}`}
                      {item.size && item.color && ' • '}
                      {item.color && `Couleur: ${item.color}`}
                    </p>
                    <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Number(item.price).toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Addresses */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-medium mb-2">Adresse de livraison</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order.user?.name || order.guestName}</p>
                  <p>{order.shippingAddress}</p>
                  <p>{order.shippingZip} {order.shippingCity}</p>
                  <p>{order.shippingCountry}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Adresse de facturation</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order.user?.name || order.guestName}</p>
                  <p>{order.billingAddress || order.shippingAddress}</p>
                  <p>{order.billingZip || order.shippingZip} {order.billingCity || order.shippingCity}</p>
                  <p>{order.billingCountry || order.shippingCountry}</p>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{Number(order.subtotal).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span>{Number(order.shippingCost).toFixed(2)} €</span>
              </div>
              {order.discountAmount && Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span>-{Number(order.discountAmount).toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>{Number(order.total).toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <Link href={`/account/invoices/${order.id}`}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger la facture
              </Link>
            </Button>
            {isReturnEligible && (
              <Button variant="outline" asChild>
                <Link href={`/account/returns/new?orderId=${order.id}`}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Demander un retour
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
