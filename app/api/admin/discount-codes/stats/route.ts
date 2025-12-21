import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les statistiques des codes promo
    const [
      totalCodes,
      activeCodes,
      totalUsage,
      discountUsages
    ] = await Promise.all([
      prisma.discountCode.count(),
      prisma.discountCode.count({
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        }
      }),
      prisma.discountCode.aggregate({
        _sum: { currentUsage: true }
      }),
      prisma.discountUsage.aggregate({
        _sum: { discountAmount: true }
      })
    ])

    const totalSavings = Number(discountUsages._sum.discountAmount || 0)

    return NextResponse.json({
      totalCodes,
      activeCodes,
      totalUsage: totalUsage._sum.currentUsage || 0,
      totalSavings
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}