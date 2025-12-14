import { notFound } from 'next/navigation'
import { getOrderById } from '@/app/actions/admin/orders'
import OrderDetailClient from './OrderDetailClient'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await getOrderById(params.id)

  if (!order) {
    notFound()
  }

  return <OrderDetailClient order={order} />
}