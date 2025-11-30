'use client'

import Link from 'next/link'
import { Package, User, LogOut, Lock } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function AccountPage() {
  // Mock Auth State - À remplacer par votre vrai hook d'auth (ex: useSession, useAuth)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simule une vérification d'auth
    const checkAuth = () => {
      // Pour la démo, on considère qu'on n'est pas connecté par défaut
      // Vous pouvez changer ça en true pour tester la vue connectée
      setIsAuthenticated(false) 
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  if (isLoading) return null

  if (!isAuthenticated) {
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 bg-secondary/10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl">Mon Compte</h1>
              <p className="text-muted-foreground mt-2">Bienvenue, Franck.</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setIsAuthenticated(false)}>
              <LogOut className="w-4 h-4" /> Se déconnecter
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar Menu */}
            <div className="md:col-span-1 space-y-2">
              <Button variant="secondary" className="w-full justify-start gap-3 h-12" asChild>
                <Link href="/account">
                  <Package className="w-4 h-4" /> Mes Commandes
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-12" asChild>
                <Link href="/account/profile">
                  <User className="w-4 h-4" /> Mes Informations
                </Link>
              </Button>
            </div>

            {/* Content Area */}
            <div className="md:col-span-2 bg-background border border-border p-6 md:p-8">
              <h2 className="font-serif text-xl mb-6">Historique des commandes</h2>
              
              <div className="space-y-6">
                {/* Mock Order */}
                <div className="border border-border p-4">
                  <div className="flex justify-between items-start mb-4 border-b border-border pb-4">
                    <div>
                      <p className="font-bold text-sm">Commande #FS-2025-001</p>
                      <p className="text-xs text-muted-foreground">30 Nov 2025</p>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 uppercase tracking-wider">
                      En cours
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="h-16 w-12 bg-secondary"></div>
                    <div>
                      <p className="text-sm font-medium">Hoodie Grace & Mercy</p>
                      <p className="text-xs text-muted-foreground">Taille: L</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm font-bold">85.00 €</p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8 text-muted-foreground text-sm">
                  Vous n'avez pas d'autres commandes récentes.
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
