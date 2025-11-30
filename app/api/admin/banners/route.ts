import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des bannières' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { text, link, backgroundColor, textColor, isActive, position, startDate, endDate } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Le texte est obligatoire' },
        { status: 400 }
      )
    }

    const maxOrder = await prisma.banner.aggregate({
      _max: { order: true }
    })

    const banner = await prisma.banner.create({
      data: {
        text,
        link: link || null,
        backgroundColor: backgroundColor || '#000000',
        textColor: textColor || '#ffffff',
        isActive: isActive ?? true,
        position: position || 'top',
        order: (maxOrder._max.order ?? -1) + 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la bannière' },
      { status: 500 }
    )
  }
}
