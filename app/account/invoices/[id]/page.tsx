import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PrintButton from '@/components/PrintButton'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      items: true,
      user: true,
    },
  })

  if (!order) {
    redirect('/account')
  }

  // Generate PDF-like invoice page
  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold">FAITH SHOP</h1>
            <p className="text-gray-600 text-sm mt-2">Mode Chrétienne Premium</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">FACTURE</h2>
            <p className="text-gray-600 text-sm">N° {order.orderNumber}</p>
            <p className="text-gray-600 text-sm">
              Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">Vendu par</h3>
            <p className="font-medium">Faith Shop SAS</p>
            <p className="text-gray-600 text-sm">123 Rue de la Mode</p>
            <p className="text-gray-600 text-sm">75001 Paris, France</p>
            <p className="text-gray-600 text-sm">SIRET: 123 456 789 00012</p>
            <p className="text-gray-600 text-sm">TVA: FR12345678901</p>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">Facturé à</h3>
            <p className="font-medium">{order.user?.name || order.guestName || 'Client'}</p>
            <p className="text-gray-600 text-sm">{order.billingAddress || order.shippingAddress}</p>
            <p className="text-gray-600 text-sm">
              {order.billingZip || order.shippingZip} {order.billingCity || order.shippingCity}
            </p>
            <p className="text-gray-600 text-sm">{order.billingCountry || order.shippingCountry}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-sm font-bold uppercase tracking-wider text-gray-500">Description</th>
              <th className="text-center py-3 text-sm font-bold uppercase tracking-wider text-gray-500">Qté</th>
              <th className="text-right py-3 text-sm font-bold uppercase tracking-wider text-gray-500">Prix unitaire</th>
              <th className="text-right py-3 text-sm font-bold uppercase tracking-wider text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-4">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-gray-500 text-sm">
                    {item.size && `Taille: ${item.size}`}
                    {item.size && item.color && ' | '}
                    {item.color && `Couleur: ${item.color}`}
                  </p>
                </td>
                <td className="text-center py-4">{item.quantity}</td>
                <td className="text-right py-4">{(Number(item.price) / item.quantity).toFixed(2)} €</td>
                <td className="text-right py-4 font-medium">{Number(item.price).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Sous-total HT</span>
              <span>{(Number(order.subtotal) / 1.2).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">TVA (20%)</span>
              <span>{(Number(order.subtotal) - Number(order.subtotal) / 1.2).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Livraison</span>
              <span>{Number(order.shippingCost).toFixed(2)} €</span>
            </div>
            {order.discountAmount && Number(order.discountAmount) > 0 && (
              <div className="flex justify-between py-2 text-green-600">
                <span>Réduction</span>
                <span>-{Number(order.discountAmount).toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-gray-900 font-bold text-lg">
              <span>Total TTC</span>
              <span>{Number(order.total).toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            <strong>Méthode de paiement:</strong> {order.paymentMethod === 'STRIPE' ? 'Carte bancaire' : order.paymentMethod}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            <strong>Statut:</strong> Payée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-xs">
          <p>Faith Shop SAS - Capital social: 10 000€ - RCS Paris B 123 456 789</p>
          <p className="mt-1">Merci pour votre confiance !</p>
        </div>

        {/* Print Button */}
        <div className="mt-8 text-center print:hidden">
          <PrintButton />
        </div>
      </div>
    </div>
  )
}
