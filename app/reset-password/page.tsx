'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    // Vérifier si le token est présent
    if (!token) {
      setValidToken(false)
      toast.error('Token de réinitialisation manquant')
    } else {
      setValidToken(true)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      toast.success('Mot de passe réinitialisé avec succès !')
      router.push('/login')
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Une erreur est survenue')
      setLoading(false)
    }
  }

  if (validToken === false) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Token invalide</h1>
          <p className="mt-2 text-muted-foreground">
            Le lien de réinitialisation est invalide ou a expiré.
          </p>
        </div>

        <Link
          href="/forgot-password"
          className="inline-flex items-center text-sm font-medium text-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-bold">Nouveau mot de passe</h1>
        <p className="mt-2 text-muted-foreground">
          Entrez votre nouveau mot de passe
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground sm:text-sm bg-transparent"
              placeholder="Nouveau mot de passe"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="sr-only">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              className="appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground sm:text-sm bg-transparent"
              placeholder="Confirmer le mot de passe"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Au moins 8 caractères
        </p>

        <Button
          type="submit"
          className="w-full h-12 rounded-none uppercase tracking-widest font-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réinitialisation...
            </>
          ) : (
            'Réinitialiser le mot de passe'
          )}
        </Button>
      </form>

      <div className="text-center mt-8">
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4 pt-32">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
