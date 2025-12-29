import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPageConfig, savePageConfig, initPageDefaults } from '@/app/actions/admin/page-content'
import { PageContentEditor } from '@/components/admin/pages/PageContentEditor'

const PAGE_SLUG = 'shop'
const PAGE_TITLE = 'Page Boutique'

const FIELDS = [
  { key: 'title', label: 'Titre de la page', type: 'text' as const, placeholder: 'La Boutique' },
  { key: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
]

const DEFAULTS: Record<string, string> = {
  title: 'La Boutique',
  description: "Découvrez l'ensemble de notre collection. Des pièces conçues pour durer et inspirer.",
}

export default async function ShopEditorPage() {
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
