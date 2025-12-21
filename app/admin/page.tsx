import { prisma } from '@/lib/prisma'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

async function getAdminData() {
  try {
    const [products, orders, users] = await Promise.all([
      // Récupération des produits
      prisma.product.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          stock: true,
          isActive: true,
          category: true,
          createdAt: true,
          updatedAt: true
        }
      }),

      // Récupération des commandes
      prisma.order.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),

      // Récupération des utilisateurs
      prisma.user.findMany({
        where: {
          role: 'USER'
        },
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          orders: {
            select: {
              total: true,
              createdAt: true,
              status: true
            }
          }
        }
      })
    ])

    return {
      products: products.map(p => ({
        ...p,
        price: Number(p.price)
      })),
      orders: orders.map(o => ({
        ...o,
        total: Number(o.total),
        items: o.items.map(item => ({
          ...item,
          price: Number(item.price)
        }))
      })),
      users: users.map(u => ({
        ...u,
        orders: u.orders.map(order => ({
          ...order,
          total: Number(order.total)
        }))
      }))
    }
  } catch (error) {
    console.error('Erreur chargement données admin:', error)
    return {
      products: [],
      orders: [],
      users: []
    }
  }
}

export default async function AdminPage() {
  const data = await getAdminData()

  return <AdminDashboard data={data} />
}