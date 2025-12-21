'use client'

import ProductionManager from '@/components/admin/ProductionManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProductionPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Production</h1>
        <p className="text-muted-foreground mt-2">Gérez votre chaîne de production print-on-demand</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestionnaire de Production</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductionManager />
        </CardContent>
      </Card>
    </div>
  )
}