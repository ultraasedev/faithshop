import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getPageConfig } from '@/app/actions/admin/page-content'

export const dynamic = 'force-dynamic'

const DEFAULTS = {
  title: 'Mentions Légales',
  content: `<section>
  <h2 class="text-foreground font-serif text-xl mb-4">1. Éditeur du site</h2>
  <p>Le site <strong>faith-shop.fr</strong> est édité par l'entreprise individuelle <strong>FAITH SHOP</strong>.<br />
  Siège social : [Adresse Complète]<br />
  Immatriculée au RCS sous le numéro : [Numéro SIRET]<br />
  Contact : contact@faith-shop.fr</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">2. Hébergement</h2>
  <p>Le site est hébergé par <strong>Vercel Inc.</strong><br />
  Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">3. Propriété intellectuelle</h2>
  <p>L'ensemble des éléments figurant sur le site faith-shop.fr relèvent des législations françaises et internationales sur le droit d'auteur et la propriété intellectuelle.</p>
</section>`,
}

export default async function LegalPage() {
  const dbContent = await getPageConfig('legal')
  const content = { ...DEFAULTS, ...dbContent }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-20 pt-40">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-12 font-serif text-4xl text-center">{content.title}</h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground">
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
