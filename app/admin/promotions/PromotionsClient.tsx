'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Ticket,
  Gift,
  Plus,
  MoreHorizontal,
  Percent,
  DollarSign,
  Truck,
  Copy,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Tag
} from 'lucide-react'
import { format, isAfter, isBefore } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DiscountCode {
  id: string
  code: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minPurchase: number | null
  maxDiscount: number | null
  usageLimit: number | null
  currentUsage: number
  startsAt: Date
  expiresAt: Date | null
  isActive: boolean
  firstTimeCustomer: boolean
  autoApply: boolean
  createdAt: Date
  createdBy: string | null
  totalSavings: number
  orderCount: number
}

interface GiftCard {
  id: string
  code: string
  amount: number
  balance: number
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED'
  isActive: boolean
  recipientEmail: string | null
  recipientName: string | null
  purchaserEmail: string | null
  purchaserName: string | null
  message: string | null
  expiresAt: Date | null
  createdAt: Date
  usedAmount: number
}

interface Stats {
  activeDiscountCodes: number
  totalDiscountUsages: number
  totalDiscountSavings: number
  activeGiftCards: number
  totalGiftCardBalance: number
  totalGiftCardValue: number
}

interface PromotionsClientProps {
  discountCodes: DiscountCode[]
  giftCards: GiftCard[]
  stats: Stats
}

