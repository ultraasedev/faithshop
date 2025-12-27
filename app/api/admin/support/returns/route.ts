import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const returns = await prisma.return.findMany({
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: { select: { name: true, images: true } }
              }
            }
          }
        },
        handledBy: { select: { name: true, email: true } },
        refund: { select: { id: true, amount: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, returns })
  } catch (error) {
    console.error('Error fetching returns:', error)
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
    const { returnId, status, adminNotes, returnTrackingNumber, returnCarrier } = body

    if (!returnId) {
      return NextResponse.json({ error: 'returnId requis' }, { status: 400 })
    }

    const updates: any = { updatedAt: new Date() }
    if (status) updates.status = status
    if (adminNotes !== undefined) updates.adminNotes = adminNotes
    if (returnTrackingNumber !== undefined) updates.returnTrackingNumber = returnTrackingNumber
    if (returnCarrier !== undefined) updates.returnCarrier = returnCarrier

    // If being handled, record who and when
    if (status && ['APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED'].includes(status)) {
      updates.handledById = session.user.id
      updates.handledAt = new Date()
    }

    const returnRequest = await prisma.return.update({
      where: { id: returnId },
      data: updates,
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    return NextResponse.json({ success: true, return: returnRequest })
  } catch (error) {
    console.error('Error updating return:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
