import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from '@/components/product/ProductDetailClient'
import ShippingBanner from '@/components/banners/ShippingBanner'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

// Generate dynamic SEO metadata for product pages
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      images: true,
      price: true,
    }
  })

  if (!product) {
    return {
      title: 'Produit non trouvé | Faith Shop',
    }
  }

  const price = product.price.toNumber()

  return {
    title: `${product.name} | Faith Shop`,
    description: product.description?.slice(0, 160) || `Découvrez ${product.name} sur Faith Shop. Livraison offerte dès 100€.`,
    openGraph: {
      title: `${product.name} | Faith Shop`,
      description: product.description?.slice(0, 160) || `Découvrez ${product.name} sur Faith Shop.`,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 160) || '',
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    other: {
      'product:price:amount': String(price),
      'product:price:currency': 'EUR',
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: true
    }
  })

  if (!product) {
    notFound()
  }

  // Convert Decimal to number for Client Component
  const productJson = {
    ...product,
    price: product.price.toNumber()
  }

  return (
    <>
      <ShippingBanner showOnPages={['product']} />
      <ProductDetailClient product={productJson} />
    </>
  )
}

