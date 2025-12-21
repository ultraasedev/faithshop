import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = {
      totalSent: 1256,
      deliveryRate: 98.5,
      openRate: 35.2,
      clickRate: 8.7,
      templates: {
        active: 8,
        total: 12
      },
      recentSent: [
        {
          id: '1',
          template: 'Commande confirmée',
          recipient: 'marie.dupont@email.com',
          status: 'delivered',
          sentAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          template: 'Commande expédiée',
          recipient: 'jean.martin@email.com',
          status: 'opened',
          sentAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          template: 'Nouveau client',
          recipient: 'sophie.bernard@email.com',
          status: 'clicked',
          sentAt: new Date(Date.now() - 10800000).toISOString()
        }
      ]
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching notification stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}