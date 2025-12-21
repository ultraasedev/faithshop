import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Import des nouveaux composants
import DragDropGrid from '@/components/admin/DragDropGrid'
import RichTextEditor from '@/components/admin/RichTextEditor'
import LivePreview from '@/components/admin/LivePreview'
import PageBuilder from '@/components/admin/PageBuilder'
import ThemeCustomizer from '@/components/admin/ThemeCustomizer'
import NavigationEditor from '@/components/admin/NavigationEditor'
import InvoiceTemplateEditor from '@/components/admin/InvoiceTemplateEditor'
import AccountingExport from '@/components/admin/AccountingExport'
import ProductionManager from '@/components/admin/ProductionManager'
import DesignManager from '@/components/admin/DesignManager'
import AdvancedSyncManager from '@/components/admin/AdvancedSyncManager'

import { prisma } from '@/lib/prisma'
import { getProducts } from '@/app/actions/admin/products'
import { getOrders } from '@/app/actions/admin/orders'

export const dynamic = 'force-dynamic'

async function fetchRealData() {
  try {
    const [products, orders] = await Promise.all([
      getProducts(),
      getOrders()
    ])
    return { products, orders }
  } catch (error) {
    console.error('Error fetching real data:', error)
    return { products: [], orders: [] }
  }
}

export default async function EnhancedAdminPage() {
  const { products, orders } = await fetchRealData()

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Admin Avancé</h1>
          <p className="text-muted-foreground">
            Interface complète de gestion niveau entreprise - Données réelles connectées
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Production Ready
        </Badge>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="theme">Thème</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropGrid products={products} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aperçu en Temps Réel</CardTitle>
            </CardHeader>
            <CardContent>
              <LivePreview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <ProductionManager />
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <DesignManager />
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <AdvancedSyncManager />
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personnalisation du Thème</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeCustomizer />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation du Site</CardTitle>
            </CardHeader>
            <CardContent>
              <NavigationEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Factures</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceTemplateEditor />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Comptable</CardTitle>
              </CardHeader>
              <CardContent>
                <AccountingExport />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}