import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Truck, Globe, Clock, ShieldCheck, MapPin, Package } from 'lucide-react'
import { getShippingSettings } from '@/app/actions/admin/shipping-settings'

export default async function ShippingPage() {
  const shippingSettings = await getShippingSettings()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="font-serif text-4xl md:text-5xl mb-6">Livraison & Retours</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Nous nous engageons à vous livrer vos pièces favorites avec le plus grand soin, partout dans le monde.
            </p>
          </div>

          {/* Methods Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="bg-secondary/10 p-8 border border-border/50 hover:border-foreground/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-serif text-xl mb-3">France Métropolitaine</h3>
              <p className="text-muted-foreground text-sm mb-4">Livraison standard offerte dès {shippingSettings.freeThreshold}€ d'achat.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>Standard (Colissimo)</span> <span className="font-bold">{shippingSettings.franceStandard.toFixed(2)}€</span></li>
                <li className="flex justify-between"><span>Express (Chronopost)</span> <span className="font-bold">{shippingSettings.franceExpress.toFixed(2)}€</span></li>
              </ul>
            </div>

            <div className="bg-secondary/10 p-8 border border-border/50 hover:border-foreground/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-serif text-xl mb-3">International</h3>
              <p className="text-muted-foreground text-sm mb-4">Livraison dans plus de 50 pays.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>Europe</span> <span className="font-bold">{shippingSettings.europe.toFixed(2)}€</span></li>
                <li className="flex justify-between"><span>Monde</span> <span className="font-bold">{shippingSettings.world.toFixed(2)}€</span></li>
              </ul>
            </div>

            <div className="bg-secondary/10 p-8 border border-border/50 hover:border-foreground/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-serif text-xl mb-3">Délais</h3>
              <p className="text-muted-foreground text-sm mb-4">Expédition sous {shippingSettings.processingTime}.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>France</span> <span className="font-bold">2-4 jours</span></li>
                <li className="flex justify-between"><span>International</span> <span className="font-bold">5-10 jours</span></li>
              </ul>
            </div>
          </div>

          {/* Timeline Process */}
          <div className="mb-24">
            <h2 className="font-serif text-3xl text-center mb-16">Le parcours de votre commande</h2>
            <div className="relative">
              {/* Line */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {[
                  { icon: Package, title: "Préparation", desc: "Votre commande est préparée avec soin dans notre atelier." },
                  { icon: ShieldCheck, title: "Contrôle", desc: "Chaque pièce est vérifiée avant expédition." },
                  { icon: Truck, title: "Expédition", desc: "Remise au transporteur et envoi du numéro de suivi." },
                  { icon: MapPin, title: "Livraison", desc: "Réception à votre domicile ou en point relais." }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center bg-background p-4">
                    <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center mb-6 shadow-lg">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold uppercase tracking-widest text-sm mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Returns Section */}
          <div className="bg-secondary/5 p-8 md:p-16 border border-border text-center max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl mb-6">Politique de Retours</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Vous disposez de 30 jours après réception de votre commande pour nous retourner vos articles s'ils ne vous conviennent pas. Les retours sont gratuits depuis la France métropolitaine.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-background border border-border">
                <span className="block text-4xl font-serif mb-2 text-foreground/20">01</span>
                <h4 className="font-bold text-sm uppercase mb-2">Déclarez</h4>
                <p className="text-xs text-muted-foreground">Connectez-vous à votre compte et déclarez votre retour.</p>
              </div>
              <div className="p-6 bg-background border border-border">
                <span className="block text-4xl font-serif mb-2 text-foreground/20">02</span>
                <h4 className="font-bold text-sm uppercase mb-2">Imprimez</h4>
                <p className="text-xs text-muted-foreground">Téléchargez et imprimez votre étiquette de retour prépayée.</p>
              </div>
              <div className="p-6 bg-background border border-border">
                <span className="block text-4xl font-serif mb-2 text-foreground/20">03</span>
                <h4 className="font-bold text-sm uppercase mb-2">Envoyez</h4>
                <p className="text-xs text-muted-foreground">Déposez votre colis dans le point relais le plus proche.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
