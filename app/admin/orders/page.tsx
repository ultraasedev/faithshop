import { prisma } from '@/lib/prisma'
import { OrdersManagement } from '@/components/admin/OrdersManagement'

async function getOrdersData() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            country: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return orders.map(order => ({
      ...order,
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price)
        }
      }))
    }))
  } catch (error) {
    console.error('Erreur chargement commandes:', error)
    return []
  }
}

export default async function OrdersPage() {
  const orders = await getOrdersData()

  return <OrdersManagement orders={orders} />
}