import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { sendStaffWelcomeEmail } from '@/lib/email'

// Generate a random password
function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  const randomBytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length]
  }
  return password
}

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
      password: providedPassword,
      role,
      canManageProducts,
      canManageOrders,
      canManageUsers,
      canManageSettings,
      canManageDiscounts,
      canManageShipping,
      permissions // Alternative format from new UI
    } = body

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Generate a random password if not provided
    const temporaryPassword = providedPassword || generatePassword(12)

    // Hash password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12)

    // Handle permissions from either format
    const perms = permissions || {
      canManageProducts,
      canManageOrders,
      canManageUsers,
      canManageSettings,
      canManageDiscounts,
      canManageShipping
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'ADMIN',
        canManageProducts: role === 'SUPER_ADMIN' ? true : (perms.canManageProducts ?? true),
        canManageOrders: role === 'SUPER_ADMIN' ? true : (perms.canManageOrders ?? true),
        canManageUsers: role === 'SUPER_ADMIN' ? true : (perms.canManageUsers ?? false),
        canManageSettings: role === 'SUPER_ADMIN' ? true : (perms.canManageSettings ?? false),
        canManageDiscounts: role === 'SUPER_ADMIN' ? true : (perms.canManageDiscounts ?? false),
        canManageShipping: role === 'SUPER_ADMIN' ? true : (perms.canManageShipping ?? false)
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
        canManageShipping: true,
      }
    })

    // Send welcome email with temporary password
    try {
      await sendStaffWelcomeEmail(email, name, temporaryPassword)
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // Continue even if email fails - user is created
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a créé un nouveau membre',
        details: `${name} (${email}) - ${role || 'ADMIN'}`,
        resource: 'user',
        resourceId: user.id
      }
    })

    revalidatePath('/admin/staff')

    return NextResponse.json({
      success: true,
      member: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
      },
      temporaryPassword, // Return to show in dialog
      message: 'Membre créé et email envoyé'
    })
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
