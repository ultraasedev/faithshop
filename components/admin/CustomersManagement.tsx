'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Users,
  UserCheck,
  Star,
  Gift
} from 'lucide-react'

interface CustomersManagementProps {
  customers: any[]
}

export function CustomersManagement({ customers: initialCustomers }: CustomersManagementProps) {
  const [customers] = useState(initialCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<string>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  // Customer segmentation logic
  const getCustomerSegment = (customer: any) => {
    const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + order.total, 0)
    const orderCount = customer.orders.length
    const daysSinceLastOrder = customer.orders.length > 0
      ? Math.floor((new Date().getTime() - new Date(customer.orders[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : null

    if (totalSpent > 500) return 'vip'
    if (orderCount >= 3) return 'loyal'
    if (daysSinceLastOrder !== null && daysSinceLastOrder <= 30) return 'active'
    if (orderCount === 0) return 'prospect'
    return 'new'
  }

  const segmentConfig = {
    vip: { label: 'VIP', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Star },
    loyal: { label: 'Fidèle', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserCheck },
    active: { label: 'Actif', color: 'bg-green-100 text-green-800 border-green-200', icon: TrendingUp },
    new: { label: 'Nouveau', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Gift },
    prospect: { label: 'Prospect', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Users }
  }

  const enrichedCustomers = useMemo(() => {
    return customers.map(customer => {
      const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + order.total, 0)
      const orderCount = customer.orders.length
      const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0
      const lastOrderDate = customer.orders.length > 0 ? customer.orders[0].createdAt : null
      const segment = getCustomerSegment(customer)

      return {
        ...customer,
        totalSpent,
        orderCount,
        averageOrderValue,
        lastOrderDate,
        segment
      }
    })
  }, [customers])

  const filteredCustomers = enrichedCustomers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.city?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSegment = segmentFilter === 'all' || customer.segment === segmentFilter

    return matchesSearch && matchesSegment
  })

  const getSegmentStats = () => {
    const stats = {
      all: enrichedCustomers.length,
      vip: 0,
      loyal: 0,
      active: 0,
      new: 0,
      prospect: 0
    }

    enrichedCustomers.forEach(customer => {
      stats[customer.segment as keyof typeof stats]++
    })

    return stats
  }

  const getOverallStats = () => {
    const totalRevenue = enrichedCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0)
    const totalOrders = enrichedCustomers.reduce((sum, customer) => sum + customer.orderCount, 0)
    const averageCustomerValue = enrichedCustomers.length > 0 ? totalRevenue / enrichedCustomers.length : 0
    const activeCustomers = enrichedCustomers.filter(c => c.segment === 'active' || c.segment === 'vip' || c.segment === 'loyal').length

    return {
      totalRevenue,
      totalOrders,
      averageCustomerValue,
      activeCustomers
    }
  }

  const segmentStats = getSegmentStats()
  const overallStats = getOverallStats()

  const getSegmentBadge = (segment: string) => {
    const config = segmentConfig[segment as keyof typeof segmentConfig] || segmentConfig.new
    const SegmentIcon = config.icon

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <SegmentIcon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredCustomers.length} client(s) • {overallStats.activeCustomers} actif(s)
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-200">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" className="border-gray-200">
            <Mail className="h-4 w-4 mr-2" />
            Email groupé
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {enrichedCustomers.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total clients
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                €{overallStats.totalRevenue.toFixed(0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chiffre d'affaires total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                €{overallStats.averageCustomerValue.toFixed(0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Valeur moyenne client
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {overallStats.totalOrders}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Commandes totales
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Tabs */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'vip', label: 'VIP' },
          { key: 'loyal', label: 'Fidèles' },
          { key: 'active', label: 'Actifs' },
          { key: 'new', label: 'Nouveaux' },
          { key: 'prospect', label: 'Prospects' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSegmentFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
              segmentFilter === tab.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              segmentFilter === tab.key ? 'bg-gray-700' : 'bg-gray-200 dark:bg-gray-600'
            }`}>
              {segmentStats[tab.key as keyof typeof segmentStats]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, email ou ville..."
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <Card
            key={customer.id}
            className="border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">
                        {customer.name?.charAt(0)?.toUpperCase() || customer.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {customer.name || 'Nom non renseigné'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Inscrit le {new Date(customer.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Segment</p>
                      {getSegmentBadge(customer.segment)}
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Commandes</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.orderCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Total dépensé</p>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        €{customer.totalSpent.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Panier moyen</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        €{customer.averageOrderValue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Localisation</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.city && customer.country
                          ? `${customer.city}, ${customer.country}`
                          : 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun client trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || segmentFilter !== 'all'
                ? 'Aucun client ne correspond à vos critères de recherche.'
                : 'Aucun client ne s\'est encore inscrit.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedCustomer.name || 'Client'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Client depuis le {new Date(selectedCustomer.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Customer Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-20 w-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-gray-600">
                      {selectedCustomer.name?.charAt(0)?.toUpperCase() || selectedCustomer.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedCustomer.name || 'Nom non renseigné'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCustomer.email}</p>
                  {getSegmentBadge(selectedCustomer.segment)}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Statistiques</h4>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Commandes</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedCustomer.orderCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total dépensé</p>
                    <p className="font-bold text-gray-900 dark:text-white">€{selectedCustomer.totalSpent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Panier moyen</p>
                    <p className="font-bold text-gray-900 dark:text-white">€{selectedCustomer.averageOrderValue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Informations</h4>
                  {selectedCustomer.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {selectedCustomer.city && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.city}, {selectedCustomer.country}</span>
                    </div>
                  )}
                  {selectedCustomer.lastOrderDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Dernière commande: {new Date(selectedCustomer.lastOrderDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order History */}
              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Historique des commandes
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedCustomer.orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Commande #{order.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            €{order.total.toFixed(2)}
                          </p>
                          <Badge className={
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </Button>
                <Button variant="outline" size="sm">
                  <Gift className="h-4 w-4 mr-2" />
                  Offrir un bon de réduction
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter données
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}