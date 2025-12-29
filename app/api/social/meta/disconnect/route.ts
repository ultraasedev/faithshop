import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Get connection to revoke access
    const connection = await prisma.socialConnection.findUnique({
      where: { provider: 'meta' }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connexion non trouvée' }, { status: 404 })
    }

    // Try to revoke access on Meta's side
    try {
      await fetch(
        `https://graph.facebook.com/v18.0/me/permissions?access_token=${connection.accessToken}`,
        { method: 'DELETE' }
      )
    } catch (error) {
      // Continue even if revoke fails - token might be expired
      console.error('Failed to revoke Meta access:', error)
    }

    // Delete connection from database
    await prisma.socialConnection.delete({
      where: { provider: 'meta' }
    })

    // Clean up synced products
    await prisma.socialProductSync.deleteMany({
      where: { provider: 'meta' }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a déconnecté Meta (Facebook/Instagram)',
        resource: 'integration',
        resourceId: 'meta'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Meta disconnect error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
