import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        lastLoginAt: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageUsers: true,
        canManageSettings: true,
        canManageDiscounts: true,
        canManageShipping: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      canManageProducts,
      canManageOrders,
      canManageUsers,
      canManageSettings,
      canManageDiscounts,
      canManageShipping
    } = body

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        canManageProducts: role === 'SUPER_ADMIN' ? true : canManageProducts,
        canManageOrders: role === 'SUPER_ADMIN' ? true : canManageOrders,
        canManageUsers: role === 'SUPER_ADMIN' ? true : canManageUsers,
        canManageSettings: role === 'SUPER_ADMIN' ? true : canManageSettings,
        canManageDiscounts: role === 'SUPER_ADMIN' ? true : canManageDiscounts,
        canManageShipping: role === 'SUPER_ADMIN' ? true : canManageShipping
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a créé un nouveau membre',
        details: `${name} (${email}) - ${role}`,
        entityType: 'user',
        entityId: user.id
      }
    })

    revalidatePath('/admin/staff')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
