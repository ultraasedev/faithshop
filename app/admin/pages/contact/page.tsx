import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPageConfig, savePageConfig, initPageDefaults } from '@/app/actions/admin/page-content'
import { PageContentEditor } from '@/components/admin/pages/PageContentEditor'

const PAGE_SLUG = 'contact'
const PAGE_TITLE = 'Page Contact'

const FIELDS = [
  { key: 'title', label: 'Titre de la page', type: 'text' as const, placeholder: 'Contactez-nous' },
  { key: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
  { key: 'service_title', label: 'Titre Service Client', type: 'text' as const, placeholder: 'Service Client' },
  { key: 'service_hours', label: 'Horaires', type: 'textarea' as const, rows: 2 },
  { key: 'service_email', label: 'Email Service Client', type: 'text' as const },
  { key: 'press_title', label: 'Titre Presse', type: 'text' as const, placeholder: 'Presse & Collabs' },
  { key: 'press_email', label: 'Email Presse', type: 'text' as const },
  { key: 'success_title', label: 'Titre Message de succès', type: 'text' as const },
  { key: 'success_message', label: 'Message de succès', type: 'textarea' as const, rows: 2 },
]

const DEFAULTS: Record<string, string> = {
  title: 'Contactez-nous',
  description: "Une question sur une commande, un produit ou simplement envie de nous dire bonjour ? Notre équipe est là pour vous répondre.",
  service_title: 'Service Client',
  service_hours: "Du Lundi au Vendredi\n9h00 - 18h00",
  service_email: 'contact@faith-shop.fr',
  press_title: 'Presse & Collabs',
  press_email: 'press@faith-shop.fr',
  success_title: 'Message Envoyé !',
  success_message: 'Merci de nous avoir contactés. Notre équipe reviendra vers vous sous 24h.',
}

export default async function ContactEditorPage() {
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
