import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getPageConfig } from '@/app/actions/admin/page-content'

export const dynamic = 'force-dynamic'

const DEFAULTS = {
  title: 'Politique de Confidentialité',
  last_update: '30 Novembre 2025',
  content: `<section>
  <h2 class="text-foreground font-serif text-xl mb-4">1. Responsable du traitement</h2>
  <p>FAITH SHOP, en qualité de responsable du traitement, collecte et traite vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">2. Données collectées</h2>
  <p>Nous collectons les données que vous nous fournissez directement (nom, email, adresse) ainsi que des données de navigation (cookies, adresse IP).</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">3. Finalités du traitement</h2>
  <p>Vos données sont utilisées pour : la gestion de vos commandes, l'envoi de newsletters (avec votre consentement), l'amélioration de nos services.</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">4. Vos droits</h2>
  <p>Vous disposez des droits d'accès, de rectification, de suppression et de portabilité de vos données. Contactez-nous à privacy@faith-shop.fr.</p>
</section>`,
}

export default async function PrivacyPage() {
  const dbContent = await getPageConfig('privacy')
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
