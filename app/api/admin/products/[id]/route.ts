import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== API: Starting product fetch ===')

    const { id } = await params
    console.log('=== API: Product ID ===', id)

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        collections: true
      }
    })

    console.log('=== API: Product found ===', product ? 'Yes' : 'No')

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Convert Decimal to number for JSON serialization
    const productJson = {
      ...product,
      price: product.price.toNumber()
    }

    console.log('=== API: Returning product ===', productJson.name)

    return NextResponse.json(productJson)

  } catch (error) {
    console.error('=== API: Error fetching product ===', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}