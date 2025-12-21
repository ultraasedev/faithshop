'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Palette,
  Shirt,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Truck,
  Eye,
  Edit,
  Play,
  Pause,
  RotateCcw,
  User,
  Calendar,
  MapPin,
  FileText,
  Image as ImageIcon,
  Printer
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

type ProductionStatus =
  | 'PENDING'           // En attente de production
  | 'DESIGN_READY'      // Design prêt
  | 'PRINTING'          // En cours d'impression
  | 'QUALITY_CHECK'     // Contrôle qualité
  | 'PACKAGING'         // Emballage
  | 'SHIPPED'           // Expédié
  | 'DELIVERED'         // Livré
  | 'CANCELLED'         // Annulé
  | 'QUALITY_ISSUE'     // Problème qualité

interface ProductionOrder {
  id: string
  orderNumber: string
  status: ProductionStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'

  // Informations client
  customer: {
    name: string
    email: string
    address: string
    avatar?: string
  }

  // Détails du produit
  product: {
    name: string
    design: string
    designUrl: string
    size: string
    color: string
    quantity: number
    baseProduct: string // T-shirt, Hoodie, etc.
    printMethod: 'dtg' | 'vinyl' | 'embroidery' | 'sublimation'
    specialInstructions?: string
  }

  // Timeline de production
  timeline: {
    ordered: Date
    designReady?: Date
    printingStarted?: Date
    qualityChecked?: Date
    packaged?: Date
    shipped?: Date
    delivered?: Date
    estimatedDelivery: Date
  }

  // Assignations
  assignedTo?: {
    designer?: string
    printer?: string
    qa?: string
    packager?: string
  }

  // Coûts
  costs: {
    baseProduct: number
    printing: number
    materials: number
    labor: number
    shipping: number
    total: number
  }

  // Notes et historique
  notes: Array<{
    id: string
    date: Date
    user: string
    message: string
    type: 'info' | 'warning' | 'error'
  }>
}

const statusConfig: Record<ProductionStatus, {
  label: string
  color: string
  icon: React.ElementType
  description: string
  progress: number
}> = {
  PENDING: {
    label: 'En attente',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
    description: 'Commande reçue, en attente de traitement',
    progress: 0
  },
  DESIGN_READY: {
    label: 'Design prêt',
    color: 'bg-blue-100 text-blue-800',
    icon: Palette,
    description: 'Design validé, prêt pour impression',
    progress: 15
  },
  PRINTING: {
    label: 'Impression',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Printer,
    description: 'Produit en cours d\'impression',
    progress: 40
  },
  QUALITY_CHECK: {
    label: 'Contrôle qualité',
    color: 'bg-purple-100 text-purple-800',
    icon: Eye,
    description: 'Vérification de la qualité du produit',
    progress: 70
  },
  PACKAGING: {
    label: 'Emballage',
    color: 'bg-orange-100 text-orange-800',
    icon: Package,
    description: 'Préparation du colis',
    progress: 85
  },
  SHIPPED: {
    label: 'Expédié',
    color: 'bg-green-100 text-green-800',
    icon: Truck,
    description: 'Colis en route vers le client',
    progress: 95
  },
  DELIVERED: {
    label: 'Livré',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Commande livrée au client',
    progress: 100
  },
  CANCELLED: {
    label: 'Annulé',
    color: 'bg-red-100 text-red-800',
    icon: RotateCcw,
    description: 'Commande annulée',
    progress: 0
  },
  QUALITY_ISSUE: {
    label: 'Problème qualité',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    description: 'Problème de qualité détecté',
    progress: 70
  }
}

