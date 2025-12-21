'use client'

import AdvancedSyncManager from '@/components/admin/AdvancedSyncManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SyncPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Synchronisation</h1>
        <p className="text-muted-foreground mt-2">Gérez la synchronisation bidirectionnelle avec vos plateformes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Synchronisation Avancée</CardTitle>
        </CardHeader>
        <CardContent>
          <AdvancedSyncManager />
        </CardContent>
      </Card>
    </div>
  )
}