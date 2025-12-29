import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getPageConfig } from '@/app/actions/admin/page-content'

export const dynamic = 'force-dynamic'

const DEFAULTS = {
  title: 'Conditions Générales de Vente',
  last_update: '30 Novembre 2025',
  content: `<section>
  <h2 class="text-foreground font-serif text-xl mb-4">1. Objet</h2>
  <p>Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées sur le site faith-shop.fr entre l'entreprise FAITH SHOP et tout consommateur (le "Client").</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">2. Produits et Prix</h2>
  <p>Les produits sont décrits avec la plus grande exactitude possible. Les prix sont indiqués en Euros (€) toutes taxes comprises (TTC).</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">3. Commande</h2>
  <p>La commande est validée une fois le paiement accepté.</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">4. Paiement</h2>
  <p>Le paiement est exigible immédiatement à la commande. Les paiements sont sécurisés via nos partenaires (Stripe, PayPal).</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">5. Livraison</h2>
  <p>Les produits sont livrés à l'adresse indiquée lors de la commande.</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">6. Droit de rétractation</h2>
  <p>Conformément à l'article L.221-18 du Code de la consommation, le Client dispose d'un délai de 14 jours pour exercer son droit de rétractation.</p>
</section>`,
}

export default async function CGVPage() {
  const dbContent = await getPageConfig('cgv')
  const content = { ...DEFAULTS, ...dbContent }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-20 pt-40">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-12 font-serif text-4xl text-center">{content.title}</h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground">
            {content.last_update && (
              <p className="text-sm italic">Dernière mise à jour : {content.last_update}</p>
            )}
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
