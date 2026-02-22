import { auth } from '@/lib/auth'
import Link from 'next/link'
import { Package, User, Lock, MapPin, Heart, FileText, RotateCcw } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import OrderHistory from '@/components/account/OrderHistory'
import SignOutButton from '@/components/account/SignOutButton'

export default async function AccountPage() {
  const session = await auth()

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-4">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl">Espace Privé</h1>
            <p className="text-muted-foreground">
              Connectez-vous pour accéder à vos commandes, suivre vos livraisons et gérer vos informations personnelles.
            </p>
            <div className="flex flex-col gap-4 pt-4">
              <Button asChild className="h-12 rounded-none uppercase tracking-widest font-bold w-full">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button variant="outline" asChild className="h-12 rounded-none uppercase tracking-widest font-bold w-full">
                <Link href="/register">Créer un compte</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const menuItems = [
    { href: '/account', icon: Package, label: 'Mes Commandes', active: true },
    { href: '/account/profile', icon: User, label: 'Mes Informations' },
    { href: '/account/addresses', icon: MapPin, label: 'Mes Adresses' },
    { href: '/account/wishlist', icon: Heart, label: 'Ma Liste de Souhaits' },
    { href: '/account/returns', icon: RotateCcw, label: 'Mes Retours' },
    { href: '/account/invoices', icon: FileText, label: 'Mes Factures' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 bg-secondary/10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl">Mon Compte</h1>
              <p className="text-muted-foreground mt-2">Bienvenue, {session.user?.name || 'Client'}.</p>
            </div>
            <SignOutButton />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
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

            <div className="md:col-span-3 bg-background border border-border p-6 md:p-8">
              <h2 className="font-serif text-xl mb-6">Historique des commandes</h2>
              <OrderHistory userId={session.user?.id} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
