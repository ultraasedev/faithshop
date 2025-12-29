import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StaffClient } from './StaffClient'
import { Skeleton } from '@/components/ui/skeleton'

async function getStaffMembers() {
  return prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      lastLoginAt: true,
      canManageProducts: true,
      canManageOrders: true,
      canManageUsers: true,
      canManageSettings: true,
      canManageDiscounts: true,
      canManageShipping: true,
      _count: {
        select: {
          orders: true,
          processedRefunds: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

async function getActivityLogs() {
  return prisma.activityLog.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  })
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

async function StaffContent() {
  const session = await auth()

  // All admins can access staff management (view), but only SUPER_ADMIN can edit
  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/admin')
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN'

  const [staff, activityLogs] = await Promise.all([
    getStaffMembers(),
    getActivityLogs()
  ])

  return (
    <StaffClient
      staff={staff}
      activityLogs={activityLogs}
      currentUserId={session.user.id}
      isSuperAdmin={isSuperAdmin}
    />
  )
}

export default function StaffPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StaffContent />
    </Suspense>
  )
}
