'use client'

import { useEffect, useState } from 'react'
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
import {
  getShippingRates,
  getPendingShipments,
  generateShippingLabel,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
  updateShipmentTracking
} from '@/app/actions/admin/shipping'

// ... (types and interfaces remain the same)

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'rates'>('pending')
  const [showRateModal, setShowRateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([])
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [stats, setStats] = useState({ pending: 0, inTransit: 0, deliveredToday: 0, returns: 0 })

  const [newRate, setNewRate] = useState({
    name: '',
    carrier: '',
    price: '',
    minWeight: '',
    maxWeight: '',
    countries: '',
    minDays: '',
    maxDays: '',
    isActive: true
  })

  const [trackingModal, setTrackingModal] = useState<{ isOpen: boolean; orderId: string | null; carrier: string; trackingNumber: string }>({
    isOpen: false,
    orderId: null,
    carrier: '',
    trackingNumber: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [orders, rates] = await Promise.all([
        getPendingShipments(),
        getShippingRates()
      ])
      setPendingOrders(orders as unknown as PendingOrder[])
      setShippingRates(rates)
      
      // Calculate stats
      const pending = orders.filter(o => !o.shipping || o.shipping.status === 'PENDING').length
      const inTransit = orders.filter(o => o.shipping?.status === 'IN_TRANSIT').length
      const deliveredToday = orders.filter(o => 
        o.shipping?.status === 'DELIVERED' && 
        new Date(o.shipping.updatedAt).toDateString() === new Date().toDateString()
      ).length
      
      setStats({ pending, inTransit, deliveredToday, returns: 0 })
    } catch (error) {
      console.error('Failed to load shipping data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenTrackingModal = (orderId: string, currentCarrier = '', currentTracking = '') => {
    setTrackingModal({
      isOpen: true,
      orderId,
      carrier: currentCarrier,
      trackingNumber: currentTracking
    })
  }

  const handleSaveTracking = async () => {
    if (!trackingModal.orderId || !trackingModal.carrier || !trackingModal.trackingNumber) return

    try {
      await updateShipmentTracking(trackingModal.orderId, trackingModal.carrier, trackingModal.trackingNumber)
      setTrackingModal({ ...trackingModal, isOpen: false })
      await loadData()
    } catch (error) {
      console.error('Failed to update tracking', error)
      alert('Erreur lors de la mise à jour du suivi')
    }
  }

  const handleGenerateLabel = async (orderId: string) => {
    try {
      await generateShippingLabel(orderId)
      await loadData()
      alert('Étiquette générée avec succès')
    } catch (error) {
      console.error('Failed to generate label', error)
      alert('Erreur lors de la génération de l\'étiquette')
    }
  }

  const handleBulkGenerateLabels = async () => {
    if (!confirm('Voulez-vous générer les étiquettes pour toutes les commandes en attente ?')) return
    
    try {
      const pending = pendingOrders.filter(o => !o.shipping || o.shipping.status === 'PENDING')
      for (const order of pending) {
        await generateShippingLabel(order.id)
      }
      await loadData()
      alert(`${pending.length} étiquettes générées`)
    } catch (error) {
      console.error('Failed to bulk generate labels', error)
      alert('Erreur lors de la génération en masse')
    }
  }

  const handleCreateRate = async () => {
    try {
      await createShippingRate({
        name: newRate.name,
        carrier: newRate.carrier,
        price: parseFloat(newRate.price),
        minWeight: parseFloat(newRate.minWeight),
        maxWeight: parseFloat(newRate.maxWeight),
        countries: newRate.countries.split(',').map(c => c.trim()),
        minDays: parseInt(newRate.minDays),
        maxDays: parseInt(newRate.maxDays),
        isActive: newRate.isActive
      })
      setShowRateModal(false)
      setNewRate({
        name: '',
        carrier: '',
        price: '',
        minWeight: '',
        maxWeight: '',
        countries: '',
        minDays: '',
        maxDays: '',
        isActive: true
      })
      await loadData()
    } catch (error) {
      console.error('Failed to create rate', error)
      alert('Erreur lors de la création du tarif')
    }
  }

  const handleToggleRate = async (id: string, isActive: boolean) => {
    try {
      await updateShippingRate(id, { isActive: !isActive })
      await loadData()
    } catch (error) {
      console.error('Failed to update rate', error)
    }
  }

  const handleDeleteRate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return
    try {
      await deleteShippingRate(id)
      await loadData()
    } catch (error) {
      console.error('Failed to delete rate', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* ... (existing JSX) ... */}

      {activeTab === 'pending' && (
        <>
          {/* ... (existing stats cards) ... */}

          {/* Liste des expéditions en attente */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Commandes à expédier</CardTitle>
                {pendingOrders.length > 0 && (
                  <Button onClick={handleBulkGenerateLabels}>
                    <Printer className="h-4 w-4 mr-2" />
                    Générer toutes les étiquettes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.filter(o => !o.shipping || o.shipping.status === 'PENDING' || o.shipping.status === 'IN_TRANSIT').map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <Badge variant="outline">{order.items.length} article(s)</Badge>
                          {order.shipping?.status && (
                            <Badge className={statusConfig[order.shipping.status as ShippingStatus]?.color}>
                              {statusConfig[order.shipping.status as ShippingStatus]?.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.user?.name || order.guestName || 'Client'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {order.shippingAddress}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingZip} {order.shippingCity}, {order.shippingCountry}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      {/* Bouton Étiquette (Simulation) */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateLabel(order.id)}
                        title="Générer étiquette (Simulé)"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>

                      {/* Bouton Suivi Manuel */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenTrackingModal(order.id)}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Suivi
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingOrders.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">Aucune commande en attente.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ... (existing rates tab) ... */}
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
              {shippingRates.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucun tarif de livraison configuré.</p>
                  <Button className="mt-4" onClick={() => setShowRateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un tarif
                  </Button>
                </div>
              ) : (
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
                        <tr key={rate.id} className="border-b hover:bg-muted/50">
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
                            <Badge
                              className={`cursor-pointer ${rate.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                              onClick={() => handleToggleRate(rate.id, rate.isActive)}
                            >
                              {rate.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteRate(rate.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                  <Input
                    placeholder="Standard"
                    className="mt-1"
                    value={newRate.name}
                    onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Transporteur</label>
                  <Input
                    placeholder="Colissimo"
                    className="mt-1"
                    value={newRate.carrier}
                    onChange={(e) => setNewRate({ ...newRate, carrier: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Prix (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="4.99"
                    className="mt-1"
                    value={newRate.price}
                    onChange={(e) => setNewRate({ ...newRate, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Poids min (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    className="mt-1"
                    value={newRate.minWeight}
                    onChange={(e) => setNewRate({ ...newRate, minWeight: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Poids max (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="5"
                    className="mt-1"
                    value={newRate.maxWeight}
                    onChange={(e) => setNewRate({ ...newRate, maxWeight: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Pays (codes séparés par virgule)</label>
                <Input
                  placeholder="FR, BE, CH"
                  className="mt-1"
                  value={newRate.countries}
                  onChange={(e) => setNewRate({ ...newRate, countries: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Délai min (jours)</label>
                  <Input
                    type="number"
                    placeholder="3"
                    className="mt-1"
                    value={newRate.minDays}
                    onChange={(e) => setNewRate({ ...newRate, minDays: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Délai max (jours)</label>
                  <Input
                    type="number"
                    placeholder="5"
                    className="mt-1"
                    value={newRate.maxDays}
                    onChange={(e) => setNewRate({ ...newRate, maxDays: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newRate.isActive}
                  onChange={(e) => setNewRate({ ...newRate, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm">Actif</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateRate}>
                  Créer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Suivi Manuel */}
      {trackingModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ajouter un numéro de suivi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Transporteur</label>
                <Input
                  placeholder="Colissimo, UPS, DHL..."
                  className="mt-1"
                  value={trackingModal.carrier}
                  onChange={(e) => setTrackingModal({ ...trackingModal, carrier: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Numéro de suivi</label>
                <Input
                  placeholder="123456789"
                  className="mt-1"
                  value={trackingModal.trackingNumber}
                  onChange={(e) => setTrackingModal({ ...trackingModal, trackingNumber: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setTrackingModal({ ...trackingModal, isOpen: false })}>
                  Annuler
                </Button>
                <Button onClick={handleSaveTracking}>
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
