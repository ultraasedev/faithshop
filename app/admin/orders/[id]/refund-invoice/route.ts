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
        refunds: {
          where: { status: 'COMPLETED' },
          include: { adminUser: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    if (order.refunds.length === 0) {
      return NextResponse.json({ error: 'Aucun remboursement trouvé pour cette commande' }, { status: 404 })
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

    // Title - red for refund
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(220, 38, 38)
    pdf.text('AVOIR / NOTE DE CREDIT', pageWidth - 20, 25, { align: 'right' })

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Commande N° ${order.orderNumber}`, pageWidth - 20, 32, { align: 'right' })
    pdf.text(`Date commande: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, pageWidth - 20, 38, { align: 'right' })

    // Separator
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, 45, pageWidth - 20, 45)

    // Customer info
    let yPos = 55

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Client:', 20, yPos)

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
      yPos += 5
      pdf.text(`${address.zipCode || ''} ${address.city || ''}`, 20, yPos)
      yPos += 5
      pdf.text(address.country || 'France', 20, yPos)
    }

    // Original order summary
    pdf.setFont('helvetica', 'bold')
    pdf.text('Commande originale:', pageWidth / 2, 55)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total: ${Number(order.total).toFixed(2)} EUR`, pageWidth / 2, 61)

    const paymentLabels: Record<string, string> = {
      COMPLETED: 'Payé', REFUNDED: 'Remboursé', PARTIALLY_REFUNDED: 'Partiellement remboursé'
    }
    pdf.text(`Statut paiement: ${paymentLabels[order.paymentStatus] || order.paymentStatus}`, pageWidth / 2, 67)

    // Refund details table
    yPos = 100

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(220, 38, 38)
    pdf.text('DETAIL DES REMBOURSEMENTS', 20, yPos)
    pdf.setTextColor(0, 0, 0)

    yPos += 12

    // Table header
    pdf.setFillColor(254, 226, 226) // red-100
    pdf.rect(20, yPos - 5, pageWidth - 40, 10, 'F')

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Date', 25, yPos + 1)
    pdf.text('Type', 55, yPos + 1)
    pdf.text('Motif', 85, yPos + 1)
    pdf.text('Montant', pageWidth - 25, yPos + 1, { align: 'right' })

    yPos += 12

    const typeLabels: Record<string, string> = {
      FULL: 'Complet', PARTIAL: 'Partiel', STORE_CREDIT: 'Avoir boutique'
    }

    let totalRefunded = 0

    pdf.setFont('helvetica', 'normal')
    for (const refund of order.refunds) {
      const amount = Number(refund.amount)
      totalRefunded += amount

      pdf.text(new Date(refund.createdAt).toLocaleDateString('fr-FR'), 25, yPos)
      pdf.text(typeLabels[refund.type] || refund.type, 55, yPos)
      pdf.text(refund.reason.substring(0, 35), 85, yPos)
      pdf.setTextColor(220, 38, 38)
      pdf.text(`-${amount.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })
      pdf.setTextColor(0, 0, 0)

      yPos += 8

      // Stripe refund ID
      if (refund.stripeRefundId) {
        pdf.setFontSize(7)
        pdf.setTextColor(150, 150, 150)
        pdf.text(`Ref Stripe: ${refund.stripeRefundId}`, 25, yPos)
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(9)
        yPos += 6
      }

      // Admin who processed
      if (refund.adminUser?.name) {
        pdf.setFontSize(7)
        pdf.setTextColor(150, 150, 150)
        pdf.text(`Traité par: ${refund.adminUser.name}`, 25, yPos)
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(9)
        yPos += 6
      }
    }

    // Total refunded
    yPos += 5
    pdf.line(20, yPos, pageWidth - 20, yPos)
    yPos += 10

    const totalsX = pageWidth - 80

    pdf.setFont('helvetica', 'normal')
    pdf.text('Total commande:', totalsX, yPos)
    pdf.text(`${Number(order.total).toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })
    yPos += 6

    pdf.setTextColor(220, 38, 38)
    pdf.text('Total remboursé:', totalsX, yPos)
    pdf.text(`-${totalRefunded.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })
    pdf.setTextColor(0, 0, 0)
    yPos += 8

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    const remaining = Number(order.total) - totalRefunded
    pdf.text('Solde restant:', totalsX, yPos)
    pdf.text(`${remaining.toFixed(2)} EUR`, pageWidth - 25, yPos, { align: 'right' })

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(150, 150, 150)
    pdf.text('Faith Shop - SIRET: XXXXXXXXXX - TVA: FRXXXXXXXXX', pageWidth / 2, footerY, { align: 'center' })
    pdf.text('contact@faith-shop.fr | www.faith-shop.fr', pageWidth / 2, footerY + 5, { align: 'center' })

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="avoir-${order.orderNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erreur génération avoir:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
