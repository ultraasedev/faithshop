import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      password,
      role,
      canManageProducts,
      canManageOrders,
      canManageUsers,
      canManageSettings,
      canManageDiscounts,
      canManageShipping
    } = body

    // Prepare update data
    const updateData: Record<string, unknown> = {
      name,
      role,
      canManageProducts: role === 'SUPER_ADMIN' ? true : canManageProducts,
      canManageOrders: role === 'SUPER_ADMIN' ? true : canManageOrders,
      canManageUsers: role === 'SUPER_ADMIN' ? true : canManageUsers,
      canManageSettings: role === 'SUPER_ADMIN' ? true : canManageSettings,
      canManageDiscounts: role === 'SUPER_ADMIN' ? true : canManageDiscounts,
      canManageShipping: role === 'SUPER_ADMIN' ? true : canManageShipping
    }

    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a modifié un membre',
        details: `${user.name} (${user.email})`,
        entityType: 'user',
        entityId: user.id
      }
    })

    revalidatePath('/admin/staff')

    return NextResponse.json({
      success: true,
      message: 'Membre mis à jour'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Cannot delete yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Impossible de supprimer votre propre compte' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Downgrade to USER role instead of deleting (preserves history)
    await prisma.user.update({
      where: { id },
      data: {
        role: 'USER',
        canManageProducts: false,
        canManageOrders: false,
        canManageUsers: false,
        canManageSettings: false,
        canManageDiscounts: false,
        canManageShipping: false
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a retiré un membre de l\'équipe',
        details: `${user.name} (${user.email})`,
        entityType: 'user',
        entityId: user.id
      }
    })

    revalidatePath('/admin/staff')

    return NextResponse.json({
      success: true,
      message: 'Membre retiré de l\'équipe'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
