import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPageConfig, savePageConfig, initPageDefaults } from '@/app/actions/admin/page-content'
import { PageContentEditor } from '@/components/admin/pages/PageContentEditor'

const PAGE_SLUG = 'livraison'
const PAGE_TITLE = 'Livraison & Retours'

const FIELDS = [
  { key: 'title', label: 'Titre', type: 'text' as const, placeholder: 'Livraison & Retours' },
  { key: 'content', label: 'Contenu (HTML)', type: 'textarea' as const, rows: 20 },
]

const DEFAULTS: Record<string, string> = {
  title: 'Livraison & Retours',
  content: `<section>
  <h2 class="text-foreground font-serif text-xl mb-4">Livraison</h2>
  <p>Nous livrons en France métropolitaine et dans les DOM-TOM.</p>
  <ul class="list-disc pl-6 mt-4 space-y-2">
    <li><strong>France métropolitaine</strong> : 4,95€ (gratuit dès 100€)</li>
    <li><strong>DOM-TOM</strong> : 9,95€</li>
    <li><strong>Délais</strong> : 2-5 jours ouvrés</li>
  </ul>
</section>

<section class="mt-8">
  <h2 class="text-foreground font-serif text-xl mb-4">Retours</h2>
  <p>Vous disposez de 30 jours pour retourner un article non porté, avec étiquettes.</p>
  <ul class="list-disc pl-6 mt-4 space-y-2">
    <li>Retours gratuits en France métropolitaine</li>
    <li>Remboursement sous 14 jours après réception</li>
    <li>Contactez-nous à retours@faith-shop.fr</li>
  </ul>
</section>`,
}

export default async function LivraisonEditorPage() {
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
