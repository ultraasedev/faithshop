'use client'

import NavigationEditor from '@/components/admin/NavigationEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NavigationPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
        <p className="text-muted-foreground mt-2">Gérez les liens du menu principal avec notre éditeur avancé</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <NavigationEditor />
        </CardContent>
      </Card>
    </div>
  )
}