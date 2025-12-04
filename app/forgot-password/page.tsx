'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      setEmailSent(true)
      toast.success('Email envoyé ! Vérifiez votre boîte de réception.')
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4 pt-32">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-bold">Mot de passe oublié</h1>
            <p className="mt-2 text-muted-foreground">
              {emailSent
                ? 'Un email a été envoyé à votre adresse'
                : 'Entrez votre email pour réinitialiser votre mot de passe'}
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Adresse Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground sm:text-sm bg-transparent"
                    placeholder="Adresse Email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-none uppercase tracking-widest font-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-sm text-muted-foreground">
                N&apos;oubliez pas de vérifier vos spams.
              </p>
            </div>
          )}

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
      </main>
      <Footer />
    </div>
  )
}
