import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: { select: { name: true } },
            variant: { select: { name: true } }
          }
        },
        shipping: true,
        discountCode: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Header
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FAITH SHOP', 20, 25)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Streetwear avec un message', 20, 32)

    // Title
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BON DE COMMANDE', pageWidth - 20, 25, { align: 'right' })

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`N° ${order.orderNumber}`, pageWidth - 20, 32, { align: 'right' })
    pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, pageWidth - 20, 38, { align: 'right' })

    // Status
    const statusLabels: Record<string, string> = {
      PENDING: 'En attente', PAID: 'Payée', PROCESSING: 'En préparation',
      SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée', REFUNDED: 'Remboursée'
    }
    pdf.text(`Statut: ${statusLabels[order.status] || order.status}`, pageWidth - 20, 44, { align: 'right' })

    // Separator
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, 50, pageWidth - 20, 50)

    // Customer info
    let yPos = 60

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Client:', 20, yPos)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    yPos += 6
    pdf.text(order.user?.name || order.guestName || 'Client', 20, yPos)
    yPos += 5
    pdf.text(order.user?.email || order.guestEmail || '', 20, yPos)
    if (order.phone || order.guestPhone) {
      yPos += 5
      pdf.text(`Tél: ${order.phone || order.guestPhone}`, 20, yPos)
    }

    // Shipping address
    pdf.setFont('helvetica', 'bold')
    pdf.text('Adresse de livraison:', pageWidth / 2, 60)

    pdf.setFont('helvetica', 'normal')
    yPos = 66
    if (order.shippingAddress) {
      const address = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress

      pdf.text(address.name || order.user?.name || '', pageWidth / 2, yPos)
      yPos += 5
      pdf.text(address.line1 || '', pageWidth / 2, yPos)
      if (address.line2) {
        yPos += 5
        pdf.text(address.line2, pageWidth / 2, yPos)
      }
      yPos += 5
      pdf.text(`${address.zipCode || ''} ${address.city || ''}`, pageWidth / 2, yPos)
      yPos += 5
      pdf.text(address.country || 'France', pageWidth / 2, yPos)
    }

    // Shipping method
    if (order.shipping) {
      yPos += 8
      pdf.setFont('helvetica', 'bold')
      pdf.text('Transporteur:', pageWidth / 2, yPos)
      pdf.setFont('helvetica', 'normal')
      const carrierLabels: Record<string, string> = {
        colissimo: 'Colissimo', chronopost: 'Chronopost', ups: 'UPS',
        dhl: 'DHL', mondialrelay: 'Mondial Relay'
      }
      pdf.text(carrierLabels[order.shipping.carrier] || order.shipping.carrier, pageWidth / 2 + 30, yPos)
      if (order.shipping.trackingNumber) {
        yPos += 5
        pdf.text(`Suivi: ${order.shipping.trackingNumber}`, pageWidth / 2, yPos)
      }
    }

    // Items table
    yPos = 115

    // Table header
    pdf.setFillColor(245, 245, 245)
    pdf.rect(20, yPos - 5, pageWidth - 40, 10, 'F')

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Article', 25, yPos + 1)
    pdf.text('Qté', 110, yPos + 1)
    pdf.text('Prix unitaire', 130, yPos + 1)
    pdf.text('Total', pageWidth - 25, yPos + 1, { align: 'right' })

    yPos += 12

    // Table rows
    pdf.setFont('helvetica', 'normal')
    for (const item of order.items) {
      const itemName = item.product?.name || 'Produit'
      const variantName = item.variant?.name ? ` - ${item.variant.name}` : ''
      const price = Number(item.price)
      const total = price * item.quantity

      pdf.text(`${itemName}${variantName}`.substring(0, 50), 25, yPos)
      pdf.text(String(item.quantity), 115, yPos)
      pdf.text(`${price.toFixed(2)} EUR`, 130, yPos)
      pdf.text(`${total.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })

      yPos += 8
    }

    // Separator
    yPos += 5
    pdf.line(20, yPos, pageWidth - 20, yPos)
    yPos += 10

    // Totals
    const subtotal = Number(order.subtotal)
    const shipping = Number(order.shippingCost)
    const discount = Number(order.discountAmount)
    const tax = Number(order.taxAmount)
    const total = Number(order.total)
    const totalsX = pageWidth - 80

    pdf.text('Sous-total:', totalsX, yPos)
    pdf.text(`${subtotal.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })
    yPos += 6

    pdf.text('Livraison:', totalsX, yPos)
    pdf.text(shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })
    yPos += 6

    if (discount > 0) {
      pdf.text('Réduction:', totalsX, yPos)
      if (order.discountCode) {
        pdf.text(`(${order.discountCode.code})`, totalsX - 25, yPos)
      }
      pdf.text(`-${discount.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })
      yPos += 6
    }

    if (tax > 0) {
      pdf.text('TVA:', totalsX, yPos)
      pdf.text(`${tax.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })
      yPos += 6
    }

    yPos += 4
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('TOTAL:', totalsX, yPos)
    pdf.text(`${total.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })

    // Notes
    yPos += 20
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)

    const paymentLabels: Record<string, string> = {
      STRIPE: 'Carte bancaire', STRIPE_INSTALLMENTS: 'Paiement en 3x', PAYPAL: 'PayPal'
    }
    pdf.text(`Paiement: ${paymentLabels[order.paymentMethod || ''] || order.paymentMethod || 'Non spécifié'}`, 20, yPos)

    if (order.notes) {
      yPos += 8
      pdf.setFont('helvetica', 'bold')
      pdf.text('Notes:', 20, yPos)
      pdf.setFont('helvetica', 'normal')
      yPos += 5
      pdf.text(order.notes.substring(0, 100), 20, yPos)
    }

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text('Faith Shop - SIRET: XXXXXXXXXX - TVA: FRXXXXXXXXX', pageWidth / 2, footerY, { align: 'center' })
    pdf.text('contact@faith-shop.fr | www.faith-shop.fr', pageWidth / 2, footerY + 5, { align: 'center' })

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="bon-commande-${order.orderNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erreur génération bon de commande:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
