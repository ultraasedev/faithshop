'use client'

import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { deleteProduct } from '@/app/actions/admin/products'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ProductActions({ productId }: { productId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const res = await deleteProduct(productId)
      if (res.message === 'Produit supprimé') {
        toast.success('Produit supprimé')
        router.refresh()
      } else {
        toast.error(res.message)
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${productId}`} className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" /> Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
