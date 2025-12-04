'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Package, User, MapPin, Heart, FileText, RotateCcw, Loader2, Download, Eye } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  createdAt: string
}

export default function InvoicesPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const menuItems = [
    { href: '/account', icon: Package, label: 'Mes Commandes' },
    { href: '/account/profile', icon: User, label: 'Mes Informations' },
    { href: '/account/addresses', icon: MapPin, label: 'Mes Adresses' },
    { href: '/account/wishlist', icon: Heart, label: 'Ma Liste de Souhaits' },
    { href: '/account/returns', icon: RotateCcw, label: 'Mes Retours' },
    { href: '/account/invoices', icon: FileText, label: 'Mes Factures', active: true },
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
        // Filtrer pour n'afficher que les commandes payées
        const paidOrders = data.filter((o: Order) => o.paymentStatus === 'COMPLETED')
        setOrders(paidOrders)
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
            <div className="md:col-span-3 space-y-6">
              <h2 className="font-serif text-xl">Mes Factures</h2>

              {orders.length === 0 ? (
                <div className="bg-background border border-border p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Vous n'avez pas encore de facture.</p>
                </div>
              ) : (
                <div className="bg-background border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-medium">N&deg; Facture</th>
                        <th className="text-left px-6 py-4 text-sm font-medium">Date</th>
                        <th className="text-left px-6 py-4 text-sm font-medium">Montant</th>
                        <th className="text-right px-6 py-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-secondary/10">
                          <td className="px-6 py-4">
                            <span className="font-medium">FAC-{order.orderNumber}</span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: fr })}
                          </td>
                          <td className="px-6 py-4">
                            {Number(order.total).toFixed(2)} &euro;
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/account/invoices/${order.id}`}>
                                  <Eye className="h-4 w-4 mr-1" /> Voir
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/api/account/invoices/${order.id}/pdf`} target="_blank">
                                  <Download className="h-4 w-4 mr-1" /> PDF
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Les factures sont générées automatiquement pour chaque commande payée.</p>
                <p>Pour toute question concernant vos factures, contactez notre service client.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
