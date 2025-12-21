import ThemeCustomizer from '@/components/admin/ThemeCustomizer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function AppearancePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apparence</h1>
        <p className="text-muted-foreground mt-2">Personnalisez l'apparence complète de votre site</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personnalisation du Thème</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeCustomizer />
        </CardContent>
      </Card>
    </div>
  )
}
