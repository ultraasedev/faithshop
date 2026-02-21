import PDFDocument from 'pdfkit'

// =============================================
// Types
// =============================================

interface CompanyInfo {
  name: string
  address: string
  city: string
  zip: string
  country: string
  phone: string
  email: string
  siret: string
  tvaNumber: string // Numéro TVA intracommunautaire
  rcs: string // Ex: "RCS Paris 123 456 789"
}

interface OrderData {
  orderNumber: string
  createdAt: Date
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddress: string
  shippingCity: string
  shippingZip: string
  shippingCountry: string
  billingAddress?: string
  billingCity?: string
  billingZip?: string
  billingCountry?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    color?: string
    size?: string
  }>
  subtotal: number
  shippingCost: number
  discountAmount: number
  taxAmount: number
  total: number
}

interface ShippingData {
  carrier: string
  trackingNumber: string
  trackingUrl: string
  shippedAt: Date
}

// =============================================
// Config entreprise (depuis SiteConfig ou défaut)
// =============================================

async function getCompanyInfo(): Promise<CompanyInfo> {
  try {
    const { prisma } = await import('@/lib/prisma')
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'general.name',
            'general.email',
            'general.phone',
            'legal.companyName',
            'legal.address',
            'legal.city',
            'legal.zip',
            'legal.country',
            'legal.siret',
            'legal.tvaNumber',
            'legal.rcs'
          ]
        }
      }
    })
    const get = (key: string) => configs.find(c => c.key === key)?.value || ''

    return {
      name: get('legal.companyName') || get('general.name') || 'Faith Shop',
      address: get('legal.address') || '',
      city: get('legal.city') || '',
      zip: get('legal.zip') || '',
      country: get('legal.country') || 'France',
      phone: get('general.phone') || '',
      email: get('general.email') || '',
      siret: get('legal.siret') || '',
      tvaNumber: get('legal.tvaNumber') || '',
      rcs: get('legal.rcs') || ''
    }
  } catch {
    return {
      name: process.env.COMPANY_NAME || 'Faith Shop',
      address: process.env.COMPANY_ADDRESS || '',
      city: process.env.COMPANY_CITY || '',
      zip: process.env.COMPANY_ZIP || '',
      country: 'France',
      phone: process.env.COMPANY_PHONE || '',
      email: process.env.ADMIN_EMAIL || '',
      siret: process.env.COMPANY_SIRET || '',
      tvaNumber: process.env.COMPANY_TVA || '',
      rcs: process.env.COMPANY_RCS || ''
    }
  }
}

