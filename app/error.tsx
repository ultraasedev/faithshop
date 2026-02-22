'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-20">
      <h1 className="font-serif text-6xl font-bold text-primary/10">Oops</h1>
      <h2 className="mt-6 font-serif text-2xl font-medium text-foreground">Une erreur est survenue</h2>
      <p className="mt-4 text-muted-foreground max-w-md">
        Nous sommes désolés, quelque chose s'est mal passé. Veuillez réessayer ou retourner à l'accueil.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={reset} variant="outline" className="rounded-none h-12 px-8 uppercase tracking-widest">
          Réessayer
        </Button>
        <Button asChild className="rounded-none h-12 px-8 uppercase tracking-widest">
          <Link href="/">Accueil</Link>
        </Button>
      </div>
    </div>
  )
}
