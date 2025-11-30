'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Package, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function ReturnForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const reasons = [
    'Taille incorrecte',
    'Couleur différente de l\'image',
    'Produit défectueux',
    'Produit endommagé à la livraison',
    'Ne correspond pas à mes attentes',
    'Autre',
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  if (!orderId) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <p className="text-lg mb-4">Aucune commande sélectionnée</p>
        <Button asChild>
          <Link href="/account">Retour à mon compte</Link>
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason,
          description,
          items: selectedItems,
        }),
      })

      if (response.ok) {
        toast.success('Demande de retour envoyée avec succès')
        router.push('/account/returns')
      } else {
        toast.error('Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/account" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" />
        Retour à mon compte
      </Link>

      <div className="bg-background border border-border p-6 md:p-8">
        <h1 className="font-serif text-2xl md:text-3xl mb-2">Demande de retour</h1>
        <p className="text-muted-foreground mb-8">
          Vous disposez de 14 jours après réception pour retourner vos articles.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Motif du retour *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              <option value="">Sélectionnez un motif</option>
              {reasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Décrivez le problème rencontré..."
              className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
            />
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Conditions de retour</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Les articles doivent être dans leur état d'origine</li>
              <li>• Les étiquettes doivent être attachées</li>
              <li>• L'emballage d'origine doit être conservé</li>
              <li>• Les frais de retour sont à votre charge (sauf article défectueux)</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 h-12 rounded-none uppercase tracking-widest font-bold"
              disabled={loading || !reason}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Soumettre la demande'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewReturnPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 bg-secondary/10">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <ReturnForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
