'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function RegisterPage() {
  const [isPro, setIsPro] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-4 bg-secondary/10">
        <div className="w-full max-w-2xl space-y-8 bg-background p-8 md:p-12 border border-border shadow-sm">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl">Créer un compte</h1>
            <p className="text-muted-foreground">Rejoignez la communauté Faith Shop</p>
          </div>

          <form className="space-y-6">
            {/* Identité */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstname" className="text-xs font-bold uppercase tracking-widest">Prénom *</label>
                <input type="text" id="firstname" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastname" className="text-xs font-bold uppercase tracking-widest">Nom *</label>
                <input type="text" id="lastname" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
              </div>
            </div>

            {/* Contact */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">Email *</label>
                <input type="email" id="email" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">Téléphone *</label>
                <input type="tel" id="phone" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <label htmlFor="address" className="text-xs font-bold uppercase tracking-widest">Adresse *</label>
              <input type="text" id="address" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="zip" className="text-xs font-bold uppercase tracking-widest">Code Postal *</label>
                <input type="text" id="zip" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="city" className="text-xs font-bold uppercase tracking-widest">Ville *</label>
                <input type="text" id="city" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="text-xs font-bold uppercase tracking-widest">Pays *</label>
              <select id="country" className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors appearance-none">
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
                  <label htmlFor="company" className="text-xs font-bold uppercase tracking-widest">Nom de l'entreprise *</label>
                  <input type="text" id="company" required={isPro} className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="vat" className="text-xs font-bold uppercase tracking-widest">Numéro de TVA</label>
                  <input type="text" id="vat" className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2 pt-4 border-t border-border">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest">Mot de passe *</label>
              <input type="password" id="password" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
              <p className="text-xs text-muted-foreground">Au moins 8 caractères</p>
            </div>

            <Button className="w-full h-12 rounded-none uppercase tracking-widest font-bold text-base mt-6">
              S'inscrire
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
