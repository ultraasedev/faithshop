'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  MoreVertical,
  Users,
  Calendar,
  ShoppingBag,
  DollarSign,
  MapPin,
  Phone
} from 'lucide-react'

interface AdminUsersProps {
  data: {
    products: any[]
    orders: any[]
    users: any[]
  }
  onUpdate: (newData: any) => void
}

export default function AdminUsers({ data, onUpdate }: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Calculate user stats
  const getUserStats = (userId: string) => {
    const userOrders = data.orders.filter(order => order.userId === userId)
    const totalSpent = userOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)

    return {
      totalOrders: userOrders.length,
      totalSpent,
      lastOrderDate: userOrders.length > 0
        ? Math.max(...userOrders.map(o => new Date(o.createdAt).getTime()))
        : null
    }
  }

  const getUserSegment = (userId: string) => {
    const stats = getUserStats(userId)

    if (stats.totalSpent > 500) {
      return { label: 'VIP', color: 'bg-purple-100 text-purple-700 border-purple-200' }
    }
    if (stats.totalSpent > 200) {
      return { label: 'Fidèle', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    }
    if (stats.totalOrders > 0) {
      return { label: 'Actif', color: 'bg-green-100 text-green-700 border-green-200' }
    }
    return { label: 'Nouveau', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  }

  const filteredUsers = data.users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const totalCustomers = data.users.length
  const newThisMonth = data.users.filter(user => {
    const userDate = new Date(user.createdAt)
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return userDate >= thisMonth
  }).length

  const activeCustomers = data.users.filter(user => {
    const userOrders = data.orders.filter(order => order.userId === user.id)
    return userOrders.length > 0
  }).length

  const totalRevenue = data.orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const averageOrderValue = data.orders.length > 0 ? totalRevenue / data.orders.length : 0

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredUsers.length} client(s) • {newThisMonth} nouveau(x) ce mois
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-200">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" className="border-gray-200">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nouveaux ce mois</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{newThisMonth}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clients actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCustomers}</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Panier moyen</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou email..."
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user.id)
          const segment = getUserSegment(user.id)

          return (
            <Card
              key={user.id}
              className="border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedUser(user)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user.name || 'Utilisateur'}
                        </h3>
                        <Badge className={`border text-xs ${segment.color}`}>
                          {segment.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {user.email}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Inscrit le</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Commandes</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stats.totalOrders} commande(s)
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Total dépensé</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            €{stats.totalSpent.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`mailto:${user.email}`, '_blank')
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedUser(user)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun client trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? 'Aucun client ne correspond à votre recherche.'
                : 'Vos clients apparaîtront ici une fois qu\'ils se seront inscrits.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Profil de {selectedUser.name || 'l\'utilisateur'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Client depuis le {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {(() => {
                const stats = getUserStats(selectedUser.id)
                const segment = getUserSegment(selectedUser.id)
                const userOrders = data.orders.filter(order => order.userId === selectedUser.id)

                return (
                  <>
                    {/* User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                          Informations personnelles
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{selectedUser.email}</span>
                          </div>
                          {selectedUser.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{selectedUser.phone}</span>
                            </div>
                          )}
                          {selectedUser.city && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{selectedUser.city}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <Badge className={`border ${segment.color}`}>
                              {segment.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                          Statistiques d'achat
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stats.totalOrders}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Commandes</p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              €{stats.totalSpent.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total dépensé</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Commandes récentes
                      </h3>
                      {userOrders.length > 0 ? (
                        <div className="space-y-3">
                          {userOrders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  #{order.orderNumber}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  €{Number(order.total).toFixed(2)}
                                </p>
                                <Badge variant="secondary" className="text-xs">
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">Aucune commande pour ce client.</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button className="flex-1" onClick={() => setSelectedUser(null)}>
                        Fermer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(`mailto:${selectedUser.email}`, '_blank')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer un email
                      </Button>
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}