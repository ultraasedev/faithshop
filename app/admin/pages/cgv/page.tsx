import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPageConfig, savePageConfig, initPageDefaults } from '@/app/actions/admin/page-content'
import { PageContentEditor } from '@/components/admin/pages/PageContentEditor'

const PAGE_SLUG = 'cgv'
const PAGE_TITLE = 'CGV - Conditions Générales de Vente'

const FIELDS = [
  { key: 'title', label: 'Titre', type: 'text' as const, placeholder: 'Conditions Générales de Vente' },
  { key: 'last_update', label: 'Date de mise à jour', type: 'text' as const, placeholder: '30 Novembre 2025' },
  { key: 'content', label: 'Contenu (HTML)', type: 'textarea' as const, rows: 20 },
]

const DEFAULTS: Record<string, string> = {
  title: 'Conditions Générales de Vente',
  last_update: '30 Novembre 2025',
  content: `<section>
  <h2 class="text-foreground font-serif text-xl mb-4">1. Objet</h2>
  <p>Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées sur le site faith-shop.fr entre l'entreprise FAITH SHOP et tout consommateur (le "Client").</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">2. Produits et Prix</h2>
  <p>Les produits sont décrits avec la plus grande exactitude possible. Les prix sont indiqués en Euros (€) toutes taxes comprises (TTC). Les frais de livraison sont indiqués avant la validation de la commande.</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">3. Commande</h2>
  <p>La commande est validée une fois le paiement accepté. FAITH SHOP se réserve le droit d'annuler toute commande d'un client avec lequel il existerait un litige relatif au paiement d'une commande antérieure.</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">4. Paiement</h2>
  <p>Le paiement est exigible immédiatement à la commande. Les paiements sont sécurisés via nos partenaires (Stripe, PayPal).</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">5. Livraison</h2>
  <p>Les produits sont livrés à l'adresse indiquée lors de la commande. Les délais de livraison sont donnés à titre indicatif. FAITH SHOP ne pourra être tenu responsable des conséquences dues à un retard d'acheminement.</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">6. Droit de rétractation</h2>
  <p>Conformément à l'article L.221-18 du Code de la consommation, le Client dispose d'un délai de 14 jours pour exercer son droit de rétractation. Les frais de retour sont à la charge du Client sauf en cas de défaut ou d'erreur de notre part.</p>
</section>`,
}

export default async function CGVEditorPage() {
  const session = await auth()
  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/admin')
  }

  await initPageDefaults(PAGE_SLUG, DEFAULTS)
  const values = await getPageConfig(PAGE_SLUG)
  const initialValues = { ...DEFAULTS, ...values }

  async function handleSave(newValues: Record<string, string>) {
    'use server'
    return savePageConfig(PAGE_SLUG, newValues)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageContentEditor
        pageSlug={PAGE_SLUG}
        pageTitle={PAGE_TITLE}
        fields={FIELDS}
        initialValues={initialValues}
        onSave={handleSave}
      />
    </div>
  )
}
