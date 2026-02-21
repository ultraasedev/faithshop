import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import { getColissimoCredentials, getMondialRelayCredentials } from '@/lib/carriers/credentials'
import { generateLabel as generateColissimoLabel } from '@/lib/carriers/colissimo'
import { generateLabel as generateMondialRelayLabel } from '@/lib/carriers/mondial-relay'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { carrier, weight, deliveryMode, relayPointId } = body as {
    carrier: string
    weight: number
    deliveryMode?: 'relay' | 'home'
    relayPointId?: string
  }

  if (!carrier || !weight) {
    return NextResponse.json({ error: 'Transporteur et poids requis' }, { status: 400 })
  }

  // Récupérer la commande avec ses détails
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      shipping: true
    }
  })

  if (!order) {
    return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
  }

  // Récupérer l'adresse expéditeur depuis la config
  const senderConfigs = await prisma.siteConfig.findMany({
    where: { key: { startsWith: 'general.' } }
  })
  const getSender = (key: string) => senderConfigs.find(c => c.key === key)?.value || ''

  const senderAddress = {
    companyName: getSender('general.siteName') || 'Faith Shop',
    firstName: 'Faith',
    lastName: 'Shop',
    address: getSender('general.address') || '',
    city: '',
    zipCode: '',
    countryCode: 'FR',
    phone: getSender('general.phone') || undefined,
    email: getSender('general.email') || undefined
  }

  // Parse l'adresse expéditeur (format "123 Rue..., 75001 Paris")
  const addressParts = senderAddress.address.split(',').map(s => s.trim())
  if (addressParts.length >= 2) {
    const lastPart = addressParts[addressParts.length - 1]
    const zipCityMatch = lastPart.match(/^(\d{5})\s+(.+)/)
    if (zipCityMatch) {
      senderAddress.zipCode = zipCityMatch[1]
      senderAddress.city = zipCityMatch[2]
      senderAddress.address = addressParts.slice(0, -1).join(', ')
    }
  }

  // Adresse destinataire depuis la commande
  const recipientName = order.guestName || order.user?.name || ''
  const nameParts = recipientName.split(' ')
  const recipient = {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || nameParts[0] || '',
    address: order.shippingAddress,
    city: order.shippingCity,
    zipCode: order.shippingZip,
    countryCode: order.shippingCountry,
    phone: order.shippingPhone || order.guestPhone || order.user?.phone || undefined,
    email: order.guestEmail || order.user?.email || undefined
  }

  try {
    if (carrier === 'colissimo') {
      const credentials = await getColissimoCredentials()
      if (!credentials) {
        return NextResponse.json(
          { error: 'Credentials Colissimo non configurés. Allez dans Paramètres > Transporteurs.' },
          { status: 400 }
        )
      }

      const result = await generateColissimoLabel({
        contractNumber: credentials.contractNumber,
        password: credentials.password,
        sender: senderAddress,
        recipient,
        weight,
        orderNumber: order.orderNumber,
        totalAmount: Number(order.total)
      })

      // Upload le PDF sur Vercel Blob
      const blob = await put(
        `labels/colissimo-${order.orderNumber}-${Date.now()}.pdf`,
        result.labelPdf,
        { access: 'public', contentType: 'application/pdf' }
      )

      // Mettre à jour ou créer le shipping
      const shippingData = {
        carrier: 'Colissimo',
        trackingNumber: result.trackingNumber,
        trackingUrl: result.trackingUrl,
        labelUrl: blob.url,
        labelCreatedAt: new Date(),
        weightKg: weight,
        status: 'LABEL_CREATED' as const
      }

      if (order.shipping) {
        await prisma.shipping.update({
          where: { id: order.shipping.id },
          data: shippingData
        })
      } else {
        await prisma.shipping.create({
          data: {
            ...shippingData,
            orderId: order.id
          }
        })
      }

      // Ajouter un événement shipping
      const shipping = await prisma.shipping.findUnique({ where: { orderId: order.id } })
      if (shipping) {
        await prisma.shippingEvent.create({
          data: {
            shippingId: shipping.id,
            status: 'LABEL_CREATED',
            description: `Étiquette Colissimo créée - ${result.trackingNumber}`
          }
        })
      }

      // Mettre à jour le statut de la commande si elle est encore en PAID
      if (order.status === 'PAID') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PROCESSING' }
        })
      }

      return NextResponse.json({
        trackingNumber: result.trackingNumber,
        trackingUrl: result.trackingUrl,
        labelUrl: blob.url
      })
    }

    if (carrier === 'mondialrelay') {
      const credentials = await getMondialRelayCredentials()
      if (!credentials) {
        return NextResponse.json(
          { error: 'Credentials Mondial Relay non configurés. Allez dans Paramètres > Transporteurs.' },
          { status: 400 }
        )
      }

      if (deliveryMode === 'relay' && !relayPointId) {
        return NextResponse.json(
          { error: 'Veuillez sélectionner un point relais' },
          { status: 400 }
        )
      }

      const senderName = senderAddress.companyName || `${senderAddress.firstName} ${senderAddress.lastName}`

      const result = await generateMondialRelayLabel({
        enseigne: credentials.enseigne,
        privateKey: credentials.privateKey,
        sender: {
          name: senderName,
          address: senderAddress.address,
          city: senderAddress.city,
          zipCode: senderAddress.zipCode,
          countryCode: senderAddress.countryCode,
          phone: senderAddress.phone,
          email: senderAddress.email
        },
        recipient: {
          name: recipientName,
          address: recipient.address,
          city: recipient.city,
          zipCode: recipient.zipCode,
          countryCode: recipient.countryCode,
          phone: recipient.phone,
          email: recipient.email
        },
        weight,
        orderNumber: order.orderNumber,
        deliveryMode: deliveryMode || 'relay',
        relayPointId
      })

      // Mondial Relay donne une URL d'étiquette, pas un PDF
      const shippingData = {
        carrier: 'Mondial Relay',
        trackingNumber: result.trackingNumber,
        trackingUrl: result.trackingUrl,
        labelUrl: result.labelUrl || null,
        labelCreatedAt: new Date(),
        weightKg: weight,
        status: 'LABEL_CREATED' as const
      }

      if (order.shipping) {
        await prisma.shipping.update({
          where: { id: order.shipping.id },
          data: shippingData
        })
      } else {
        await prisma.shipping.create({
          data: {
            ...shippingData,
            orderId: order.id
          }
        })
      }

      const shipping = await prisma.shipping.findUnique({ where: { orderId: order.id } })
      if (shipping) {
        await prisma.shippingEvent.create({
          data: {
            shippingId: shipping.id,
            status: 'LABEL_CREATED',
            description: `Étiquette Mondial Relay créée - ${result.trackingNumber}`
          }
        })
      }

      if (order.status === 'PAID') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PROCESSING' }
        })
      }

      return NextResponse.json({
        trackingNumber: result.trackingNumber,
        trackingUrl: result.trackingUrl,
        labelUrl: result.labelUrl
      })
    }

    return NextResponse.json({ error: `Transporteur "${carrier}" non supporté pour la génération d'étiquettes` }, { status: 400 })

  } catch (error: any) {
    console.error('[Generate Label]', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération de l\'étiquette' },
      { status: 500 }
    )
  }
}
