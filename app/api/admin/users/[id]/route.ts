import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { role, name } = body

    // Get the target user
    const targetUser = await prisma.user.findUnique({ where: { id } })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Prevent modifying own account
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre compte' }, { status: 400 })
    }

    // Only SUPER_ADMIN can modify other admins
    if (targetUser.role === 'ADMIN' || targetUser.role === 'SUPER_ADMIN') {
      if (session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Seul un Super Admin peut modifier un administrateur' }, { status: 403 })
      }
    }

    // Only SUPER_ADMIN can create SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Seul un Super Admin peut créer un Super Admin' }, { status: 403 })
    }

    // Validate role
    const validRoles = ['USER', 'ADMIN', 'SUPER_ADMIN']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(name !== undefined && { name })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Utilisateur mis à jour'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Get the target user
    const targetUser = await prisma.user.findUnique({ where: { id } })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Prevent deleting own account
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
    }

    // Prevent deleting SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Impossible de supprimer un Super Admin' }, { status: 403 })
    }

    // Only SUPER_ADMIN can delete admins
    if (targetUser.role === 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Seul un Super Admin peut supprimer un administrateur' }, { status: 403 })
    }

    // Delete user (cascade will handle related records based on schema)
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
