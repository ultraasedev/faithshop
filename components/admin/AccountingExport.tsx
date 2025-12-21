'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  Filter
} from 'lucide-react'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { toast } from 'sonner'

interface ExportSettings {
  format: 'csv' | 'xlsx' | 'fec' | 'pdf'
  dateRange: {
    from: Date
    to: Date
  }
  includeVAT: boolean
  includeDiscounts: boolean
  includeShipping: boolean
  includeRefunds: boolean
  groupBy: 'day' | 'week' | 'month' | 'quarter'
  currency: string
}

interface AccountingData {
  sales: {
    total: number
    count: number
    avgOrder: number
    growth: number
  }
  vat: {
    collected: number
    rate: number
  }
  products: {
    topSelling: Array<{
      name: string
      quantity: number
      revenue: number
    }>
    categories: Array<{
      name: string
      revenue: number
      percentage: number
    }>
  }
  customers: {
    new: number
    returning: number
    totalOrders: number
  }
  expenses: {
    shipping: number
    fees: number
    discounts: number
    refunds: number
  }
}

interface AccountingExportProps {
  onExport: (settings: ExportSettings) => Promise<void>
  data: AccountingData
}

const presetRanges = [
  {
    label: "7 derniers jours",
    value: "7d",
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  },
  {
    label: "30 derniers jours",
    value: "30d",
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  },
  {
    label: "Ce mois",
    value: "month",
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  },
  {
    label: "Mois dernier",
    value: "lastMonth",
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  },
  {
    label: "Ce trimestre",
    value: "quarter",
    from: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
    to: new Date()
  },
  {
    label: "Cette année",
    value: "year",
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  }
]

const exportFormats = [
  {
    id: 'csv',
    name: 'CSV',
    description: 'Format universel pour tableurs',
    icon: FileSpreadsheet,
    extension: '.csv'
  },
  {
    id: 'xlsx',
    name: 'Excel',
    description: 'Format Microsoft Excel',
    icon: FileSpreadsheet,
    extension: '.xlsx'
  },
  {
    id: 'fec',
    name: 'FEC',
    description: 'Fichier des Écritures Comptables (France)',
    icon: FileText,
    extension: '.txt'
  },
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Rapport détaillé en PDF',
    icon: FileText,
    extension: '.pdf'
  }
]

