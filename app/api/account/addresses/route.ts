'use server'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  })

  return NextResponse.json(addresses)
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const data = await req.json()

  // Si c'est l'adresse par défaut, désactiver les autres
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false }
    })
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: data.label,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      addressLine2: data.addressLine2,
      city: data.city,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      isDefault: data.isDefault || false,
      isBilling: data.isBilling || false,
    }
  })

  return NextResponse.json(address)
}

export async function PUT(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const data = await req.json()
  const { id, ...updateData } = data

  // Vérifier que l'adresse appartient à l'utilisateur
  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id }
  })

  if (!existing) {
    return NextResponse.json({ error: 'Adresse non trouvée' }, { status: 404 })
  }

  // Si c'est l'adresse par défaut, désactiver les autres
  if (updateData.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, id: { not: id } },
      data: { isDefault: false }
    })
  }

  const address = await prisma.address.update({
    where: { id },
    data: updateData
  })

  return NextResponse.json(address)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  // Vérifier que l'adresse appartient à l'utilisateur
  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id }
  })

  if (!existing) {
    return NextResponse.json({ error: 'Adresse non trouvée' }, { status: 404 })
  }

  await prisma.address.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
