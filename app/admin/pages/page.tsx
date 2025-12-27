import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PagesClient } from './PagesClient'
import { Skeleton } from '@/components/ui/skeleton'

async function getPages() {
  return prisma.page.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { versions: true }
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
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}

async function PagesContent() {
  const pages = await getPages()
  return <PagesClient pages={pages} />
}

export default function PagesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PagesContent />
    </Suspense>
  )
}
