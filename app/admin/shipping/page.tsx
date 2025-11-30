'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Printer
} from 'lucide-react'
import Link from 'next/link'

type ShippingStatus = 'PENDING' | 'LABEL_CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED'

interface PendingShipment {
  id: string
  orderNumber: string
  customerName: string
  address: string
  city: string
  zip: string
  country: string
  items: number
  createdAt: string
}

interface ShippingRate {
  id: string
  name: string
  carrier: string
  price: number
  minWeight: number
  maxWeight: number
  countries: string[]
  minDays: number
  maxDays: number
  isActive: boolean
}

const statusConfig: Record<ShippingStatus, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  LABEL_CREATED: { label: 'Étiquette créée', color: 'bg-blue-100 text-blue-800' },
  PICKED_UP: { label: 'Pris en charge', color: 'bg-purple-100 text-purple-800' },
  IN_TRANSIT: { label: 'En transit', color: 'bg-indigo-100 text-indigo-800' },
  OUT_FOR_DELIVERY: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  DELIVERED: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  RETURNED: { label: 'Retourné', color: 'bg-red-100 text-red-800' },
}

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'rates'>('pending')
  const [showRateModal, setShowRateModal] = useState(false)

  // Simulation de données - Commandes en attente d'expédition
  const pendingShipments: PendingShipment[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customerName: 'Jean Dupont',
      address: '123 Rue de la Paix',
      city: 'Paris',
      zip: '75001',
      country: 'France',
      items: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customerName: 'Marie Martin',
      address: '456 Avenue des Champs',
      city: 'Lyon',
      zip: '69001',
      country: 'France',
      items: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customerName: 'Pierre Bernard',
      address: '789 Boulevard Central',
      city: 'Marseille',
      zip: '13001',
      country: 'France',
      items: 2,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]

  // Tarifs de livraison
  const shippingRates: ShippingRate[] = [
    {
      id: '1',
      name: 'Standard',
      carrier: 'Colissimo',
      price: 4.99,
      minWeight: 0,
      maxWeight: 2,
      countries: ['FR'],
      minDays: 3,
      maxDays: 5,
      isActive: true,
    },
    {
      id: '2',
      name: 'Express',
      carrier: 'Chronopost',
      price: 9.99,
      minWeight: 0,
      maxWeight: 5,
      countries: ['FR'],
      minDays: 1,
      maxDays: 2,
      isActive: true,
    },
    {
      id: '3',
      name: 'Europe Standard',
      carrier: 'Colissimo International',
      price: 12.99,
      minWeight: 0,
      maxWeight: 5,
      countries: ['BE', 'CH', 'LU', 'DE', 'ES', 'IT'],
      minDays: 5,
      maxDays: 10,
      isActive: true,
    },
    {
      id: '4',
      name: 'Gratuit',
      carrier: 'Colissimo',
      price: 0,
      minWeight: 0,
      maxWeight: 10,
      countries: ['FR'],
      minDays: 5,
      maxDays: 7,
      isActive: false,
    },
  ]

  const handleGenerateLabel = async (orderId: string) => {
    // Appel API pour générer l'étiquette
    console.log('Generating label for', orderId)
  }

  const handleBulkGenerateLabels = async () => {
    // Générer toutes les étiquettes
    console.log('Generating all labels')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Livraison</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Expéditions en attente ({pendingShipments.length})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'rates'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('rates')}
        >
          Tarifs de livraison
        </button>
      </div>

      {activeTab === 'pending' && (
        <>
          {/* Stats rapides */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">À expédier</p>
                    <p className="text-2xl font-bold">{pendingShipments.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En transit</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Livrés aujourd'hui</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Retours</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <MapPin className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des expéditions en attente */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Commandes à expédier</CardTitle>
                <Button onClick={handleBulkGenerateLabels}>
                  <Printer className="h-4 w-4 mr-2" />
                  Générer toutes les étiquettes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/orders/${shipment.id}`}
                            className="font-medium hover:underline"
                          >
                            {shipment.orderNumber}
                          </Link>
                          <Badge variant="outline">{shipment.items} article(s)</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shipment.customerName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {shipment.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {shipment.zip} {shipment.city}, {shipment.country}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(shipment.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateLabel(shipment.id)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Étiquette
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingShipments.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">Toutes les commandes ont été expédiées !</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'rates' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowRateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau tarif
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tarifs de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Nom</th>
                      <th className="text-left py-3 px-4 font-medium">Transporteur</th>
                      <th className="text-left py-3 px-4 font-medium">Prix</th>
                      <th className="text-left py-3 px-4 font-medium">Poids max</th>
                      <th className="text-left py-3 px-4 font-medium">Zones</th>
                      <th className="text-left py-3 px-4 font-medium">Délai</th>
                      <th className="text-left py-3 px-4 font-medium">Statut</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingRates.map((rate) => (
                      <tr key={rate.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium">{rate.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            {rate.carrier}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={rate.price === 0 ? 'text-green-600 font-medium' : ''}>
                            {rate.price === 0 ? 'Gratuit' : `${rate.price.toFixed(2)}€`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {rate.maxWeight} kg
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {rate.countries.slice(0, 3).map((country) => (
                              <Badge key={country} variant="outline" className="text-xs">
                                {country}
                              </Badge>
                            ))}
                            {rate.countries.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{rate.countries.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {rate.minDays}-{rate.maxDays} jours
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={rate.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {rate.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal de création de tarif */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Nouveau tarif de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <Input placeholder="Standard" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Transporteur</label>
                  <Input placeholder="Colissimo" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Prix (€)</label>
                  <Input type="number" step="0.01" placeholder="4.99" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Poids min (kg)</label>
                  <Input type="number" step="0.1" placeholder="0" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Poids max (kg)</label>
                  <Input type="number" step="0.1" placeholder="5" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Pays (codes séparés par virgule)</label>
                <Input placeholder="FR, BE, CH" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Délai min (jours)</label>
                  <Input type="number" placeholder="3" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Délai max (jours)</label>
                  <Input type="number" placeholder="5" className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" defaultChecked />
                <label htmlFor="isActive" className="text-sm">Actif</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setShowRateModal(false)}>
                  Créer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
