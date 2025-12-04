'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Package, User, MapPin, Heart, FileText, RotateCcw, Loader2, Plus } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
}

export default function ReturnsPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const menuItems = [
    { href: '/account', icon: Package, label: 'Mes Commandes' },
    { href: '/account/profile', icon: User, label: 'Mes Informations' },
    { href: '/account/addresses', icon: MapPin, label: 'Mes Adresses' },
    { href: '/account/wishlist', icon: Heart, label: 'Ma Liste de Souhaits' },
    { href: '/account/returns', icon: RotateCcw, label: 'Mes Retours', active: true },
    { href: '/account/invoices', icon: FileText, label: 'Mes Factures' },
  ]

  useEffect(() => {
    if (session?.user) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/account/orders')
      if (res.ok) {
        const data = await res.json()
        // Filtrer pour n'afficher que les commandes livrées ou refundées
        const eligibleOrders = data.filter((o: Order) =>
          o.status === 'DELIVERED' || o.status === 'REFUNDED'
        )
        setOrders(eligibleOrders)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const refundedOrders = orders.filter(o => o.status === 'REFUNDED')
  const eligibleForReturn = orders.filter(o => o.status === 'DELIVERED')

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 bg-secondary/10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-serif text-3xl md:text-4xl mb-12">Mon Compte</h1>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar Menu */}
            <div className="md:col-span-1 space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant={item.active ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3 h-12"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                </Button>
              ))}
            </div>

            {/* Content Area */}
            <div className="md:col-span-3 space-y-8">
              {/* Demandes de retour en cours */}
              {refundedOrders.length > 0 && (
                <div>
                  <h2 className="font-serif text-xl mb-4">Retours effectués</h2>
                  <div className="space-y-4">
                    {refundedOrders.map((order) => (
                      <div key={order.id} className="bg-background border border-border p-6 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Commande #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm">
                            Remboursé
                          </span>
                          <p className="text-sm mt-1">{Number(order.total).toFixed(2)} &euro;</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commandes éligibles pour retour */}
              <div>
                <h2 className="font-serif text-xl mb-4">Demander un retour</h2>

                {eligibleForReturn.length === 0 ? (
                  <div className="bg-background border border-border p-12 text-center">
                    <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground mb-2">Aucune commande éligible pour un retour.</p>
                    <p className="text-sm text-muted-foreground">
                      Les retours sont possibles dans les 30 jours suivant la livraison.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eligibleForReturn.map((order) => (
                      <div key={order.id} className="bg-background border border-border p-6 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Commande #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Livrée le {format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                          <p className="text-sm mt-1">{Number(order.total).toFixed(2)} &euro;</p>
                        </div>
                        <Button asChild>
                          <Link href={`/account/returns/new?orderId=${order.id}`}>
                            <Plus className="h-4 w-4 mr-2" /> Demander un retour
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 bg-secondary/30 p-6">
                  <h3 className="font-medium mb-2">Politique de retour</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>- Vous disposez de 30 jours après réception pour retourner un article</li>
                    <li>- Les articles doivent être dans leur état d'origine, non portés et avec étiquettes</li>
                    <li>- Le remboursement est effectué sous 5-7 jours ouvrés après réception du retour</li>
                    <li>- Les frais de retour sont à votre charge sauf en cas de produit défectueux</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
