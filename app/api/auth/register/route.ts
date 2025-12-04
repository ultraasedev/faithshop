import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      name,
      phone,
      address,
      city,
      zipCode,
      country,
      isPro,
      companyName,
      vatNumber,
    } = body

    // Validation de base
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      )
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Si c'est une entreprise, valider les champs requis
    if (isPro && !companyName) {
      return NextResponse.json(
        { error: 'Le nom de l\'entreprise est requis' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        city,
        zipCode,
        country,
        companyName: isPro ? companyName : null,
        vatNumber: isPro ? vatNumber : null,
        role: 'USER',
      },
    })

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = user

    // Envoyer l'email de bienvenue (non-bloquant)
    sendWelcomeEmail(user.email, user.name || 'Client').catch((err) => {
      console.error('Failed to send welcome email:', err)
    })

    return NextResponse.json(
      {
        message: 'Compte créé avec succès',
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    )
  }
}
