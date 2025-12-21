import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock notification templates data
    const templates = [
      {
        id: '1',
        name: 'Commande confirmée',
        subject: 'Votre commande #{orderNumber} a été confirmée',
        content: 'Bonjour {customerName},\n\nVotre commande #{orderNumber} d\'un montant de {amount}€ a été confirmée et sera bientôt expédiée.',
        type: 'order_confirmed',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Commande expédiée',
        subject: 'Votre commande #{orderNumber} a été expédiée',
        content: 'Bonjour {customerName},\n\nVotre commande #{orderNumber} a été expédiée. Numéro de suivi: {trackingNumber}',
        type: 'order_shipped',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Nouveau client',
        subject: 'Bienvenue chez Faith Shop !',
        content: 'Bienvenue {customerName} !\n\nMerci de votre inscription. Découvrez notre collection exclusive.',
        type: 'welcome',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching notification templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, content, type, active } = body

    if (!name || !subject || !content || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const template = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      type,
      active: active ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating notification template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}