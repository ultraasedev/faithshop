import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  // Récupérer les statistiques
  const [productsCount, ordersCount, usersCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    }),
  ])

  // Calculer le revenu total
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      total: true,
    },
    where: {
      paymentStatus: 'PAID',
    },
  })

  const stats = [
    {
      title: 'Revenus Totaux',
      value: formatPrice(totalRevenue._sum.total || 0),
      icon: TrendingUp,
      color: 'bg-gradient-primary',
    },
    {
      title: 'Commandes',
      value: ordersCount.toString(),
      icon: ShoppingCart,
      color: 'bg-gradient-gold',
    },
    {
      title: 'Produits',
      value: productsCount.toString(),
      icon: Package,
      color: 'bg-gradient-primary',
    },
    {
      title: 'Clients',
      value: usersCount.toString(),
      icon: Users,
      color: 'bg-gradient-gold',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-foreground/70 mt-2">
          Vue d'ensemble de votre boutique Faith Shop
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Commandes Récentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">N° Commande</th>
                <th className="text-left py-3 px-4">Client</th>
                <th className="text-left py-3 px-4">Statut</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-foreground/70">
                    Aucune commande pour le moment
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                    <td className="py-3 px-4">{order.user.name || order.user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4 text-foreground/70">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <a href="/admin/products/new" className="card hover:shadow-xl transition-shadow">
          <h3 className="font-semibold mb-2">➕ Ajouter un Produit</h3>
          <p className="text-sm text-foreground/70">
            Créer un nouveau produit dans votre catalogue
          </p>
        </a>
        <a href="/admin/orders" className="card hover:shadow-xl transition-shadow">
          <h3 className="font-semibold mb-2">📦 Gérer les Commandes</h3>
          <p className="text-sm text-foreground/70">
            Voir et traiter les commandes en attente
          </p>
        </a>
        <a href="/admin/settings" className="card hover:shadow-xl transition-shadow">
          <h3 className="font-semibold mb-2">⚙️ Paramètres du Site</h3>
          <p className="text-sm text-foreground/70">
            Personnaliser l'apparence et les options
          </p>
        </a>
      </div>
    </div>
  )
}
