'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  UserPlus,
  UserCheck,
  ShoppingBag,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Eye,
  MessageSquare,
  Heart,
  Star,
  Download,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  zipCode: string | null
  country: string
  image: string | null
  emailVerified: boolean
  createdAt: Date
  totalOrders: number
  totalSpent: number
  lastOrderDate: Date | null
  reviewCount: number
  wishlistCount: number
}

interface CustomerStats {
  totalCustomers: number
  newThisMonth: number
  activeCustomers: number
  averageSpent: number
}

interface CustomersClientProps {
  customers: Customer[]
  stats: CustomerStats
}

type SortField = 'name' | 'createdAt' | 'totalOrders' | 'totalSpent'
type SortOrder = 'asc' | 'desc'
type FilterStatus = 'all' | 'active' | 'inactive' | 'verified'

export function CustomersClient({ customers, stats }: CustomersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery) ||
        customer.city?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'active' && customer.totalOrders > 0) ||
        (filterStatus === 'inactive' && customer.totalOrders === 0) ||
        (filterStatus === 'verified' && customer.emailVerified)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'totalOrders':
          comparison = a.totalOrders - b.totalOrders
          break
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(cId => cId !== id))
    } else {
      setSelectedCustomers([...selectedCustomers, id])
    }
  }

  const exportToCSV = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Ville', 'Commandes', 'Total dépensé', 'Inscrit le']
    const rows = filteredCustomers.map(c => [
      c.name,
      c.email,
      c.phone || '',
      c.city || '',
      c.totalOrders,
      c.totalSpent.toFixed(2),
      format(new Date(c.createdAt), 'dd/MM/yyyy')
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `clients_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const kpiCards = [
    {
      title: 'Total clients',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Nouveaux ce mois',
      value: stats.newThisMonth,
      icon: UserPlus,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Clients actifs',
      value: stats.activeCustomers,
      subValue: `${Math.round((stats.activeCustomers / stats.totalCustomers) * 100 || 0)}%`,
      icon: UserCheck,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Panier moyen',
      value: `${stats.averageSpent.toFixed(2)} €`,
      icon: ShoppingBag,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Gérez vos clients et consultez leurs statistiques
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", kpi.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {kpi.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {kpi.title}
                  </p>
                </div>
                {kpi.subValue && (
                  <p className="mt-2 text-xs text-gray-400">{kpi.subValue}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email, téléphone, ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                <SelectItem value="active">Clients actifs</SelectItem>
                <SelectItem value="inactive">Sans commande</SelectItem>
                <SelectItem value="verified">Email vérifié</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>
              {filteredCustomers.length} client{filteredCustomers.length > 1 ? 's' : ''}
            </CardTitle>
            {selectedCustomers.length > 0 && (
              <p className="text-sm text-gray-500">
                {selectedCustomers.length} sélectionné{selectedCustomers.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                    >
                      Client
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Localisation</TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('totalOrders')}
                      className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                    >
                      Commandes
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('totalSpent')}
                      className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                    >
                      Total
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    <button
                      onClick={() => toggleSort('createdAt')}
                      className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                    >
                      Inscrit
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="group"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => toggleSelect(customer.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-white font-medium",
                          customer.totalSpent > 500
                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                            : customer.totalSpent > 200
                            ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                            : "bg-gradient-to-br from-gray-600 to-gray-800"
                        )}>
                          {customer.image ? (
                            <img
                              src={customer.image}
                              alt={customer.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            customer.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </span>
                            {customer.emailVerified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {customer.totalSpent > 500 && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-3.5 w-3.5" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {customer.city ? `${customer.city}, ${customer.country}` : customer.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{customer.totalOrders}</span>
                        {customer.lastOrderDate && (
                          <span className="text-xs text-gray-400">
                            (il y a {formatDistanceToNow(new Date(customer.lastOrderDate), { locale: fr })})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {customer.totalSpent.toFixed(2)} €
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm text-gray-500">
                        {format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/customers/${customer.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le profil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders?customer=${customer.id}`}>
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Voir les commandes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${customer.email}`}>
                              <Mail className="h-4 w-4 mr-2" />
                              Envoyer un email
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun client trouvé
                      </h3>
                      <p className="text-gray-500">
                        {searchQuery || filterStatus !== 'all'
                          ? 'Essayez de modifier vos filtres'
                          : 'Les clients apparaîtront ici après leur inscription'}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
