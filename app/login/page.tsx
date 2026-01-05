'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        rememberMe: rememberMe.toString(),
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
        toast.error('Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      toast.success('Connexion réussie !')

      // Récupérer la session pour obtenir le rôle de l'utilisateur
      const sessionResponse = await fetch('/api/auth/session')
      const session = await sessionResponse.json()

      // Redirection intelligente selon le rôle
      let redirectUrl = callbackUrl

      if (callbackUrl === '/') {
        // Si pas de callback URL spécifique, rediriger selon le rôle
        const userRole = session?.user?.role

        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
          redirectUrl = '/admin'
        } else {
          redirectUrl = '/account'
        }
      }

      router.push(redirectUrl)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Une erreur est survenue lors de la connexion')
      toast.error('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-bold">Connexion</h1>
        <p className="mt-2 text-muted-foreground">Heureux de vous revoir.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Adresse Email</label>
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
          <div className="relative">
            <label htmlFor="password" className="sr-only">Mot de passe</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 pr-10 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground sm:text-sm bg-transparent"
              placeholder="Mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-foreground focus:ring-foreground border-border rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
              Se souvenir de moi
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-foreground hover:text-primary">
              Mot de passe oublié ?
            </Link>
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
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium text-foreground hover:text-primary underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4 pt-32">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
