import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { IntegrationsClient } from './IntegrationsClient'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  // Get social connections
  const connections = await prisma.socialConnection.findMany()

  // Get sync stats
  const syncStats = await prisma.socialProductSync.groupBy({
    by: ['provider', 'syncStatus'],
    _count: true
  })

  // Get recent orders from social platforms
  const recentSocialOrders = await prisma.socialOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  // Format data for client
  const formattedConnections = connections.map(c => ({
    ...c,
    expiresAt: c.expiresAt?.toISOString() || null,
    lastSyncAt: c.lastSyncAt?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString()
  }))

  const stats = {
    meta: {
      synced: syncStats.filter(s => s.provider === 'meta' && s.syncStatus === 'synced').reduce((acc, s) => acc + s._count, 0),
      pending: syncStats.filter(s => s.provider === 'meta' && s.syncStatus === 'pending').reduce((acc, s) => acc + s._count, 0),
      error: syncStats.filter(s => s.provider === 'meta' && s.syncStatus === 'error').reduce((acc, s) => acc + s._count, 0)
    },
    tiktok: {
      synced: syncStats.filter(s => s.provider === 'tiktok_shop' && s.syncStatus === 'synced').reduce((acc, s) => acc + s._count, 0),
      pending: syncStats.filter(s => s.provider === 'tiktok_shop' && s.syncStatus === 'pending').reduce((acc, s) => acc + s._count, 0),
      error: syncStats.filter(s => s.provider === 'tiktok_shop' && s.syncStatus === 'error').reduce((acc, s) => acc + s._count, 0)
    }
  }

  return (
    <IntegrationsClient
      connections={formattedConnections}
      stats={stats}
      recentOrders={recentSocialOrders.map(o => ({
        ...o,
        totalAmount: o.totalAmount.toString(),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString()
      }))}
    />
  )
}
