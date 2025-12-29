import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPageConfig, savePageConfig, initPageDefaults } from '@/app/actions/admin/page-content'
import { PageContentEditor } from '@/components/admin/pages/PageContentEditor'

const PAGE_SLUG = 'legal'
const PAGE_TITLE = 'Mentions Légales'

const FIELDS = [
  { key: 'title', label: 'Titre', type: 'text' as const, placeholder: 'Mentions Légales' },
  { key: 'content', label: 'Contenu (HTML)', type: 'textarea' as const, rows: 20 },
]

const DEFAULTS: Record<string, string> = {
  title: 'Mentions Légales',
  content: `<section>
  <h2 class="text-foreground font-serif text-xl mb-4">1. Éditeur du site</h2>
  <p>Le site <strong>faith-shop.fr</strong> est édité par l'entreprise individuelle <strong>FAITH SHOP</strong>.<br />
  Siège social : [Adresse Complète]<br />
  Immatriculée au RCS sous le numéro : [Numéro SIRET]<br />
  Numéro de TVA : [Numéro TVA]<br />
  Contact : contact@faith-shop.fr</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">2. Hébergement</h2>
  <p>Le site est hébergé par <strong>Vercel Inc.</strong><br />
  Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
</section>

<section>
  <h2 class="text-foreground font-serif text-xl mb-4">3. Propriété intellectuelle</h2>
  <p>L'ensemble des éléments figurant sur le site faith-shop.fr (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) relèvent des législations françaises et internationales sur le droit d'auteur et la propriété intellectuelle.</p>
</section>`,
}

export default async function LegalEditorPage() {
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
