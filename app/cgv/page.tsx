import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CGVPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-12 font-serif text-4xl text-center">Conditions Générales de Vente</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-muted-foreground">
            <p className="text-sm italic">Dernière mise à jour : 30 Novembre 2025</p>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">1. Objet</h2>
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées sur le site faith-shop.fr entre l'entreprise FAITH SHOP et tout consommateur (le "Client").
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">2. Produits et Prix</h2>
              <p>
                Les produits sont décrits avec la plus grande exactitude possible. Les prix sont indiqués en Euros (€) toutes taxes comprises (TTC). Les frais de livraison sont indiqués avant la validation de la commande.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">3. Commande</h2>
              <p>
                La commande est validée une fois le paiement accepté. FAITH SHOP se réserve le droit d'annuler toute commande d'un client avec lequel il existerait un litige relatif au paiement d'une commande antérieure.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">4. Paiement</h2>
              <p>
                Le paiement est exigible immédiatement à la commande. Les paiements sont sécurisés via nos partenaires (Stripe, PayPal).
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">5. Livraison</h2>
              <p>
                Les produits sont livrés à l'adresse indiquée lors de la commande. Les délais de livraison sont donnés à titre indicatif. FAITH SHOP ne pourra être tenu responsable des conséquences dues à un retard d'acheminement.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">6. Rétractation</h2>
              <p>
                Conformément à la loi, le Client dispose d'un délai de 14 jours à compter de la réception des produits pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités, à l'exception des frais de retour.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
