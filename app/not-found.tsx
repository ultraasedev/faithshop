import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="font-serif text-9xl font-bold text-primary/10">404</h1>
        <h2 className="mt-8 font-serif text-3xl font-medium text-foreground">Page Introuvable</h2>
        <p className="mt-4 text-muted-foreground max-w-md">
          Désolé, la page que vous recherchez semble avoir été déplacée ou n'existe plus.
        </p>
        <Button asChild className="mt-8 rounded-none h-12 px-8 uppercase tracking-widest" size="lg">
          <Link href="/">
            Retour à l'accueil
          </Link>
        </Button>
      </main>
      <Footer />
    </div>
  )
}
