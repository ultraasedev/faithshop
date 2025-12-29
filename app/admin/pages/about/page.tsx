import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPageConfig, savePageConfig, initPageDefaults } from '@/app/actions/admin/page-content'
import { PageContentEditor } from '@/components/admin/pages/PageContentEditor'

const PAGE_SLUG = 'about'
const PAGE_TITLE = 'Page À Propos'

const FIELDS = [
  { key: 'hero_subtitle', label: 'Hero - Sous-titre', type: 'text' as const, placeholder: 'Notre Histoire' },
  { key: 'hero_title_1', label: 'Hero - Titre ligne 1', type: 'text' as const, placeholder: 'Faith in' },
  { key: 'hero_title_2', label: 'Hero - Titre ligne 2 (italique)', type: 'text' as const, placeholder: 'Every Stitch' },
  { key: 'hero_image', label: 'Hero - Image de fond', type: 'image' as const },
  { key: 'manifesto_title', label: 'Manifeste - Titre', type: 'text' as const, placeholder: "Plus qu'une marque, un mouvement." },
  { key: 'manifesto_text_1', label: 'Manifeste - Paragraphe 1', type: 'textarea' as const, rows: 4 },
  { key: 'manifesto_text_2', label: 'Manifeste - Paragraphe 2', type: 'textarea' as const, rows: 4 },
  { key: 'value_1_title', label: 'Valeur 1 - Titre', type: 'text' as const, placeholder: 'Éthique' },
  { key: 'value_1_text', label: 'Valeur 1 - Description', type: 'textarea' as const, rows: 3 },
  { key: 'value_2_title', label: 'Valeur 2 - Titre', type: 'text' as const, placeholder: 'Qualité' },
  { key: 'value_2_text', label: 'Valeur 2 - Description', type: 'textarea' as const, rows: 3 },
  { key: 'value_3_title', label: 'Valeur 3 - Titre', type: 'text' as const, placeholder: 'Communauté' },
  { key: 'value_3_text', label: 'Valeur 3 - Description', type: 'textarea' as const, rows: 3 },
  { key: 'quote_text', label: 'Citation', type: 'textarea' as const, rows: 2 },
  { key: 'quote_author', label: 'Auteur de la citation', type: 'text' as const, placeholder: '— Le Fondateur' },
]

const DEFAULTS: Record<string, string> = {
  hero_subtitle: 'Notre Histoire',
  hero_title_1: 'Faith in',
  hero_title_2: 'Every Stitch',
  hero_image: '/hero-bg.png',
  manifesto_title: "Plus qu'une marque, un mouvement.",
  manifesto_text_1: "Faith Shop est né d'une conviction simple : la mode peut être un vecteur de valeurs. Nous créons des pièces intemporelles qui allient esthétique minimaliste et messages profonds.",
  manifesto_text_2: "Chaque vêtement est conçu comme une toile vierge sur laquelle s'expriment la foi, l'espoir et l'amour. Nous ne suivons pas les tendances éphémères, nous construisons un style durable.",
  value_1_title: 'Éthique',
  value_1_text: "Nous privilégions des matières biologiques et une production responsable. Le respect de l'humain et de la planète est au cœur de notre démarche.",
  value_2_title: 'Qualité',
  value_2_text: "Pas de compromis. Des cotons épais (240gsm+), des coutures renforcées et des finitions impeccables pour des vêtements qui durent.",
  value_3_title: 'Communauté',
  value_3_text: "Faith Shop rassemble ceux qui croient en quelque chose de plus grand. Une famille unie par des valeurs communes.",
  quote_text: "La mode passe, le style reste. La foi est éternelle.",
  quote_author: '— Le Fondateur',
}

export default async function AboutEditorPage() {
  const session = await auth()
  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/admin')
  }

  // Initialize defaults if needed
  await initPageDefaults(PAGE_SLUG, DEFAULTS)

  // Get current values
  const values = await getPageConfig(PAGE_SLUG)

  // Merge with defaults for display
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
