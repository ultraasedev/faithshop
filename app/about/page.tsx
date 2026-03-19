import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

const DEFAULTS: Record<string, string> = {
  hero_subtitle: 'Notre Histoire',
  hero_title_1: 'Faith in',
  hero_title_2: 'Every Stitch',
  hero_image: '/hero-bg.png',
  manifesto_title: "Plus qu'une marque, un mouvement.",
  manifesto_text_1: "Faith Shop est né d'une conviction simple : la mode peut être un vecteur de valeurs.",
  manifesto_text_2: "Chaque vêtement est conçu comme une toile vierge sur laquelle s'expriment la foi, l'espoir et l'amour.",
  value_1_title: 'Éthique',
  value_1_text: "Nous privilégions des matières biologiques et une production responsable.",
  value_2_title: 'Qualité',
  value_2_text: "Pas de compromis. Des cotons épais (240gsm+), des coutures renforcées et des finitions impeccables.",
  value_3_title: 'Communauté',
  value_3_text: "Faith Shop rassemble ceux qui croient en quelque chose de plus grand.",
  quote_text: "La mode passe, le style reste. La foi est éternelle.",
  quote_author: '— Le Fondateur',
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'À Propos - Faith Shop',
    description: 'Découvrez l\'histoire et les valeurs de Faith Shop',
  }
}

export default async function AboutPage() {
  noStore()

  // Read from SiteConfig (same data source the admin editor saves to)
  const configs = await prisma.siteConfig.findMany({
    where: { category: 'page_about' }
  })

  const values: Record<string, string> = { ...DEFAULTS }
  configs.forEach(config => {
    const key = config.key.replace('page_about_', '')
    values[key] = config.value
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            {values.hero_image ? (
              <Image
                src={values.hero_image}
                alt="À propos"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-900" />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative text-center text-white px-4">
            <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-80">
              {values.hero_subtitle}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl leading-tight">
              {values.hero_title_1}
              <br />
              <em>{values.hero_title_2}</em>
            </h1>
          </div>
        </section>

        {/* Manifesto Section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-8">
              {values.manifesto_title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {values.manifesto_text_1}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {values.manifesto_text_2}
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-32 px-4 bg-secondary/20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-center mb-16">
              Nos Valeurs
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <h3 className="font-serif text-2xl mb-4">
                    {values[`value_${i}_title`]}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {values[`value_${i}_text`]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-6">
              &ldquo;{values.quote_text}&rdquo;
            </blockquote>
            <cite className="text-muted-foreground text-sm uppercase tracking-widest not-italic">
              {values.quote_author}
            </cite>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
