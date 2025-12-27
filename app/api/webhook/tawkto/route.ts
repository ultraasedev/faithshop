import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tawk.to webhook endpoint
// Configure this URL in Tawk.to: Dashboard > Administration > Settings > Webhooks

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Tawk.to sends different event types
    const { event, chatId, visitor, message, property } = body

    console.log('Tawk.to webhook received:', event, chatId)

    // Generate a unique ticket number for new chats
    const generateTicketNumber = () => {
      const timestamp = Date.now().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      return `TK-${timestamp}${random}`
    }

    switch (event) {
      case 'chat:start':
      case 'chat:new': {
        // Create a new support ticket when a chat starts
        const visitorName = visitor?.name || 'Visiteur'
        const visitorEmail = visitor?.email || null

        // Check if a ticket already exists for this chat
        const existingTicket = await prisma.supportTicket.findFirst({
          where: {
            category: `tawkto:${chatId}`
          }
        })

        if (!existingTicket) {
          await prisma.supportTicket.create({
            data: {
              ticketNumber: generateTicketNumber(),
              subject: `Chat Tawk.to - ${visitorName}`,
              status: 'OPEN',
              priority: 'MEDIUM',
              category: `tawkto:${chatId}`, // Use category to store chat ID
              guestName: visitorName,
              guestEmail: visitorEmail,
            }
          })
        }
        break
      }

      case 'chat:message': {
        // Add message to the ticket
        const ticket = await prisma.supportTicket.findFirst({
          where: {
            category: `tawkto:${chatId}`
          }
        })

        if (ticket) {
          const isFromVisitor = message?.sender?.type === 'visitor'

          await prisma.ticketMessage.create({
            data: {
              ticketId: ticket.id,
              content: message?.text || '',
              isStaff: !isFromVisitor,
              attachments: message?.attachments?.map((a: any) => a.url) || []
            }
          })

          // Update ticket status based on who sent the message
          await prisma.supportTicket.update({
            where: { id: ticket.id },
            data: {
              status: isFromVisitor ? 'OPEN' : 'WAITING_CUSTOMER',
              updatedAt: new Date()
            }
          })
        }
        break
      }

      case 'chat:end': {
        // Mark ticket as resolved when chat ends
        const ticket = await prisma.supportTicket.findFirst({
          where: {
            category: `tawkto:${chatId}`
          }
        })

        if (ticket) {
          await prisma.supportTicket.update({
            where: { id: ticket.id },
            data: {
              status: 'RESOLVED',
              resolvedAt: new Date()
            }
          })
        }
        break
      }

      case 'ticket:create': {
        // Tawk.to offline ticket (when agents are offline)
        const ticketData = body.ticket

        await prisma.supportTicket.create({
          data: {
            ticketNumber: generateTicketNumber(),
            subject: ticketData?.subject || 'Message hors ligne',
            status: 'OPEN',
            priority: 'MEDIUM',
            category: 'tawkto:offline',
            guestName: ticketData?.name || 'Visiteur',
            guestEmail: ticketData?.email || null,
          }
        })

        // Add the message content
        if (ticketData?.message) {
          const ticket = await prisma.supportTicket.findFirst({
            where: { category: 'tawkto:offline' },
            orderBy: { createdAt: 'desc' }
          })

          if (ticket) {
            await prisma.ticketMessage.create({
              data: {
                ticketId: ticket.id,
                content: ticketData.message,
                isStaff: false
              }
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tawk.to webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Tawk.to may send GET requests to verify the webhook
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Tawk.to webhook endpoint active' })
}
