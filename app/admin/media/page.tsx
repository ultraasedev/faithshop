import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MediaClient } from './MediaClient'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const folders = await prisma.media.groupBy({
    by: ['folder'],
    _count: { id: true },
    _sum: { size: true }
  })

  const formattedFolders = folders.map(f => ({
    name: f.folder || 'general',
    count: f._count.id,
    size: f._sum.size || 0
  }))

  const stats = {
    totalFiles: media.length,
    totalSize: media.reduce((sum, m) => sum + m.size, 0),
    folders: formattedFolders.length
  }

  return (
    <MediaClient
      media={media}
      folders={formattedFolders}
      stats={stats}
    />
  )
}
