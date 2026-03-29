import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { NewsletterClient } from './NewsletterClient'
import { Skeleton } from '@/components/ui/skeleton'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

async function getData() {
  noStore()
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return {
    subscribers: subscribers.map(s => ({
      id: s.id,
      email: s.email,
      isActive: s.isActive,
      createdAt: s.createdAt,
    })),
    stats: {
      total: subscribers.length,
      active: subscribers.filter(s => s.isActive).length,
      inactive: subscribers.filter(s => !s.isActive).length,
    },
  }
}

async function Content() {
  const data = await getData()
  return <NewsletterClient {...data} />
}

export default function NewsletterPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><Skeleton className="h-9 w-48" /><Skeleton className="h-[500px]" /></div>}>
      <Content />
    </Suspense>
  )
}
