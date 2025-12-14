import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, image } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Le nom et le slug sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le slug n'existe pas déjà
    const existingCollection = await prisma.collection.findUnique({
      where: { slug }
    })

    if (existingCollection) {
      return NextResponse.json(
        { success: false, message: 'Une collection avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Créer la collection
    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      collection,
      message: 'Collection créée avec succès'
    })

  } catch (error) {
    console.error('Erreur création collection:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      collections
    })

  } catch (error) {
    console.error('Erreur récupération collections:', error)
    return NextResponse.json(
      {
        success: false,
        collections: [],
        message: 'Erreur lors de la récupération des collections'
      },
      { status: 500 }
    )
  }
}