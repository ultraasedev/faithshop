import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MenusClient } from './MenusClient'

export const dynamic = 'force-dynamic'

export default async function MenusPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const menus = await prisma.menu.findMany({
    include: {
      items: {
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          items: {
            orderBy: { order: 'asc' }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get pages for link selection
  const pages = await prisma.page.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true }
  })

  // Get collections for link selection
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true }
  })

  return <MenusClient menus={menus} pages={pages} collections={collections} />
}
