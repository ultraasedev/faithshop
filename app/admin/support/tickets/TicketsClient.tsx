'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Mail,
  Send,
  Filter
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  orderId: string | null
  createdAt: Date
  updatedAt: Date
  resolvedAt: Date | null
  user: { id: string; name: string | null; email: string; image: string | null } | null
  guestEmail: string | null
  guestName: string | null
  assignedTo: { id: string; name: string | null; email: string } | null
  messages: Array<{
    id: string
    content: string
    createdAt: Date
    sender: { name: string | null } | null
  }>
}

interface Staff {
  id: string
  name: string | null
  email: string
}

interface Stats {
  total: number
  open: number
  inProgress: number
  resolved: number
  highPriority: number
}

interface TicketsClientProps {
  tickets: Ticket[]
  staff: Staff[]
  stats: Stats
  currentUserId: string
}

const statusConfig = {
  OPEN: { label: 'Ouvert', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
  IN_PROGRESS: { label: 'En cours', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  WAITING_CUSTOMER: { label: 'Attente client', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Clock },
  RESOLVED: { label: 'Résolu', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  CLOSED: { label: 'Fermé', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: XCircle }
}

const priorityConfig = {
  LOW: { label: 'Basse', color: 'text-gray-500' },
  MEDIUM: { label: 'Moyenne', color: 'text-blue-500' },
  HIGH: { label: 'Haute', color: 'text-orange-500' },
  URGENT: { label: 'Urgente', color: 'text-red-500' }
}

export function TicketsClient({ tickets, staff, stats, currentUserId }: TicketsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || t.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const updateTicket = async (ticketId: string, updates: { status?: string; priority?: string; assignedToId?: string | null; message?: string }) => {
    setIsLoading(true)
    try {
      await fetch('/api/admin/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, ...updates })
      })
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return
    await updateTicket(selectedTicket.id, { message: replyMessage, status: 'IN_PROGRESS' })
    setReplyMessage('')
    setSelectedTicket(null)
  }

  const getCustomerInfo = (ticket: Ticket) => {
    if (ticket.user) {
      return { name: ticket.user.name || 'Client', email: ticket.user.email }
    }
    return { name: ticket.guestName || 'Invité', email: ticket.guestEmail || '' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tickets Support
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {stats.open} tickets ouverts
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Ouverts', value: stats.open, color: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'En cours', value: stats.inProgress, color: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Résolus', value: stats.resolved, color: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Priorité haute', value: stats.highPriority, color: 'bg-red-100 dark:bg-red-900/30' }
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par numéro, sujet, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="OPEN">Ouverts</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="WAITING_CUSTOMER">Attente client</SelectItem>
                <SelectItem value="RESOLVED">Résolus</SelectItem>
                <SelectItem value="CLOSED">Fermés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y dark:divide-gray-800">
            {filteredTickets.map((ticket) => {
              const customer = getCustomerInfo(ticket)
              const status = statusConfig[ticket.status]
              const priority = priorityConfig[ticket.priority]
              const StatusIcon = status.icon

              return (
                <div
                  key={ticket.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium",
                      ticket.priority === 'URGENT' || ticket.priority === 'HIGH'
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    )}>
                      {customer.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-gray-500">#{ticket.ticketNumber}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", status.color)}>
                          {status.label}
                        </span>
                        <span className={cn("text-xs font-medium", priority.color)}>
                          {priority.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mt-1 truncate">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {customer.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {customer.email}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      {ticket.messages[0] && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-1">
                          {ticket.messages[0].content}
                        </p>
                      )}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                      {ticket.assignedTo ? (
                        <span className="text-sm text-gray-500">
                          Assigné à {ticket.assignedTo.name || ticket.assignedTo.email}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Non assigné</span>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateTicket(ticket.id, { assignedToId: currentUserId })}>
                          M'assigner
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTicket(ticket.id, { status: 'IN_PROGRESS' })}>
                          Marquer en cours
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTicket(ticket.id, { status: 'RESOLVED' })}>
                          Marquer résolu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTicket(ticket.id, { status: 'CLOSED' })}>
                          Fermer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}

            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun ticket
                </h3>
                <p className="text-gray-500">
                  {searchQuery || filterStatus !== 'all' ? 'Aucun résultat' : 'Aucun ticket à traiter'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-500">#{selectedTicket.ticketNumber}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[selectedTicket.status].color)}>
                    {statusConfig[selectedTicket.status].label}
                  </span>
                </div>
                <DialogTitle>{selectedTicket.subject}</DialogTitle>
                <DialogDescription>
                  {getCustomerInfo(selectedTicket).name} - {getCustomerInfo(selectedTicket).email}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(v) => updateTicket(selectedTicket.id, { status: v })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Ouvert</SelectItem>
                      <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                      <SelectItem value="WAITING_CUSTOMER">Attente client</SelectItem>
                      <SelectItem value="RESOLVED">Résolu</SelectItem>
                      <SelectItem value="CLOSED">Fermé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(v) => updateTicket(selectedTicket.id, { priority: v })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Basse</SelectItem>
                      <SelectItem value="MEDIUM">Moyenne</SelectItem>
                      <SelectItem value="HIGH">Haute</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedTicket.assignedTo?.id || 'unassigned'}
                    onValueChange={(v) => updateTicket(selectedTicket.id, { assignedToId: v === 'unassigned' ? null : v })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assigner à..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Non assigné</SelectItem>
                      {staff.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name || s.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Messages */}
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-800/50">
                  {selectedTicket.messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{msg.sender?.name || 'Client'}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(msg.createdAt), 'dd MMM HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{msg.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Votre réponse..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Fermer
                </Button>
                <Button onClick={handleReply} disabled={!replyMessage.trim() || isLoading}>
                  <Send className="h-4 w-4 mr-2" />
                  Répondre
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
