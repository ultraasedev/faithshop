'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    country: 'FR',
    companyName: '',
    vatNumber: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstname} ${formData.lastname}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country,
          isPro,
          companyName: isPro ? formData.companyName : undefined,
          vatNumber: isPro ? formData.vatNumber : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
      router.push('/login')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-4 bg-secondary/10">
        <div className="w-full max-w-2xl space-y-8 bg-background p-8 md:p-12 border border-border shadow-sm">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl">Créer un compte</h1>
            <p className="text-muted-foreground">Rejoignez la communauté Faith Shop</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identité */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstname" className="text-xs font-bold uppercase tracking-widest">Prénom *</label>
                <input
                  type="text"
                  id="firstname"
                  required
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastname" className="text-xs font-bold uppercase tracking-widest">Nom *</label>
                <input
                  type="text"
                  id="lastname"
                  required
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">Email *</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">Téléphone *</label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <label htmlFor="address" className="text-xs font-bold uppercase tracking-widest">Adresse *</label>
              <input
                type="text"
                id="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-xs font-bold uppercase tracking-widest">Code Postal *</label>
                <input
                  type="text"
                  id="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="city" className="text-xs font-bold uppercase tracking-widest">Ville *</label>
                <input
                  type="text"
                  id="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="text-xs font-bold uppercase tracking-widest">Pays *</label>
              <select
                id="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors appearance-none"
              >
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
                <option value="CA">Canada</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Entreprise Toggle */}
            <div className="flex items-center space-x-3 py-2">
              <input 
                type="checkbox" 
                id="pro" 
                checked={isPro} 
                onChange={(e) => setIsPro(e.target.checked)}
                className="w-5 h-5 border-border rounded-none text-foreground focus:ring-foreground"
              />
              <label
                htmlFor="pro"
                className="text-sm font-medium leading-none cursor-pointer select-none"
              >
                Je suis une entreprise
              </label>
            </div>

            {/* Champs Entreprise */}
            {isPro && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-xs font-bold uppercase tracking-widest">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    id="companyName"
                    required={isPro}
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="vatNumber" className="text-xs font-bold uppercase tracking-widest">Numéro de TVA</label>
                  <input
                    type="text"
                    id="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleChange}
                    className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2 pt-4 border-t border-border">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest">Mot de passe *</label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors"
              />
              <p className="text-xs text-muted-foreground">Au moins 8 caractères</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-none uppercase tracking-widest font-bold text-base mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Déjà un compte ? </span>
            <Link href="/login" className="font-bold hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
