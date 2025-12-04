import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-20 pt-40">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-12 font-serif text-4xl text-center">Politique de Confidentialité</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-muted-foreground">
            <p>
              La protection de vos données personnelles est une priorité pour FAITH SHOP. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
            </p>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">1. Collecte des données</h2>
              <p>
                Nous collectons les informations que vous nous fournissez directement lorsque vous :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Créez un compte client</li>
                <li>Passez une commande</li>
                <li>Vous inscrivez à notre newsletter</li>
                <li>Contactez notre service client</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">2. Utilisation des données</h2>
              <p>
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Gérer et expédier vos commandes</li>
                <li>Vous envoyer des informations sur le suivi de commande</li>
                <li>Vous informer de nos nouveautés (si vous avez accepté)</li>
                <li>Améliorer votre expérience sur notre site</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">3. Partage des données</h2>
              <p>
                Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées uniquement avec nos prestataires de services essentiels (transporteurs pour la livraison, processeurs de paiement sécurisé).
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">4. Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@faith-shop.fr" className="underline hover:text-primary">contact@faith-shop.fr</a>.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">5. Cookies</h2>
              <p>
                Nous utilisons des cookies pour assurer le bon fonctionnement du site (panier, connexion) et analyser notre trafic. Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient être limitées.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