export function PromotionsClient({ discountCodes, giftCards, stats }: PromotionsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('discounts')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreatingDiscount, setIsCreatingDiscount] = useState(false)
  const [isCreatingGiftCard, setIsCreatingGiftCard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'discount' | 'giftcard'; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [discountForm, setDiscountForm] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    usageLimitPerUser: '',
    expiresAt: '',
    firstTimeCustomer: false,
    combinableWithOthers: false
  })

  const [giftCardForm, setGiftCardForm] = useState({
    amount: '',
    recipientEmail: '',
    recipientName: '',
    message: '',
    quantity: '1'
  })

  const generateCode = (prefix: string = 'PROMO') => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}${random}`
  }

  const handleCreateDiscount = async () => {
    if (!discountForm.code) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...discountForm,
          value: parseFloat(discountForm.value) || 0,
          minPurchase: discountForm.minPurchase ? parseFloat(discountForm.minPurchase) : null,
          maxDiscount: discountForm.maxDiscount ? parseFloat(discountForm.maxDiscount) : null,
          usageLimit: discountForm.usageLimit ? parseInt(discountForm.usageLimit) : null,
          usageLimitPerUser: discountForm.usageLimitPerUser ? parseInt(discountForm.usageLimitPerUser) : null,
          expiresAt: discountForm.expiresAt || null
        })
      })

      if (res.ok) {
        setIsCreatingDiscount(false)
        setDiscountForm({
          code: '',
          description: '',
          type: 'PERCENTAGE',
          value: '',
          minPurchase: '',
          maxDiscount: '',
          usageLimit: '',
          usageLimitPerUser: '',
          expiresAt: '',
          firstTimeCustomer: false,
          combinableWithOthers: false
        })
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGiftCard = async () => {
    if (!giftCardForm.amount) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(giftCardForm.amount),
          recipientEmail: giftCardForm.recipientEmail || null,
          recipientName: giftCardForm.recipientName || null,
          message: giftCardForm.message || null,
          quantity: parseInt(giftCardForm.quantity) || 1
        })
      })

      if (res.ok) {
        setIsCreatingGiftCard(false)
        setGiftCardForm({
          amount: '',
          recipientEmail: '',
          recipientName: '',
          message: '',
          quantity: '1'
        })
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDiscountStatus = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/admin/discount-codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus })
    })
    router.refresh()
  }

  const openDeleteDialog = (id: string, type: 'discount' | 'giftcard', name: string) => {
    setItemToDelete({ id, type, name })
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      const endpoint = itemToDelete.type === 'discount'
        ? `/api/admin/discount-codes/${itemToDelete.id}`
        : `/api/admin/gift-cards/${itemToDelete.id}`

      await fetch(endpoint, { method: 'DELETE' })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const getDiscountStatus = (code: DiscountCode) => {
    if (!code.isActive) return { label: 'Désactivé', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' }
    if (code.expiresAt && isBefore(new Date(code.expiresAt), new Date())) {
      return { label: 'Expiré', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    }
    if (code.usageLimit && code.currentUsage >= code.usageLimit) {
      return { label: 'Épuisé', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
    }
    return { label: 'Actif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent className="h-4 w-4" />
      case 'FIXED_AMOUNT': return <DollarSign className="h-4 w-4" />
      case 'FREE_SHIPPING': return <Truck className="h-4 w-4" />
      default: return <Tag className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'Pourcentage'
      case 'FIXED_AMOUNT': return 'Montant fixe'
      case 'FREE_SHIPPING': return 'Livraison gratuite'
      default: return type
    }
  }

  const filteredDiscounts = discountCodes.filter(code =>
    code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredGiftCards = giftCards.filter(card =>
    card.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.recipientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Promotions
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Codes de réduction et cartes cadeaux
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDiscountCodes}</p>
                <p className="text-xs text-gray-500">Codes actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDiscountUsages}</p>
                <p className="text-xs text-gray-500">Utilisations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Percent className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDiscountSavings.toFixed(0)} €</p>
                <p className="text-xs text-gray-500">Économies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeGiftCards}</p>
                <p className="text-xs text-gray-500">Cartes actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGiftCardBalance.toFixed(0)} €</p>
                <p className="text-xs text-gray-500">Solde total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <Tag className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGiftCardValue.toFixed(0)} €</p>
                <p className="text-xs text-gray-500">Valeur émise</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList className="bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
            <TabsTrigger
              value="discounts"
              className="gap-2 text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <Ticket className="h-4 w-4" />
              Codes promo
            </TabsTrigger>
            <TabsTrigger
              value="giftcards"
              className="gap-2 text-gray-600 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <Gift className="h-4 w-4" />
              Cartes cadeaux
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {activeTab === 'discounts' ? (
              <Dialog open={isCreatingDiscount} onOpenChange={setIsCreatingDiscount}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nouveau code</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un code promo</DialogTitle>
                    <DialogDescription>
                      Créez un code de réduction avec Stripe sync
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>Code</Label>
                        <Input
                          value={discountForm.code}
                          onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                          placeholder="SUMMER20"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="mt-8"
                        onClick={() => setDiscountForm({ ...discountForm, code: generateCode() })}
                      >
                        Générer
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={discountForm.description}
                        onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                        placeholder="Soldes d'été -20%"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={discountForm.type}
                          onValueChange={(v) => setDiscountForm({ ...discountForm, type: v as typeof discountForm.type })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                            <SelectItem value="FIXED_AMOUNT">Montant fixe</SelectItem>
                            <SelectItem value="FREE_SHIPPING">Livraison gratuite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {discountForm.type !== 'FREE_SHIPPING' && (
                        <div className="space-y-2">
                          <Label>{discountForm.type === 'PERCENTAGE' ? 'Pourcentage' : 'Montant (€)'}</Label>
                          <Input
                            type="number"
                            value={discountForm.value}
                            onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                            placeholder={discountForm.type === 'PERCENTAGE' ? '20' : '10'}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Achat minimum (€)</Label>
                        <Input
                          type="number"
                          value={discountForm.minPurchase}
                          onChange={(e) => setDiscountForm({ ...discountForm, minPurchase: e.target.value })}
                          placeholder="50"
                        />
                      </div>

                      {discountForm.type === 'PERCENTAGE' && (
                        <div className="space-y-2">
                          <Label>Réduction max (€)</Label>
                          <Input
                            type="number"
                            value={discountForm.maxDiscount}
                            onChange={(e) => setDiscountForm({ ...discountForm, maxDiscount: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Limite d'utilisation</Label>
                        <Input
                          type="number"
                          value={discountForm.usageLimit}
                          onChange={(e) => setDiscountForm({ ...discountForm, usageLimit: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Par utilisateur</Label>
                        <Input
                          type="number"
                          value={discountForm.usageLimitPerUser}
                          onChange={(e) => setDiscountForm({ ...discountForm, usageLimitPerUser: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date d'expiration</Label>
                      <Input
                        type="datetime-local"
                        value={discountForm.expiresAt}
                        onChange={(e) => setDiscountForm({ ...discountForm, expiresAt: e.target.value })}
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Nouveaux clients uniquement</p>
                          <p className="text-xs text-gray-500">Réservé aux premières commandes</p>
                        </div>
                        <Switch
                          checked={discountForm.firstTimeCustomer}
                          onCheckedChange={(checked) => setDiscountForm({ ...discountForm, firstTimeCustomer: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Cumulable</p>
                          <p className="text-xs text-gray-500">Peut être combiné avec d'autres codes</p>
                        </div>
                        <Switch
                          checked={discountForm.combinableWithOthers}
                          onCheckedChange={(checked) => setDiscountForm({ ...discountForm, combinableWithOthers: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingDiscount(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateDiscount} disabled={isLoading || !discountForm.code}>
                      {isLoading ? 'Création...' : 'Créer le code'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={isCreatingGiftCard} onOpenChange={setIsCreatingGiftCard}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nouvelle carte</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Créer une carte cadeau</DialogTitle>
                    <DialogDescription>
                      Générez des cartes cadeaux à envoyer
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Montant (€)</Label>
                        <Input
                          type="number"
                          value={giftCardForm.amount}
                          onChange={(e) => setGiftCardForm({ ...giftCardForm, amount: e.target.value })}
                          placeholder="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={giftCardForm.quantity}
                          onChange={(e) => setGiftCardForm({ ...giftCardForm, quantity: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email du destinataire (optionnel)</Label>
                      <Input
                        type="email"
                        value={giftCardForm.recipientEmail}
                        onChange={(e) => setGiftCardForm({ ...giftCardForm, recipientEmail: e.target.value })}
                        placeholder="destinataire@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nom du destinataire (optionnel)</Label>
                      <Input
                        value={giftCardForm.recipientName}
                        onChange={(e) => setGiftCardForm({ ...giftCardForm, recipientName: e.target.value })}
                        placeholder="Marie Dupont"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Message (optionnel)</Label>
                      <textarea
                        value={giftCardForm.message}
                        onChange={(e) => setGiftCardForm({ ...giftCardForm, message: e.target.value })}
                        placeholder="Joyeux anniversaire !"
                        className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingGiftCard(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateGiftCard} disabled={isLoading || !giftCardForm.amount}>
                      {isLoading ? 'Création...' : 'Créer la carte'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Discount Codes Tab */}
        <TabsContent value="discounts" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Valeur</TableHead>
                      <TableHead className="hidden md:table-cell">Conditions</TableHead>
                      <TableHead>Utilisations</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="hidden lg:table-cell">Économies</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDiscounts.map((code) => {
                      const status = getDiscountStatus(code)
                      return (
                        <TableRow key={code.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyCode(code.code)}
                                className="font-mono font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
                              >
                                {code.code}
                              </button>
                              <button
                                onClick={() => copyCode(code.code)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                              >
                                <Copy className="h-3.5 w-3.5 text-gray-400" />
                              </button>
                            </div>
                            {code.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{code.description}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(code.type)}
                              <span className="text-sm">{getTypeLabel(code.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {code.type === 'FREE_SHIPPING' ? 'Gratuit' :
                                code.type === 'PERCENTAGE' ? `${code.value}%` : `${code.value} €`}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1 text-xs text-gray-500">
                              {code.minPurchase && (
                                <div>Min: {code.minPurchase} €</div>
                              )}
                              {code.firstTimeCustomer && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Nouveaux clients
                                </div>
                              )}
                              {code.expiresAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(code.expiresAt), 'dd/MM/yy')}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {code.currentUsage}
                              {code.usageLimit && ` / ${code.usageLimit}`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", status.color)}>
                              {status.label}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="font-semibold text-green-600">
                              {code.totalSavings.toFixed(2)} €
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
                                <DropdownMenuItem onClick={() => copyCode(code.code)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copier le code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleDiscountStatus(code.id, code.isActive)}>
                                  {code.isActive ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Activer
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(code.id, 'discount', code.code)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}

                    {filteredDiscounts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucun code promo
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Créez votre premier code de réduction
                          </p>
                          <Button onClick={() => setIsCreatingDiscount(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer un code
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gift Cards Tab */}
        <TabsContent value="giftcards" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Code</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Solde</TableHead>
                      <TableHead className="hidden md:table-cell">Destinataire</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="hidden lg:table-cell">Créée le</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGiftCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyCode(card.code)}
                              className="font-mono font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
                            >
                              {card.code}
                            </button>
                            <button
                              onClick={() => copyCode(card.code)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            >
                              <Copy className="h-3.5 w-3.5 text-gray-400" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{card.amount.toFixed(2)} €</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className={cn(
                              "font-semibold",
                              card.balance === 0 ? "text-gray-400" : "text-green-600"
                            )}>
                              {card.balance.toFixed(2)} €
                            </span>
                            {card.usedAmount > 0 && (
                              <p className="text-xs text-gray-400">
                                {card.usedAmount.toFixed(2)} € utilisés
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {card.recipientEmail ? (
                            <div>
                              <p className="text-sm">{card.recipientName || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{card.recipientEmail}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Non assignée</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            card.status === 'ACTIVE' && card.balance > 0
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : card.status === 'USED' || card.balance === 0
                              ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {card.status === 'ACTIVE' && card.balance > 0 ? 'Active' :
                              card.balance === 0 ? 'Épuisée' :
                              card.status === 'EXPIRED' ? 'Expirée' :
                              card.status === 'CANCELLED' ? 'Annulée' : card.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-gray-500">
                            {format(new Date(card.createdAt), 'dd MMM yyyy', { locale: fr })}
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
                              <DropdownMenuItem onClick={() => copyCode(card.code)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copier le code
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredGiftCards.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucune carte cadeau
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Créez votre première carte cadeau
                          </p>
                          <Button onClick={() => setIsCreatingGiftCard(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer une carte
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {itemToDelete?.type === 'discount' ? 'Supprimer le code promo' : 'Supprimer la carte cadeau'}
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{itemToDelete?.name}&quot; ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
