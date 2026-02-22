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

    // Generate PDF
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Header
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FAITH SHOP', 20, 25)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Streetwear avec un message', 20, 32)

    // Invoice title
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FACTURE', pageWidth - 20, 25, { align: 'right' })

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`N° ${order.orderNumber}`, pageWidth - 20, 32, { align: 'right' })
    pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, pageWidth - 20, 38, { align: 'right' })

    // Line separator
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, 45, pageWidth - 20, 45)

    // Customer info
    let yPos = 55

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Facturé à:', 20, yPos)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    yPos += 6
    pdf.text(order.user?.name || order.guestName || 'Client', 20, yPos)
    yPos += 5
    pdf.text(order.user?.email || order.guestEmail || '', 20, yPos)

    if (order.shippingAddress) {
      const address = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress

      yPos += 5
      pdf.text(address.line1 || '', 20, yPos)
      if (address.line2) {
        yPos += 5
        pdf.text(address.line2, 20, yPos)
      }
      yPos += 5
      pdf.text(`${address.zipCode || ''} ${address.city || ''}`, 20, yPos)
      yPos += 5
      pdf.text(address.country || 'France', 20, yPos)
    }

    // Shipping address
    pdf.setFont('helvetica', 'bold')
    pdf.text('Livré à:', pageWidth / 2, 55)

    pdf.setFont('helvetica', 'normal')
    yPos = 61
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

    // Items table
    yPos = 110

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
      pdf.text(`${price.toFixed(2)} €`, 130, yPos)
      pdf.text(`${total.toFixed(2)} €`, pageWidth - 25, yPos, { align: 'right' })

      yPos += 8
    }

    // Line separator
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
    pdf.text(`${subtotal.toFixed(2)} €`, pageWidth - 25, yPos, { align: 'right' })
    yPos += 6

    pdf.text('Livraison:', totalsX, yPos)
    pdf.text(shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} €`, pageWidth - 25, yPos, { align: 'right' })
    yPos += 6

    if (discount > 0) {
      pdf.text('Réduction:', totalsX, yPos)
      pdf.text(`-${discount.toFixed(2)} €`, pageWidth - 25, yPos, { align: 'right' })
      yPos += 6
    }

    if (tax > 0) {
      pdf.text('TVA:', totalsX, yPos)
      pdf.text(`${tax.toFixed(2)} €`, pageWidth - 25, yPos, { align: 'right' })
      yPos += 6
    }

    yPos += 4
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('TOTAL:', totalsX, yPos)
    pdf.text(`${total.toFixed(2)} €`, pageWidth - 25, yPos, { align: 'right' })

    // Payment info
    yPos += 20
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Méthode de paiement: ${getPaymentMethodLabel(order.paymentMethod)}`, 20, yPos)
    yPos += 5
    pdf.text(`Statut du paiement: ${getPaymentStatusLabel(order.paymentStatus)}`, 20, yPos)

    // Refund info if applicable
    if (order.status === 'REFUNDED' || order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED') {
      yPos += 10
      pdf.setTextColor(220, 38, 38)
      pdf.setFont('helvetica', 'bold')
      pdf.text('COMMANDE REMBOURSÉE', 20, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
    }

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text('Faith Shop - SIRET: XXXXXXXXXX - TVA: FRXXXXXXXXX', pageWidth / 2, footerY, { align: 'center' })
    pdf.text('contact@faith-shop.fr | www.faith-shop.fr', pageWidth / 2, footerY + 5, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="facture-${order.orderNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function getPaymentMethodLabel(method: string | null): string {
  const labels: Record<string, string> = {
    STRIPE: 'Carte bancaire',
    STRIPE_INSTALLMENTS: 'Paiement en 3x',
    PAYPAL: 'PayPal'
  }
  return labels[method || ''] || method || 'Non spécifié'
}

function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    COMPLETED: 'Payé',
    FAILED: 'Échoué',
    REFUNDED: 'Remboursé',
    PARTIALLY_REFUNDED: 'Partiellement remboursé'
  }
  return labels[status] || status
}
