'use client'

import { useFormState } from 'react-dom'
import { createProduct } from '@/app/actions/admin/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</> : 'Créer le produit'}
    </Button>
  )
}

export default function NewProductPage() {
  const [state, action] = useFormState(createProduct, {})

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Nouveau Produit</h1>
      </div>

      <form action={action} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        
        <div className="space-y-2">
          <Label htmlFor="name">Nom du produit</Label>
          <Input id="name" name="name" required placeholder="Ex: T-Shirt Signature" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Description détaillée..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (€)</Label>
            <Input id="price" name="price" type="number" step="0.01" required placeholder="45.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock initial</Label>
            <Input id="stock" name="stock" type="number" required placeholder="100" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="colors">Couleurs (séparées par des virgules)</Label>
          <Input id="colors" name="colors" placeholder="Blanc, Noir, Beige" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sizes">Tailles (séparées par des virgules)</Label>
          <Input id="sizes" name="sizes" placeholder="XS, S, M, L, XL" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="images">URLs Images (séparées par des virgules)</Label>
          <Input id="images" name="images" placeholder="https://..., https://..." />
          <p className="text-xs text-muted-foreground">Pour l'instant, collez les URLs des images uploadées (ex: via Vercel Blob).</p>
        </div>

        {state.message && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{state.message}</p>
        )}

        <div className="flex justify-end pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
