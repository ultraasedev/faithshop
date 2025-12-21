'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export default function InvoicesRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/enhanced')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Redirection en cours...</h2>
          <p className="text-muted-foreground">
            Vous êtes redirigé vers le nouveau panel d'administration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}