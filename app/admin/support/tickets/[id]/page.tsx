import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TicketDetailClient } from './TicketDetailClient'

export const dynamic = 'force-dynamic'

interface TicketPageProps {
  params: Promise<{ id: string }>
}

async function getTicket(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          createdAt: true,
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              createdAt: true
            }
          }
        }
      },
      assignedTo: {
        select: { id: true, name: true, email: true }
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, name: true, email: true, image: true, role: true }
          }
        }
      }
    }
  })
}

async function getStaff() {
  return prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true, name: true, email: true }
  })
}

async function getRelatedOrder(orderId: string | null) {
  if (!orderId) return null
  return prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      items: {
        include: {
          product: {
            select: { name: true, images: true }
          }
        }
      }
    }
  })
}

export default async function TicketDetailPage({ params }: TicketPageProps) {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const { id } = await params
  const [ticket, staff] = await Promise.all([
    getTicket(id),
    getStaff()
  ])

  if (!ticket) {
    notFound()
  }

  const relatedOrder = await getRelatedOrder(ticket.orderId)

  // Format for client
  const ticketData = {
    ...ticket,
    user: ticket.user ? {
      ...ticket.user,
      orders: ticket.user.orders.map(o => ({
        ...o,
        total: Number(o.total)
      }))
    } : null,
    messages: ticket.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString()
    }))
  }

  const orderData = relatedOrder ? {
    ...relatedOrder,
    total: Number(relatedOrder.total),
    items: relatedOrder.items.map(i => ({
      ...i,
      price: Number(i.price)
    }))
  } : null

  return (
    <TicketDetailClient
      ticket={ticketData}
      staff={staff}
      currentUserId={session.user.id}
      relatedOrder={orderData}
    />
  )
}