const printMethods = {
  dtg: 'Direct to Garment',
  vinyl: 'Vinyl/Flex',
  embroidery: 'Broderie',
  sublimation: 'Sublimation'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export default function ProductionManager() {
  const [orders, setOrders] = useState<ProductionOrder[]>([
    // Données d'exemple pour Faith Shop
    {
      id: '1',
      orderNumber: 'FAITH-2024-001',
      status: 'PRINTING',
      priority: 'high',
      customer: {
        name: 'Marie Dubois',
        email: 'marie@email.com',
        address: 'Lyon, France',
        avatar: '/avatars/marie.jpg'
      },
      product: {
        name: 'T-shirt Faith "Blessed"',
        design: 'Design Blessed V1',
        designUrl: '/designs/blessed-v1.png',
        size: 'M',
        color: 'Blanc',
        quantity: 2,
        baseProduct: 'T-shirt Premium Bio',
        printMethod: 'dtg',
        specialInstructions: 'Impression centrée, haute qualité'
      },
      timeline: {
        ordered: new Date('2024-03-15T10:00:00'),
        designReady: new Date('2024-03-15T14:00:00'),
        printingStarted: new Date('2024-03-16T09:00:00'),
        estimatedDelivery: new Date('2024-03-20T17:00:00')
      },
      assignedTo: {
        designer: 'Sophie L.',
        printer: 'Marc P.',
        qa: 'Julie R.'
      },
      costs: {
        baseProduct: 8.50,
        printing: 4.20,
        materials: 1.30,
        labor: 3.00,
        shipping: 4.99,
        total: 21.99
      },
      notes: [
        {
          id: '1',
          date: new Date('2024-03-15T14:30:00'),
          user: 'Sophie L.',
          message: 'Design validé par le client, procéder à l\'impression',
          type: 'info'
        },
        {
          id: '2',
          date: new Date('2024-03-16T09:15:00'),
          user: 'Marc P.',
          message: 'Impression démarrée sur DTG Epson',
          type: 'info'
        }
      ]
    }
  ])

  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  const [filter, setFilter] = useState<ProductionStatus | 'ALL'>('ALL')

  const updateOrderStatus = (orderId: string, newStatus: ProductionStatus) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? {
            ...order,
            status: newStatus,
            timeline: {
              ...order.timeline,
              [getTimelineKey(newStatus)]: new Date()
            }
          }
        : order
    ))
  }

  const getTimelineKey = (status: ProductionStatus): keyof ProductionOrder['timeline'] | null => {
    switch (status) {
      case 'DESIGN_READY': return 'designReady'
      case 'PRINTING': return 'printingStarted'
      case 'QUALITY_CHECK': return 'qualityChecked'
      case 'PACKAGING': return 'packaged'
      case 'SHIPPED': return 'shipped'
      case 'DELIVERED': return 'delivered'
      default: return null
    }
  }

  const addNote = (orderId: string, message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? {
            ...order,
            notes: [
              ...order.notes,
              {
                id: Date.now().toString(),
                date: new Date(),
                user: 'Utilisateur actuel', // À remplacer par l'utilisateur connecté
                message,
                type
              }
            ]
          }
        : order
    ))
  }

  const filteredOrders = orders.filter(order =>
    filter === 'ALL' || order.status === filter
  )

  const getStatusStats = () => {
    const stats = Object.keys(statusConfig).reduce((acc, status) => {
      acc[status] = orders.filter(order => order.status === status).length
      return acc
    }, {} as Record<string, number>)

    stats.ALL = orders.length
    return stats
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion de Production</h2>
          <p className="text-muted-foreground">
            Faith Shop - Suivi des commandes print-on-demand
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Rapport production
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Démarrer production
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className={`cursor-pointer transition-all ${filter === 'ALL' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.ALL}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>

        {(['PENDING', 'PRINTING', 'QUALITY_CHECK', 'PACKAGING', 'SHIPPED'] as ProductionStatus[]).map(status => {
          const config = statusConfig[status]
          return (
            <Card
              key={status}
              className={`cursor-pointer transition-all ${filter === status ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter(status)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats[status] || 0}</div>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                  <config.icon className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des commandes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Commandes en production ({filteredOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  const config = statusConfig[order.status]
                  return (
                    <Card
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={order.customer.avatar} />
                              <AvatarFallback>
                                {order.customer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{order.orderNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.customer.name}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={priorityColors[order.priority]}>
                              {order.priority}
                            </Badge>
                            <Badge className={config.color}>
                              <config.icon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {order.product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.product.size} • {order.product.color} • {printMethods[order.product.printMethod]}
                            </div>
                          </div>

                          {order.product.designUrl && (
                            <img
                              src={order.product.designUrl}
                              alt="Design"
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progression</span>
                            <span>{config.progress}%</span>
                          </div>
                          <Progress value={config.progress} className="h-1" />
                        </div>

                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span className="text-muted-foreground">
                            Livraison prévue: {order.timeline.estimatedDelivery.toLocaleDateString('fr-FR')}
                          </span>
                          <span className="font-medium">
                            {order.costs.total.toFixed(2)} € (coût)
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {filteredOrders.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shirt className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">Aucune commande</p>
                    <p className="text-sm">
                      {filter === 'ALL'
                        ? 'Aucune commande en production actuellement'
                        : `Aucune commande avec le statut "${statusConfig[filter as ProductionStatus]?.label}"`
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détails de la commande sélectionnée */}
        <div>
          {selectedOrder ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedOrder.orderNumber}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Détails</TabsTrigger>
                    <TabsTrigger value="production">Production</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Client</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedOrder.customer.avatar} />
                          <AvatarFallback className="text-xs">
                            {selectedOrder.customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{selectedOrder.customer.name}</div>
                          <div className="text-xs text-muted-foreground">{selectedOrder.customer.email}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Produit</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex justify-between text-sm">
                          <span>Nom:</span>
                          <span className="font-medium">{selectedOrder.product.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taille:</span>
                          <span>{selectedOrder.product.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Couleur:</span>
                          <span>{selectedOrder.product.color}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Quantité:</span>
                          <span>{selectedOrder.product.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Méthode:</span>
                          <span>{printMethods[selectedOrder.product.printMethod]}</span>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.product.designUrl && (
                      <div>
                        <Label className="text-sm font-medium">Design</Label>
                        <div className="mt-1">
                          <img
                            src={selectedOrder.product.designUrl}
                            alt="Design preview"
                            className="w-full max-w-32 h-32 object-cover rounded border"
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="production" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Statut actuel</Label>
                      <div className="mt-2">
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as ProductionStatus)}
                          className="w-full p-2 text-sm border rounded-md"
                        >
                          {Object.entries(statusConfig).map(([status, config]) => (
                            <option key={status} value={status}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Équipe assignée</Label>
                      <div className="space-y-2 mt-1">
                        {[
                          { role: 'Designer', person: selectedOrder.assignedTo?.designer },
                          { role: 'Imprimeur', person: selectedOrder.assignedTo?.printer },
                          { role: 'Contrôle qualité', person: selectedOrder.assignedTo?.qa },
                          { role: 'Emballage', person: selectedOrder.assignedTo?.packager }
                        ].map(({ role, person }, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{role}:</span>
                            <span className={person ? 'font-medium' : 'text-muted-foreground'}>
                              {person || 'Non assigné'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Coûts de production</Label>
                      <div className="space-y-1 mt-1 text-xs">
                        {[
                          { label: 'Produit de base', amount: selectedOrder.costs.baseProduct },
                          { label: 'Impression', amount: selectedOrder.costs.printing },
                          { label: 'Matériaux', amount: selectedOrder.costs.materials },
                          { label: 'Main d\'œuvre', amount: selectedOrder.costs.labor },
                          { label: 'Expédition', amount: selectedOrder.costs.shipping }
                        ].map(({ label, amount }, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{label}:</span>
                            <span>{amount.toFixed(2)} €</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total:</span>
                          <span>{selectedOrder.costs.total.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Ajouter une note</Label>
                      <div className="mt-1 space-y-2">
                        <Input
                          placeholder="Note de production..."
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => addNote(selectedOrder.id, 'Note ajoutée')}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Historique</Label>
                      <div className="space-y-3 mt-2">
                        {selectedOrder.notes.map(note => (
                          <div key={note.id} className="text-xs border-l-2 border-muted pl-3">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{note.user}</span>
                              <span className="text-muted-foreground">
                                {note.date.toLocaleDateString('fr-FR')} {note.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mt-1">{note.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Shirt className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Sélectionnez une commande</p>
                  <p className="text-sm">pour voir les détails de production</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}