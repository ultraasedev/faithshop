'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Package,
  ShoppingCart,
  ExternalLink,
  Calendar,
  MessageSquare,
  Paperclip
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  isStaff: boolean
  attachments: string[]
  createdAt: string
  sender: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  } | null
}

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
  guestEmail: string | null
  guestName: string | null
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    phone: string | null
    createdAt: Date
    orders: Array<{
      id: string
      orderNumber: string
      status: string
      total: number
      createdAt: Date
    }>
  } | null
  assignedTo: { id: string; name: string | null; email: string } | null
  messages: Message[]
}

interface Staff {
  id: string
  name: string | null
  email: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: Date
  items: Array<{
    id: string
    quantity: number
    price: number
    product: { name: string; images: string[] }
  }>
}

interface TicketDetailClientProps {
  ticket: Ticket
  staff: Staff[]
  currentUserId: string
  relatedOrder: Order | null
}

const statusConfig = {
  OPEN: { label: 'Ouvert', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
  IN_PROGRESS: { label: 'En cours', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  WAITING_CUSTOMER: { label: 'Attente client', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Clock },
  RESOLVED: { label: 'Résolu', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  CLOSED: { label: 'Fermé', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: XCircle }
}

const priorityConfig = {
  LOW: { label: 'Basse', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  MEDIUM: { label: 'Moyenne', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  HIGH: { label: 'Haute', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' }
}

const categoryLabels: Record<string, string> = {
  order: 'Commande',
  product: 'Produit',
  shipping: 'Livraison',
  refund: 'Remboursement',
  other: 'Autre'
}

export function TicketDetailClient({ ticket, staff, currentUserId, relatedOrder }: TicketDetailClientProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [localStatus, setLocalStatus] = useState(ticket.status)
  const [localPriority, setLocalPriority] = useState(ticket.priority)
  const [localAssignee, setLocalAssignee] = useState(ticket.assignedTo?.id || 'unassigned')

  const customer = ticket.user
    ? { name: ticket.user.name || 'Client', email: ticket.user.email, phone: ticket.user.phone }
    : { name: ticket.guestName || 'Invité', email: ticket.guestEmail || '', phone: null }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket.messages])

  const updateTicket = async (updates: { status?: string; priority?: string; assignedToId?: string | null }) => {
    setIsLoading(true)
    try {
      await fetch('/api/admin/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, ...updates })
      })
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (value: string) => {
    setLocalStatus(value as typeof localStatus)
    updateTicket({ status: value })
  }

  const handlePriorityChange = (value: string) => {
    setLocalPriority(value as typeof localPriority)
    updateTicket({ priority: value })
  }

  const handleAssigneeChange = (value: string) => {
    setLocalAssignee(value)
    updateTicket({ assignedToId: value === 'unassigned' ? null : value })
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return

    setIsLoading(true)
    try {
      await fetch('/api/admin/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          message: replyMessage,
          status: 'WAITING_CUSTOMER'
        })
      })
      setReplyMessage('')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSendReply()
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/support/tickets">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-gray-500">#{ticket.ticketNumber}</span>
              <Badge className={cn(statusConfig[localStatus].color, 'border-0')}>
                {statusConfig[localStatus].label}
              </Badge>
              <Badge className={cn(priorityConfig[localPriority].color, 'border-0')}>
                {priorityConfig[localPriority].label}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {ticket.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={localStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main conversation */}
        <div className="lg:col-span-3 space-y-6">
          {/* Messages */}
          <Card className="flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
            <CardHeader className="flex-shrink-0 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {ticket.messages.map((message) => {
                const isStaffMessage = message.isStaff
                const senderName = message.sender?.name || (isStaffMessage ? 'Support' : customer.name)
                const senderInitial = senderName.charAt(0).toUpperCase()

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      isStaffMessage ? "flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                      isStaffMessage
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    )}>
                      {message.sender?.image ? (
                        <Image
                          src={message.sender.image}
                          alt={senderName}
                          width={36}
                          height={36}
                          className="rounded-full"
                        />
                      ) : (
                        senderInitial
                      )}
                    </div>

                    <div className={cn(
                      "max-w-[75%] rounded-lg p-3",
                      isStaffMessage
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{senderName}</span>
                        {isStaffMessage && (
                          <Badge variant="secondary" className="text-xs">Staff</Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {format(new Date(message.createdAt), 'dd MMM HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.attachments.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <Paperclip className="h-3 w-3" />
                              Pièce jointe {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Reply input */}
            <div className="flex-shrink-0 border-t p-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Votre réponse... (Ctrl+Enter pour envoyer)"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  className="flex-1 resize-none"
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || isLoading}
                  className="self-end"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Le client recevra une notification par email
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {ticket.user?.image ? (
                    <Image
                      src={ticket.user.image}
                      alt={customer.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{customer.name}</p>
                  {ticket.user && (
                    <p className="text-xs text-gray-500">
                      Client depuis {format(new Date(ticket.user.createdAt), 'MMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${customer.email}`} className="hover:underline">
                    {customer.email}
                  </a>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${customer.phone}`} className="hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
              </div>

              {ticket.user && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/admin/customers/${ticket.user.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir le profil
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Ticket details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Catégorie</span>
                  <span className="font-medium">{categoryLabels[ticket.category] || ticket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Créé</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                {ticket.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Résolu</span>
                    <span className="font-medium">
                      {format(new Date(ticket.resolvedAt), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Priorité</label>
                  <Select value={localPriority} onValueChange={handlePriorityChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Basse</SelectItem>
                      <SelectItem value="MEDIUM">Moyenne</SelectItem>
                      <SelectItem value="HIGH">Haute</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Assigné à</label>
                  <Select value={localAssignee} onValueChange={handleAssigneeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Non assigné" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Non assigné</SelectItem>
                      {staff.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name || s.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related order */}
          {relatedOrder && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Commande liée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono">#{relatedOrder.orderNumber}</span>
                    <Badge variant="secondary">{relatedOrder.status}</Badge>
                  </div>

                  <div className="space-y-2">
                    {relatedOrder.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 m-2 text-gray-400" />
                          )}
                        </div>
                        <span className="truncate flex-1">{item.product.name}</span>
                        <span className="text-gray-500">x{item.quantity}</span>
                      </div>
                    ))}
                    {relatedOrder.items.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{relatedOrder.items.length - 3} autres articles
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t flex justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold">{relatedOrder.total.toFixed(2)} EUR</span>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/admin/orders/${relatedOrder.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir la commande
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer orders */}
          {ticket.user && ticket.user.orders.length > 0 && !relatedOrder && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Commandes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ticket.user.orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm"
                    >
                      <div>
                        <span className="font-mono">#{order.orderNumber}</span>
                        <p className="text-xs text-gray-500">
                          {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.total.toFixed(2)} EUR</p>
                        <Badge variant="secondary" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
