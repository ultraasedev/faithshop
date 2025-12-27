import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any })
      },
      include: {
        user: { select: { name: true, email: true, image: true } },
        assignedTo: { select: { name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ success: true, tickets })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { ticketId, message, status, priority, assignedToId } = body

    if (ticketId) {
      // Update existing ticket
      const updates: any = {}
      if (status) updates.status = status
      if (priority) updates.priority = priority
      if (assignedToId !== undefined) updates.assignedToId = assignedToId || null
      if (status === 'RESOLVED') updates.resolvedAt = new Date()

      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: updates
      })

      // Add message if provided
      if (message) {
        await prisma.ticketMessage.create({
          data: {
            ticketId,
            senderId: session.user.id,
            content: message,
            isFromAdmin: true
          }
        })
      }

      return NextResponse.json({ success: true, ticket })
    }

    return NextResponse.json({ error: 'ticketId requis' }, { status: 400 })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
