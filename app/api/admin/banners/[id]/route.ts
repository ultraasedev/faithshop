import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const banner = await prisma.banner.findUnique({
      where: { id }
    })

    if (!banner) {
      return NextResponse.json(
        { error: 'Bannière non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la bannière' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { text, link, backgroundColor, textColor, isActive, position, startDate, endDate, order } = body

    const existing = await prisma.banner.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Bannière non trouvée' },
        { status: 404 }
      )
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        text: text ?? existing.text,
        link: link !== undefined ? (link || null) : existing.link,
        backgroundColor: backgroundColor ?? existing.backgroundColor,
        textColor: textColor ?? existing.textColor,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        position: position ?? existing.position,
        order: order !== undefined ? order : existing.order,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
      }
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la bannière' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    await prisma.banner.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la bannière' },
      { status: 500 }
    )
  }
}
