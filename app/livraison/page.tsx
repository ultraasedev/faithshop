import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Truck, Globe, Clock } from 'lucide-react'

export default function ShippingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="mb-12 font-serif text-4xl text-center">Livraison & Expédition</h1>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-secondary/20 p-6 text-center space-y-4">
              <Truck className="w-10 h-10 mx-auto text-primary" />
              <h3 className="font-serif text-lg">France Métropolitaine</h3>
              <p className="text-sm text-muted-foreground">2-4 jours ouvrés</p>
              <p className="font-bold">Offerte dès 100€</p>
            </div>
            <div className="bg-secondary/20 p-6 text-center space-y-4">
              <Globe className="w-10 h-10 mx-auto text-primary" />
              <h3 className="font-serif text-lg">International</h3>
              <p className="text-sm text-muted-foreground">5-10 jours ouvrés</p>
              <p className="font-bold">Calculé au panier</p>
            </div>
            <div className="bg-secondary/20 p-6 text-center space-y-4">
              <Clock className="w-10 h-10 mx-auto text-primary" />
              <h3 className="font-serif text-lg">Préparation</h3>
              <p className="text-sm text-muted-foreground">Expédié sous 24h</p>
              <p className="font-bold">Du Lundi au Vendredi</p>
            </div>
          </div>

          <div className="prose prose-neutral max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-foreground font-serif text-2xl mb-4">Modes de livraison</h2>
              <p>
                Nous travaillons avec les transporteurs les plus fiables pour assurer que votre commande arrive en parfait état.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Colissimo Domicile :</strong> Livraison sans signature en boîte aux lettres.</li>
                <li><strong>Mondial Relay :</strong> Livraison en point relais (choix du point après paiement).</li>
                <li><strong>DHL Express :</strong> Livraison express internationale.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-2xl mb-4">Suivi de commande</h2>
              <p>
                Dès que votre commande est expédiée, vous recevez un email avec un lien de suivi. Vous pouvez également suivre votre colis depuis votre compte client.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
