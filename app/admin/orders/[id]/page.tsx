import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { OrderDetailClient } from './OrderDetailClient'

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, images: true, slug: true } },
          variant: { select: { id: true, title: true, sku: true } }
        }
      },
      shipping: {
        include: { events: { orderBy: { timestamp: 'desc' } } }
      },
      refunds: {
        include: { adminUser: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      },
      discountCode: true,
      giftCard: true,
      returns: {
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!order) return null

  return {
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discountAmount: Number(order.discountAmount),
    taxAmount: Number(order.taxAmount),
    items: order.items.map(item => ({
      ...item,
      price: Number(item.price)
    })),
    refunds: order.refunds.map(refund => ({
      ...refund,
      amount: Number(refund.amount)
    }))
  }
}

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return <OrderDetailClient order={order} />
}
