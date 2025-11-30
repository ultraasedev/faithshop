import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background border-r border-border min-h-screen fixed left-0 top-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold gradient-text">Faith Shop Admin</h2>
          </div>
          
          <nav className="px-4 space-y-2">
            <a href="/admin" className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors">
              📊 Dashboard
            </a>
            <a href="/admin/products" className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors">
              🛍️ Produits
            </a>
            <a href="/admin/categories" className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors">
              📁 Catégories
            </a>
            <a href="/admin/orders" className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors">
              📦 Commandes
            </a>
            <a href="/admin/customers" className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors">
              👥 Clients
            </a>
            <a href="/admin/settings" className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors">
              ⚙️ Paramètres
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
