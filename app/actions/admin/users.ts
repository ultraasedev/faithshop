'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'
import { Role } from '@prisma/client'

// Récupérer tous les utilisateurs
export async function getUsers(params?: {
  page?: number
  limit?: number
  role?: Role
  search?: string
}) {
  const { page = 1, limit = 20, role, search } = params || {}
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (role) {
    where.role = role
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageUsers: true,
        canManageSettings: true,
        canManageDiscounts: true,
        canManageShipping: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Récupérer un utilisateur par ID
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          items: { include: { product: true } },
        },
      },
      _count: { select: { orders: true } },
    },
  })
}

// Créer un utilisateur admin
export async function createAdminUser(data: {
  name: string
  email: string
  password: string
  role?: Role
  permissions?: {
    canManageProducts?: boolean
    canManageOrders?: boolean
    canManageUsers?: boolean
    canManageSettings?: boolean
    canManageDiscounts?: boolean
    canManageShipping?: boolean
  }
}) {
  // Vérifier que l'email n'existe pas
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    throw new Error('Un utilisateur avec cet email existe déjà')
  }

  const hashedPassword = await hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'ADMIN',
      ...(data.permissions || {
        canManageProducts: true,
        canManageOrders: true,
        canManageUsers: false,
        canManageSettings: false,
        canManageDiscounts: true,
        canManageShipping: true,
      }),
    },
  })

  revalidatePath('/admin/users')
  return user
}

// Mettre à jour un utilisateur
export async function updateUser(id: string, data: {
  name?: string
  email?: string
  role?: Role
  canManageProducts?: boolean
  canManageOrders?: boolean
  canManageUsers?: boolean
  canManageSettings?: boolean
  canManageDiscounts?: boolean
  canManageShipping?: boolean
}) {
  const user = await prisma.user.update({
    where: { id },
    data,
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
  return user
}

// Changer le mot de passe d'un utilisateur
export async function changeUserPassword(id: string, newPassword: string) {
  const hashedPassword = await hash(newPassword, 12)

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  })

  revalidatePath(`/admin/users/${id}`)
}

// Supprimer un utilisateur
export async function deleteUser(id: string) {
  // Ne pas supprimer les super admins
  const user = await prisma.user.findUnique({ where: { id } })

  if (user?.role === 'SUPER_ADMIN') {
    throw new Error('Impossible de supprimer un super administrateur')
  }

  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/users')
}

// Récupérer les admins
export async function getAdmins() {
  return prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      canManageProducts: true,
      canManageOrders: true,
      canManageUsers: true,
      canManageSettings: true,
      canManageDiscounts: true,
      canManageShipping: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

// Statistiques clients
export async function getCustomerStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalCustomers,
    newThisMonth,
    newLastMonth,
    activeCustomers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({
      where: {
        role: 'USER',
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.user.count({
      where: {
        role: 'USER',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.user.count({
      where: {
        role: 'USER',
        orders: {
          some: {
            createdAt: { gte: startOfMonth },
          },
        },
      },
    }),
  ])

  return {
    totalCustomers,
    newThisMonth,
    newLastMonth,
    customerGrowth: newLastMonth > 0
      ? ((newThisMonth - newLastMonth) / newLastMonth * 100).toFixed(1)
      : 0,
    activeCustomers,
  }
}
