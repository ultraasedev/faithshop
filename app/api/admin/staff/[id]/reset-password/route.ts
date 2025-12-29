import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { sendStaffPasswordResetEmail } from '@/lib/email'

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Only allow resetting password for staff members
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Ce membre n'est pas un administrateur" }, { status: 400 })
    }

    // Generate new password
    const newPassword = generatePassword(12)
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        // Clear any existing reset tokens
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    // Send email with new password
    try {
      await sendStaffPasswordResetEmail(user.email, user.name || 'Membre', newPassword)
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // Return the password even if email fails
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'a réinitialisé le mot de passe',
        details: user.name || user.email,
        resource: 'user',
        resourceId: user.id
      }
    })

    revalidatePath('/admin/staff')

    return NextResponse.json({
      success: true,
      temporaryPassword: newPassword,
      message: 'Mot de passe réinitialisé et email envoyé'
    })
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
