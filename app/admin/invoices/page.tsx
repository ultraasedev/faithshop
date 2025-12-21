'use client'

import { useState, useEffect } from 'react'
import InvoiceTemplateEditor from '@/components/admin/InvoiceTemplateEditor'
import AccountingExport from '@/components/admin/AccountingExport'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function InvoicesPage() {
  const [accountingData, setAccountingData] = useState({
    sales: {
      total: 0,
      count: 0,
      avgOrder: 0,
      growth: 0
    },
    vat: {
      collected: 0,
      rate: 20
    },
    products: {
      topSelling: [],
      categories: []
    },
    customers: {
      new: 0,
      returning: 0,
      totalOrders: 0
    },
    expenses: {
      shipping: 0,
      fees: 0,
      discounts: 0,
      refunds: 0
    }
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccountingData()
  }, [])

  const fetchAccountingData = async () => {
    try {
      // Simulate fetching accounting data with default values
      // In a real app, this would fetch from your analytics API
      const mockData = {
        sales: {
          total: 25420.50,
          count: 156,
          avgOrder: 163.08,
          growth: 12.5
        },
        vat: {
          collected: 5084.10,
          rate: 20
        },
        products: {
          topSelling: [
            { name: 'T-shirt Faith Premium', quantity: 45, revenue: 1347.55 },
            { name: 'Sweat à capuche Faith', quantity: 32, revenue: 1599.68 },
            { name: 'Casquette Faith', quantity: 28, revenue: 699.72 }
          ],
          categories: [
            { name: 'Vêtements', revenue: 18500.00, percentage: 72.8 },
            { name: 'Accessoires', revenue: 4920.50, percentage: 19.4 },
            { name: 'Autres', revenue: 2000.00, percentage: 7.8 }
          ]
        },
        customers: {
          new: 42,
          returning: 114,
          totalOrders: 156
        },
        expenses: {
          shipping: 850.75,
          fees: 762.62,
          discounts: 1271.02,
          refunds: 245.80
        }
      }

      setAccountingData(mockData)
    } catch (error) {
      console.error('Error fetching accounting data:', error)
      toast.error('Erreur lors du chargement des données comptables')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (settings: any) => {
    try {
      // Simulate export functionality
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real app, you would call your export API here
      console.log('Exporting with settings:', settings)

      toast.success('Export généré avec succès')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erreur lors de l\'export')
    }
  }

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
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Chargement des données comptables...</p>
              </CardContent>
            </Card>
          ) : (
            <AccountingExport data={accountingData} onExport={handleExport} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}