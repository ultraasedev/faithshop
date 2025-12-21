'use client'

import InvoiceTemplateEditor from '@/components/admin/InvoiceTemplateEditor'
import AccountingExport from '@/components/admin/AccountingExport'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function InvoicesPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facturation</h1>
        <p className="text-muted-foreground mt-2">Gérez vos templates de factures et exports comptables</p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Templates de Factures</TabsTrigger>
          <TabsTrigger value="accounting">Export Comptable</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Éditeur de Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceTemplateEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Comptable</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountingExport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}