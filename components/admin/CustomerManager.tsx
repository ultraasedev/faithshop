'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  Euro,
  Eye,
  Edit,
  UserPlus,
  Filter,
  Download
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  role: string
  createdAt: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
}

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    loadCustomers()
    loadStats()
  }, [])

  const loadCustomers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/customers/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur chargement stats clients:', error)
    }
  }

  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || customer.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'totalSpent':
          return b.totalSpent - a.totalSpent
        case 'totalOrders':
          return b.totalOrders - a.totalOrders
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const exportCustomers = () => {
    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Ville', 'Commandes', 'Total dépensé', 'Inscription'].join(','),
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone || '',
        customer.city || '',
        customer.totalOrders,
        customer.totalSpent,
        new Date(customer.createdAt).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getCustomerSegment = (customer: Customer) => {
    if (customer.totalSpent > 500) return { label: 'VIP', color: 'bg-purple-100 text-purple-800' }
    if (customer.totalSpent > 200) return { label: 'Fidèle', color: 'bg-blue-100 text-blue-800' }
    if (customer.totalOrders > 0) return { label: 'Actif', color: 'bg-green-100 text-green-800' }
    return { label: 'Nouveau', color: 'bg-gray-100 text-gray-800' }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des clients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Base de données clients avec {customers.length} profils
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportCustomers}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCustomers || customers.length}
            </p>
            <p className="text-xs text-gray-600 font-medium">Clients total</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <UserPlus className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.newThisMonth || 0}
            </p>
            <p className="text-xs text-gray-600 font-medium">Nouveaux ce mois</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Euro className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              €{stats.averageSpent || 0}
            </p>
            <p className="text-xs text-gray-600 font-medium">Panier moyen</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.activeCustomers || 0}
            </p>
            <p className="text-xs text-gray-600 font-medium">Clients actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="USER">Clients</SelectItem>
                <SelectItem value="ADMIN">Administrateurs</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date d'inscription</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="totalSpent">Montant dépensé</SelectItem>
                <SelectItem value="totalOrders">Nombre de commandes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => {
          const segment = getCustomerSegment(customer)

          return (
            <Card key={customer.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {customer.name}
                          </h3>
                          <Badge className={segment.color}>
                            {segment.label}
                          </Badge>
                          {customer.role === 'ADMIN' && (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {customer.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Inscrit</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCart className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Commandes</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {customer.totalOrders} commande(s)
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Euro className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Total dépensé</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          €{customer.totalSpent.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Localisation</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {customer.city || 'Non renseignée'}
                        </p>
                      </div>
                    </div>

                    {(customer.phone || customer.address) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{customer.phone}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {customer.address}, {customer.zipCode} {customer.city}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={`mailto:${customer.email}`}>
                        <Mail className="h-3 w-3 mr-1" />
                        Contact
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun client trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || roleFilter !== 'all'
                ? 'Aucun client ne correspond à vos filtres.'
                : 'Vos premiers clients apparaîtront ici.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Profil de {selectedCustomer.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Client depuis le {new Date(selectedCustomer.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Informations personnelles
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedCustomer.email}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone:</span>
                        <span className="font-medium">{selectedCustomer.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rôle:</span>
                      <Badge variant="outline">{selectedCustomer.role}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Statistiques d'achat
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commandes:</span>
                      <span className="font-medium">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total dépensé:</span>
                      <span className="font-medium">€{selectedCustomer.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Panier moyen:</span>
                      <span className="font-medium">
                        €{selectedCustomer.totalOrders > 0 ? (selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    {selectedCustomer.lastOrderDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dernière commande:</span>
                        <span className="font-medium">
                          {new Date(selectedCustomer.lastOrderDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedCustomer.address && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Adresse
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    <p>{selectedCustomer.address}</p>
                    <p>{selectedCustomer.zipCode} {selectedCustomer.city}</p>
                    {selectedCustomer.country && <p>{selectedCustomer.country}</p>}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" onClick={() => setSelectedCustomer(null)}>
                  Fermer
                </Button>
                <Button variant="outline" asChild>
                  <a href={`mailto:${selectedCustomer.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer un email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}