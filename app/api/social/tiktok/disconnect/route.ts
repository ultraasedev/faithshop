import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Get connection
    const connection = await prisma.socialConnection.findUnique({
      where: { provider: 'tiktok_shop' }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connexion non trouvée' }, { status: 404 })
    }

    // Delete connection from database
    await prisma.socialConnection.delete({
      where: { provider: 'tiktok_shop' }
    })

    // Clean up synced products
    await prisma.socialProductSync.deleteMany({
      where: { provider: 'tiktok_shop' }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a déconnecté TikTok Shop',
        resource: 'integration',
        resourceId: 'tiktok_shop'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('TikTok disconnect error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
