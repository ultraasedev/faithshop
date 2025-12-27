import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReturnsClient } from './ReturnsClient'

export const dynamic = 'force-dynamic'

export default async function ReturnsPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const returns = await prisma.return.findMany({
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      },
      items: {
        include: {
          orderItem: {
            include: {
              product: { select: { name: true, images: true, price: true } }
            }
          }
        }
      },
      handledBy: { select: { name: true, email: true } },
      refund: { select: { id: true, amount: true, status: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const stats = {
    total: returns.length,
    requested: returns.filter(r => r.status === 'REQUESTED').length,
    approved: returns.filter(r => r.status === 'APPROVED').length,
    received: returns.filter(r => r.status === 'RECEIVED').length,
    refunded: returns.filter(r => r.status === 'REFUNDED').length,
    rejected: returns.filter(r => r.status === 'REJECTED').length
  }

  return <ReturnsClient returns={returns} stats={stats} />
}
