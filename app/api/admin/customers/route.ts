import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer tous les utilisateurs avec leurs statistiques
    const customers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        country: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            status: true
          },
          where: {
            status: {
              not: 'CANCELLED'
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques pour chaque client
    const customersWithStats = customers.map(customer => ({
      id: customer.id,
      name: customer.name || 'Client',
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      zipCode: customer.zipCode,
      country: customer.country,
      role: customer.role,
      createdAt: customer.createdAt.toISOString(),
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((total, order) => total + Number(order.total), 0),
      lastOrderDate: customer.orders.length > 0
        ? customer.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt.toISOString()
        : null
    }))

    return NextResponse.json(customersWithStats)

  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}