export default function AccountingExport({ onExport, data }: AccountingExportProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'xlsx',
    dateRange: {
      from: presetRanges[2].from,
      to: presetRanges[2].to
    },
    includeVAT: true,
    includeDiscounts: true,
    includeShipping: true,
    includeRefunds: true,
    groupBy: 'month',
    currency: 'EUR'
  })

  const [exporting, setExporting] = useState(false)

  const updateSettings = (key: keyof ExportSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handlePresetRange = (preset: typeof presetRanges[0]) => {
    updateSettings('dateRange', { from: preset.from, to: preset.to })
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await onExport(settings)
      toast.success('Export généré avec succès')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  const handleQuickExport = async (type: string) => {
    try {
      const quickSettings = {
        ...settings,
        format: type === 'excel' ? 'xlsx' as const : type === 'fec' ? 'fec' as const : 'pdf' as const,
        dateRange: type === 'monthly'
          ? { from: presetRanges[2].from, to: presetRanges[2].to }
          : type === 'quarterly'
          ? { from: presetRanges[4].from, to: presetRanges[4].to }
          : settings.dateRange
      }

      await onExport(quickSettings)
      toast.success(`Export ${type} généré avec succès`)
    } catch (error) {
      toast.error('Erreur lors de l\'export rapide')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: settings.currency
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(value / 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export comptable</h2>
          <p className="text-muted-foreground">
            Exportez vos données de vente dans différents formats comptables
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.sales.total)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{formatPercent(data.sales.growth)} vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TVA collectée</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.vat.collected)}</div>
            <p className="text-xs text-muted-foreground">
              Taux moyen: {data.vat.rate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sales.count}</div>
            <p className="text-xs text-muted-foreground">
              Panier moyen: {formatCurrency(data.sales.avgOrder)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.customers.new + data.customers.returning}</div>
            <p className="text-xs text-muted-foreground">
              {data.customers.new} nouveaux, {data.customers.returning} fidèles
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="settings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="settings">Configuration</TabsTrigger>
              <TabsTrigger value="preview">Aperçu des données</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Période d'export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {presetRanges.map(preset => (
                      <Button
                        key={preset.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetRange(preset)}
                        className="justify-start"
                      >
                        <Calendar className="h-3 w-3 mr-2" />
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <Label>Période personnalisée</Label>
                    <DatePickerWithRange
                      date={settings.dateRange}
                      onDateChange={(range) => updateSettings('dateRange', range)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Format d'export</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {exportFormats.map(format => (
                      <Button
                        key={format.id}
                        variant={settings.format === format.id ? "default" : "outline"}
                        onClick={() => updateSettings('format', format.id)}
                        className="h-auto p-4 flex flex-col items-start"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <format.icon className="h-4 w-4" />
                          <span className="font-medium">{format.name}</span>
                        </div>
                        <span className="text-xs text-left opacity-70">
                          {format.description}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options d'export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="groupBy">Groupement des données</Label>
                    <select
                      id="groupBy"
                      value={settings.groupBy}
                      onChange={(e) => updateSettings('groupBy', e.target.value)}
                      className="w-full p-2 border rounded-md mt-1"
                    >
                      <option value="day">Par jour</option>
                      <option value="week">Par semaine</option>
                      <option value="month">Par mois</option>
                      <option value="quarter">Par trimestre</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <select
                      id="currency"
                      value={settings.currency}
                      onChange={(e) => updateSettings('currency', e.target.value)}
                      className="w-full p-2 border rounded-md mt-1"
                    >
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar US (USD)</option>
                      <option value="GBP">Livre Sterling (GBP)</option>
                      <option value="CHF">Franc Suisse (CHF)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label>Données à inclure</Label>
                    {[
                      { key: 'includeVAT', label: 'TVA et taxes' },
                      { key: 'includeDiscounts', label: 'Remises et coupons' },
                      { key: 'includeShipping', label: 'Frais de livraison' },
                      { key: 'includeRefunds', label: 'Remboursements' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key}>{label}</Label>
                        <input
                          type="checkbox"
                          id={key}
                          checked={settings[key as keyof ExportSettings] as boolean}
                          onChange={(e) => updateSettings(key, e.target.checked)}
                          className="rounded"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu des données</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Produits les mieux vendus</Label>
                    <div className="space-y-2 mt-2">
                      {data.products.topSelling.map((product, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{product.name}</span>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(product.revenue)}</div>
                            <div className="text-muted-foreground">{product.quantity} vendus</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Répartition par catégorie</Label>
                    <div className="space-y-2 mt-2">
                      {data.products.categories.map((category, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{category.name}</span>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(category.revenue)}</div>
                            <div className="text-muted-foreground">{formatPercent(category.percentage)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Charges et déductions</Label>
                    <div className="space-y-2 mt-2">
                      {[
                        { label: 'Frais de livraison', amount: data.expenses.shipping },
                        { label: 'Commissions', amount: data.expenses.fees },
                        { label: 'Remises accordées', amount: data.expenses.discounts },
                        { label: 'Remboursements', amount: data.expenses.refunds }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{item.label}</span>
                          <span className="font-medium text-red-600">-{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Génération de l'export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span>Format:</span>
                  <Badge variant="outline">
                    {exportFormats.find(f => f.id === settings.format)?.name}
                  </Badge>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Période:</span>
                  <span className="text-muted-foreground">
                    {settings.dateRange.from.toLocaleDateString()} - {settings.dateRange.to.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Groupement:</span>
                  <span className="text-muted-foreground">
                    {settings.groupBy === 'day' ? 'Par jour' :
                     settings.groupBy === 'week' ? 'Par semaine' :
                     settings.groupBy === 'month' ? 'Par mois' : 'Par trimestre'}
                  </span>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Export en cours...' : 'Télécharger l\'export'}
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>L'export sera téléchargé automatiquement une fois généré.</p>
                <p className="mt-1">
                  Taille estimée: {settings.format === 'pdf' ? '2-5' : '0.5-2'} MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Export rapide */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Exports rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleQuickExport('monthly')}
              >
                <FileSpreadsheet className="h-3 w-3 mr-2" />
                Ventes du mois (Excel)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleQuickExport('fec')}
              >
                <FileText className="h-3 w-3 mr-2" />
                TVA collectée (FEC)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleQuickExport('quarterly')}
              >
                <BarChart3 className="h-3 w-3 mr-2" />
                Rapport trimestriel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}