import { prisma } from '@/lib/prisma'
import { CustomersManagement } from '@/components/admin/CustomersManagement'

async function getCustomersData() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return customers.map(customer => ({
      ...customer,
      orders: customer.orders.map(order => ({
        ...order,
        total: Number(order.total),
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price)
        }))
      }))
    }))
  } catch (error) {
    console.error('Erreur chargement clients:', error)
    return []
  }
}

export default async function CustomersPage() {
  const customers = await getCustomersData()

  return <CustomersManagement customers={customers} />
}