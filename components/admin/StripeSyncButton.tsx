'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { forceStripeSync } from '@/app/actions/admin/stripe-sync'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function StripeSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [open, setOpen] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<any>(null)

  const handleSync = async () => {
    setSyncing(true)

    try {
      const result = await forceStripeSync()
      setLastSyncResult(result)

      if (result.success) {
        toast.success(result.message)
        if (result.stats.updated > 0) {
          toast.info(`Détails: ${result.details.slice(0, 3).join(', ')}${result.details.length > 3 ? '...' : ''}`)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Erreur lors de la synchronisation')
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Sync depuis Stripe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Synchronisation depuis Stripe
          </DialogTitle>
          <DialogDescription>
            Cette action va récupérer les modifications faites directement dans votre dashboard Stripe
            (images, prix, noms) et les appliquer à vos produits locaux.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Important</span>
            </div>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Les <strong>images</strong> seront mises à jour depuis Stripe</li>
              <li>• Les <strong>vidéos locales</strong> seront préservées (Stripe ne les supporte pas)</li>
              <li>• Les <strong>prix</strong> et <strong>noms</strong> seront synchronisés</li>
              <li>• Cette action est <strong>sûre</strong> et ne supprimera pas vos données</li>
            </ul>
          </div>

          {lastSyncResult && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                {lastSyncResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">Dernière synchronisation</span>
              </div>

              <div className="flex gap-2 mb-3">
                <Badge variant="secondary">
                  {lastSyncResult.stats.total} produits
                </Badge>
                <Badge variant={lastSyncResult.stats.updated > 0 ? "default" : "secondary"}>
                  {lastSyncResult.stats.updated} mis à jour
                </Badge>
                {lastSyncResult.stats.errors > 0 && (
                  <Badge variant="destructive">
                    {lastSyncResult.stats.errors} erreurs
                  </Badge>
                )}
              </div>

              {lastSyncResult.details.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium mb-1">Détails:</div>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {lastSyncResult.details.slice(0, 10).map((detail: string, index: number) => (
                      <li key={index} className="text-xs">
                        {detail}
                      </li>
                    ))}
                    {lastSyncResult.details.length > 10 && (
                      <li className="text-xs italic">
                        ... et {lastSyncResult.details.length - 10} autres modifications
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Synchroniser maintenant
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}