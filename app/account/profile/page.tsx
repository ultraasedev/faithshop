'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Package, User, MapPin, Heart, FileText, RotateCcw, Loader2, Save } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const menuItems = [
    { href: '/account', icon: Package, label: 'Mes Commandes' },
    { href: '/account/profile', icon: User, label: 'Mes Informations', active: true },
    { href: '/account/addresses', icon: MapPin, label: 'Mes Adresses' },
    { href: '/account/wishlist', icon: Heart, label: 'Ma Liste de Souhaits' },
    { href: '/account/returns', icon: RotateCcw, label: 'Mes Retours' },
    { href: '/account/invoices', icon: FileText, label: 'Mes Factures' },
  ]

  if (status === 'loading') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      })

      if (response.ok) {
        await update({ name: formData.name })
        toast.success('Informations mises à jour')
      } else {
        toast.error('Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Mot de passe modifié')
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
      } else {
        const data = await response.json()
        toast.error(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
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
            <div className="md:col-span-3 space-y-8">
              {/* Personal Info */}
              <div className="bg-background border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl mb-6">Informations personnelles</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom complet</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={session.user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-border bg-secondary/50 text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Enregistrer
                  </Button>
                </form>
              </div>

              {/* Password Change */}
              <div className="bg-background border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl mb-6">Modifier le mot de passe</h2>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={loading || !formData.currentPassword || !formData.newPassword}
                  >
                    Modifier le mot de passe
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
