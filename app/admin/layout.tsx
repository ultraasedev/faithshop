import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminNavigation } from '@/components/admin/AdminNavigation'

export const metadata: Metadata = {
  title: 'Administration - Faith Shop',
  description: 'Panel d\'administration Faith Shop',
  robots: 'noindex, nofollow'
}

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/admin')
  }

  // Check if user is admin
  const isAdmin = session.user.email === 'admin@faith-shop.fr' ||
                  (session.user as any)?.role === 'ADMIN'

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminNavigation session={session} />
      <main className="lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}