import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPageConfig, savePageConfig, initPageDefaults } from '@/app/actions/admin/page-content'
import { PageContentEditor } from '@/components/admin/pages/PageContentEditor'

const PAGE_SLUG = 'privacy'
const PAGE_TITLE = 'Politique de Confidentialité'

const FIELDS = [
  { key: 'title', label: 'Titre', type: 'text' as const, placeholder: 'Politique de Confidentialité' },
  { key: 'last_update', label: 'Date de mise à jour', type: 'text' as const, placeholder: '30 Novembre 2025' },
  { key: 'content', label: 'Contenu (HTML)', type: 'textarea' as const, rows: 20 },
]

const DEFAULTS: Record<string, string> = {
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

export default async function PrivacyEditorPage() {
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
