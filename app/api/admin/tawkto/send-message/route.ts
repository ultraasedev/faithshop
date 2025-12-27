import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Tawk.to REST API endpoint for sending messages
// Requires API credentials from Tawk.to Dashboard > Administration > Settings > API Keys

const TAWK_API_BASE = 'https://api.tawk.to/v3'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { ticketId, message, chatId } = body

    if (!ticketId || !message) {
      return NextResponse.json({ error: 'ticketId et message requis' }, { status: 400 })
    }

    // Get Tawk.to API credentials from integrations
    const tawkIntegration = await prisma.integration.findFirst({
      where: {
        provider: 'tawkto',
        isEnabled: true
      }
    })

    // Extract chatId from ticket category (stored as tawkto:chatId)
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
    }

    const extractedChatId = chatId || ticket.category?.replace('tawkto:', '')

    // Save message to database regardless of Tawk.to API status
    const savedMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: session.user.id,
        content: message,
        isStaff: true
      }
    })

    // Update ticket status
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'WAITING_CUSTOMER',
        updatedAt: new Date()
      }
    })

    // Try to send via Tawk.to API if credentials are configured
    let tawkSent = false
    if (tawkIntegration && extractedChatId && !extractedChatId.includes('offline')) {
      try {
        const config = JSON.parse(tawkIntegration.config || '{}')
        const { apiKey, propertyId } = config

        if (apiKey && propertyId) {
          // Tawk.to REST API call
          const response = await fetch(`${TAWK_API_BASE}/property/${propertyId}/chat/${extractedChatId}/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              message: message,
              type: 'agent'
            })
          })

          if (response.ok) {
            tawkSent = true
          } else {
            console.log('Tawk.to API response:', await response.text())
          }
        }
      } catch (tawkError) {
        console.error('Tawk.to API error:', tawkError)
        // Continue - message is saved locally
      }
    }

    return NextResponse.json({
      success: true,
      message: savedMessage,
      tawkSent,
      note: tawkSent
        ? 'Message envoyé via Tawk.to'
        : 'Message enregistré. Répondez également via l\'app Tawk.to pour que le client le reçoive.'
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
