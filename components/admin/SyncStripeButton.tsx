'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SyncStripeButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/sync-products')
      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message)
        router.refresh()
      } else {
        toast.error('Erreur lors de la synchronisation')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} variant="outline" size="sm">
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Sync Stripe
    </Button>
  )
}
