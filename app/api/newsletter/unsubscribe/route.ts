import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')

  if (!email) {
    return new NextResponse('Email manquant', { status: 400 })
  }

  try {
    const decoded = decodeURIComponent(email)
    await prisma.newsletterSubscriber.updateMany({
      where: { email: decoded },
      data: { isActive: false },
    })

    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="utf-8"><title>Désinscription</title></head>
      <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8f8f8;">
        <div style="text-align: center; background: white; padding: 60px 40px; border-radius: 8px; max-width: 400px;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Désinscription confirmée</h1>
          <p style="color: #666; margin-bottom: 24px;">Vous ne recevrez plus notre newsletter.</p>
          <a href="${process.env.NEXTAUTH_URL || 'https://faith-shop.fr'}" style="display: inline-block; padding: 12px 24px; background: black; color: white; text-decoration: none; font-size: 14px; letter-spacing: 1px;">RETOUR AU SITE</a>
        </div>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch {
    return new NextResponse('Erreur', { status: 500 })
  }
}