// =============================================
// Helpers
// =============================================

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} EUR`
}

function generateInvoiceNumber(orderNumber: string, date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `FA-${year}${month}-${orderNumber.replace(/[^A-Za-z0-9]/g, '')}`
}

function generateDeliveryNoteNumber(orderNumber: string): string {
  return `BL-${orderNumber.replace(/[^A-Za-z0-9]/g, '')}`
}

// TVA standard France
const TVA_RATE = 0.20

function pdfToBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.end()
  })
}

// =============================================
// Shared layout helpers
// =============================================

function drawHeader(
  doc: InstanceType<typeof PDFDocument>,
  company: CompanyInfo,
  title: string,
  docNumber: string,
  date: Date
) {
  // Company name
  doc.fontSize(20).font('Helvetica-Bold').text(company.name.toUpperCase(), 50, 50)
  doc.fontSize(9).font('Helvetica')
  if (company.address) doc.text(company.address, 50, 75)
  const cityLine = [company.zip, company.city].filter(Boolean).join(' ')
  if (cityLine) doc.text(cityLine)
  if (company.phone) doc.text(`Tél : ${company.phone}`)
  if (company.email) doc.text(`Email : ${company.email}`)

  // Document title (right side)
  doc.fontSize(18).font('Helvetica-Bold').text(title, 350, 50, { align: 'right' })
  doc.fontSize(10).font('Helvetica')
  doc.text(`N° : ${docNumber}`, 350, 75, { align: 'right' })
  doc.text(`Date : ${formatDate(date)}`, 350, 90, { align: 'right' })

  // Horizontal line
  doc.moveTo(50, 140).lineTo(545, 140).lineWidth(1).stroke('#000')
}

function drawCustomerBlock(
  doc: InstanceType<typeof PDFDocument>,
  order: OrderData,
  y: number,
  label: string = 'Client'
) {
  doc.fontSize(10).font('Helvetica-Bold').text(label, 350, y)
  doc.fontSize(9).font('Helvetica')
  doc.text(order.customerName, 350, y + 15)
  doc.text(order.shippingAddress, 350, y + 28)
  doc.text(`${order.shippingZip} ${order.shippingCity}`, 350, y + 41)
  if (order.shippingCountry && order.shippingCountry !== 'FR') {
    doc.text(order.shippingCountry, 350, y + 54)
  }
  if (order.customerEmail) doc.text(order.customerEmail, 350, y + (order.shippingCountry !== 'FR' ? 67 : 54))
}

function drawBillingBlock(
  doc: InstanceType<typeof PDFDocument>,
  order: OrderData,
  y: number
) {
  const addr = order.billingAddress || order.shippingAddress
  const city = order.billingCity || order.shippingCity
  const zip = order.billingZip || order.shippingZip

  doc.fontSize(10).font('Helvetica-Bold').text('Adresse de facturation', 50, y)
  doc.fontSize(9).font('Helvetica')
  doc.text(order.customerName, 50, y + 15)
  doc.text(addr, 50, y + 28)
  doc.text(`${zip} ${city}`, 50, y + 41)
}

function drawItemsTable(
  doc: InstanceType<typeof PDFDocument>,
  order: OrderData,
  y: number,
  showTVA: boolean = false
): number {
  const tableTop = y
  const colX = { desc: 50, qty: 320, unitPrice: 390, total: 480 }

  // Header
  doc.rect(50, tableTop, 495, 20).fill('#f0f0f0')
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
  doc.text('Désignation', colX.desc + 5, tableTop + 5)
  doc.text('Qté', colX.qty, tableTop + 5, { width: 50, align: 'center' })
  doc.text('Prix unit.', colX.unitPrice, tableTop + 5, { width: 70, align: 'right' })
  doc.text('Total', colX.total, tableTop + 5, { width: 65, align: 'right' })

  let currentY = tableTop + 25
  doc.font('Helvetica').fontSize(9)

  for (const item of order.items) {
    const lineTotal = item.price * item.quantity
    const details = [item.color, item.size].filter(Boolean).join(' / ')

    doc.fillColor('#000').text(item.name, colX.desc + 5, currentY)
    if (details) {
      doc.fontSize(8).fillColor('#666').text(details, colX.desc + 5, currentY + 12)
      doc.fontSize(9)
    }

    doc.fillColor('#000')
    doc.text(String(item.quantity), colX.qty, currentY, { width: 50, align: 'center' })
    doc.text(formatCurrency(item.price), colX.unitPrice, currentY, { width: 70, align: 'right' })
    doc.text(formatCurrency(lineTotal), colX.total, currentY, { width: 65, align: 'right' })

    currentY += details ? 28 : 18

    // Separator line
    doc.moveTo(50, currentY).lineTo(545, currentY).lineWidth(0.3).strokeColor('#ddd').stroke()
    currentY += 5
  }

  // Totals
  currentY += 10
  const totalsX = 400
  const totalsW = 145

  doc.font('Helvetica').fontSize(9)
  doc.text('Sous-total HT', totalsX, currentY)
  const ht = showTVA ? order.subtotal / (1 + TVA_RATE) : order.subtotal
  doc.text(formatCurrency(showTVA ? ht : order.subtotal), totalsX, currentY, { width: totalsW, align: 'right' })
  currentY += 15

  if (showTVA) {
    const tvaAmount = order.subtotal - ht
    doc.text(`TVA (${(TVA_RATE * 100).toFixed(0)}%)`, totalsX, currentY)
    doc.text(formatCurrency(tvaAmount), totalsX, currentY, { width: totalsW, align: 'right' })
    currentY += 15
  }

  if (order.discountAmount > 0) {
    doc.text('Remise', totalsX, currentY)
    doc.text(`-${formatCurrency(order.discountAmount)}`, totalsX, currentY, { width: totalsW, align: 'right' })
    currentY += 15
  }

  doc.text('Frais de livraison', totalsX, currentY)
  doc.text(order.shippingCost === 0 ? 'Gratuit' : formatCurrency(order.shippingCost), totalsX, currentY, { width: totalsW, align: 'right' })
  currentY += 18

  // Total TTC
  doc.moveTo(totalsX, currentY).lineTo(545, currentY).lineWidth(1).strokeColor('#000').stroke()
  currentY += 5
  doc.font('Helvetica-Bold').fontSize(12)
  doc.text('TOTAL TTC', totalsX, currentY)
  doc.text(formatCurrency(order.total), totalsX, currentY, { width: totalsW, align: 'right' })

  return currentY + 25
}

function drawLegalFooter(
  doc: InstanceType<typeof PDFDocument>,
  company: CompanyInfo,
  type: 'order' | 'delivery' | 'invoice'
) {
  const y = doc.page.height - 80
  doc.fontSize(7).font('Helvetica').fillColor('#888')

  const lines: string[] = []

  if (company.siret) lines.push(`SIRET : ${company.siret}`)
  if (company.tvaNumber) lines.push(`TVA Intracom. : ${company.tvaNumber}`)
  if (company.rcs) lines.push(company.rcs)

  if (type === 'invoice') {
    lines.push('En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée.')
    lines.push('Indemnité forfaitaire pour frais de recouvrement : 40,00 EUR (Art. L441-10 du Code de commerce)')
  }

  if (type === 'order') {
    lines.push('Conformément à l\'article L221-18 du Code de la consommation, vous disposez d\'un délai de 14 jours pour exercer votre droit de rétractation.')
  }

  lines.push(`${company.name} — ${[company.address, company.zip, company.city].filter(Boolean).join(', ')}`)

  doc.text(lines.join(' | '), 50, y, { width: 495, align: 'center', lineGap: 2 })
}

// =============================================
// BON DE COMMANDE (Order Confirmation)
// =============================================

export async function generateOrderConfirmationPDF(order: OrderData): Promise<Buffer> {
  const company = await getCompanyInfo()
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  drawHeader(doc, company, 'BON DE COMMANDE', order.orderNumber, order.createdAt)
  drawCustomerBlock(doc, order, 155, 'Livrer à')
  drawBillingBlock(doc, order, 155)

  const afterTable = drawItemsTable(doc, order, 240)

  // Payment info
  doc.fontSize(9).font('Helvetica').fillColor('#000')
  doc.text('Paiement : Carte bancaire (Stripe)', 50, afterTable + 10)

  drawLegalFooter(doc, company, 'order')

  return pdfToBuffer(doc)
}

// =============================================
// BON DE LIVRAISON (Delivery Note)
// =============================================

export async function generateDeliveryNotePDF(
  order: OrderData,
  shipping: ShippingData
): Promise<Buffer> {
  const company = await getCompanyInfo()
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const noteNumber = generateDeliveryNoteNumber(order.orderNumber)

  drawHeader(doc, company, 'BON DE LIVRAISON', noteNumber, shipping.shippedAt)

  // Reference commande
  doc.fontSize(9).font('Helvetica')
  doc.text(`Réf. commande : ${order.orderNumber}`, 50, 115)
  doc.text(`Date de commande : ${formatDate(order.createdAt)}`, 50, 128)

  drawCustomerBlock(doc, order, 155, 'Destinataire')

  // Shipping info box
  const boxY = 155
  doc.rect(50, boxY, 250, 60).lineWidth(0.5).strokeColor('#ccc').stroke()
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
  doc.text('Informations de livraison', 60, boxY + 8)
  doc.font('Helvetica').fontSize(9)
  doc.text(`Transporteur : ${shipping.carrier}`, 60, boxY + 22)
  doc.text(`N° de suivi : ${shipping.trackingNumber}`, 60, boxY + 35)

  // Items (simplified - no prices on delivery note)
  const tableTop = 240
  doc.rect(50, tableTop, 495, 20).fill('#f0f0f0')
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000')
  doc.text('Désignation', 55, tableTop + 5)
  doc.text('Quantité', 400, tableTop + 5, { width: 80, align: 'center' })

  let currentY = tableTop + 25
  doc.font('Helvetica').fontSize(9)

  for (const item of order.items) {
    const details = [item.color, item.size].filter(Boolean).join(' / ')
    doc.text(item.name, 55, currentY)
    if (details) {
      doc.fontSize(8).fillColor('#666').text(details, 55, currentY + 12)
      doc.fontSize(9).fillColor('#000')
    }
    doc.text(String(item.quantity), 400, currentY, { width: 80, align: 'center' })
    currentY += details ? 28 : 18
    doc.moveTo(50, currentY).lineTo(545, currentY).lineWidth(0.3).strokeColor('#ddd').stroke()
    currentY += 5
  }

  // Signature zone
  currentY += 30
  doc.fontSize(9).font('Helvetica')
  doc.text('Signature du destinataire :', 50, currentY)
  doc.text('Date de réception :', 300, currentY)
  doc.rect(50, currentY + 15, 200, 50).lineWidth(0.5).strokeColor('#ccc').stroke()
  doc.rect(300, currentY + 15, 200, 50).lineWidth(0.5).strokeColor('#ccc').stroke()

  drawLegalFooter(doc, company, 'delivery')

  return pdfToBuffer(doc)
}

// =============================================
// FACTURE (Invoice)
// =============================================

export async function generateInvoicePDF(
  order: OrderData,
  deliveredAt: Date
): Promise<Buffer> {
  const company = await getCompanyInfo()
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const invoiceNumber = generateInvoiceNumber(order.orderNumber, deliveredAt)

  drawHeader(doc, company, 'FACTURE', invoiceNumber, deliveredAt)

  // Reference commande
  doc.fontSize(9).font('Helvetica')
  doc.text(`Réf. commande : ${order.orderNumber}`, 50, 115)
  doc.text(`Date de commande : ${formatDate(order.createdAt)}`, 50, 128)

  drawCustomerBlock(doc, order, 155, 'Facturer à')
  drawBillingBlock(doc, order, 155)

  const afterTable = drawItemsTable(doc, order, 250, true)

  // Payment & delivery info
  doc.fontSize(9).font('Helvetica').fillColor('#000')
  doc.text(`Paiement : Carte bancaire — Payé le ${formatDate(order.createdAt)}`, 50, afterTable + 10)
  doc.text(`Livraison : ${formatDate(deliveredAt)}`, 50, afterTable + 23)

  // Legal mentions for invoice
  doc.fontSize(8).fillColor('#444')
  const mentionsY = afterTable + 50
  doc.text('Conditions de paiement : Payé à la commande.', 50, mentionsY)
  doc.text('TVA non applicable, art. 293 B du CGI.', 50, mentionsY + 12) // Si micro-entreprise
  // Si assujetti TVA, remplacer par : doc.text(`TVA à ${(TVA_RATE*100)}% — N° TVA : ${company.tvaNumber}`, 50, mentionsY + 12)

  drawLegalFooter(doc, company, 'invoice')

  return pdfToBuffer(doc)
}
