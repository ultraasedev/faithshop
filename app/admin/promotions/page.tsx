import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PromotionsClient } from './PromotionsClient'

export const dynamic = 'force-dynamic'

export default async function PromotionsPage() {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  // Get discount codes
  const discountCodes = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { name: true, email: true }
      },
      orders: {
        select: { id: true, total: true }
      },
      usages: {
        select: { id: true, discountAmount: true }
      }
    }
  })

  // Get gift cards
  const giftCards = await prisma.giftCard.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  // Calculate stats
  const stats = {
    activeDiscountCodes: discountCodes.filter(d => d.isActive).length,
    totalDiscountUsages: discountCodes.reduce((sum, d) => sum + d.currentUsage, 0),
    totalDiscountSavings: discountCodes.reduce((sum, d) =>
      sum + d.usages.reduce((s, u) => s + Number(u.discountAmount), 0), 0
    ),
    activeGiftCards: giftCards.filter(g => g.status === 'ACTIVE').length,
    totalGiftCardBalance: giftCards.reduce((sum, g) => sum + Number(g.balance), 0),
    totalGiftCardValue: giftCards.reduce((sum, g) => sum + Number(g.amount), 0)
  }

  // Format data for client
  const formattedDiscountCodes = discountCodes.map(code => ({
    id: code.id,
    code: code.code,
    description: code.description,
    type: code.type,
    value: Number(code.value),
    minPurchase: code.minPurchase ? Number(code.minPurchase) : null,
    maxDiscount: code.maxDiscount ? Number(code.maxDiscount) : null,
    usageLimit: code.usageLimit,
    currentUsage: code.currentUsage,
    startsAt: code.startsAt,
    expiresAt: code.expiresAt,
    isActive: code.isActive,
    firstTimeCustomer: code.firstTimeCustomer,
    autoApply: code.autoApply,
    createdAt: code.createdAt,
    createdBy: code.createdBy?.name || code.createdBy?.email || null,
    totalSavings: code.usages.reduce((s, u) => s + Number(u.discountAmount), 0),
    orderCount: code.orders.length
  }))

  const formattedGiftCards = giftCards.map(card => ({
    id: card.id,
    code: card.code,
    amount: Number(card.amount),
    balance: Number(card.balance),
    status: card.status,
    isActive: card.isActive,
    recipientEmail: card.recipientEmail,
    recipientName: card.recipientName,
    purchaserEmail: card.purchaserEmail,
    purchaserName: card.purchaserName,
    message: card.message,
    expiresAt: card.expiresAt,
    createdAt: card.createdAt,
    usedAmount: Number(card.amount) - Number(card.balance)
  }))

  return (
    <PromotionsClient
      discountCodes={formattedDiscountCodes}
      giftCards={formattedGiftCards}
      stats={stats}
    />
  )
}
