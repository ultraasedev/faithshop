import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getPageConfig } from '@/app/actions/admin/page-content'

export const dynamic = 'force-dynamic'

// Default values
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

export default async function AboutPage() {
  // Fetch editable content from database
  const dbContent = await getPageConfig('about')
  const content = { ...DEFAULTS, ...dbContent }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* Hero Section - Full Height */}
        <div className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src={content.hero_image}
              alt="Faith Shop Background"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative z-20 text-center text-white px-4 max-w-4xl">
            <span className="block text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">{content.hero_subtitle}</span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {content.hero_title_1} <br/><span className="italic font-light">{content.hero_title_2}</span>
            </h1>
          </div>
        </div>

        {/* Manifesto Section */}
        <div className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">
                {content.manifesto_title.split(',').map((part, i) => (
                  <span key={i}>{part}{i === 0 ? ',' : ''}<br/></span>
                ))}
              </h2>
              <div className="w-20 h-1 bg-foreground" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                {content.manifesto_text_1}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {content.manifesto_text_2}
              </p>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
              <span className="font-serif text-5xl md:text-6xl font-bold tracking-tighter text-gray-900">
                Faith-Shop
              </span>
            </div>
          </div>
        </div>

        {/* Values Section - Dark Mode */}
        <div className="bg-foreground text-background py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-6">
                <span className="text-6xl font-serif opacity-20">01</span>
                <h3 className="text-xl font-bold uppercase tracking-widest">{content.value_1_title}</h3>
                <p className="text-white/70 leading-relaxed">
                  {content.value_1_text}
                </p>
              </div>
              <div className="space-y-6">
                <span className="text-6xl font-serif opacity-20">02</span>
                <h3 className="text-xl font-bold uppercase tracking-widest">{content.value_2_title}</h3>
                <p className="text-white/70 leading-relaxed">
                  {content.value_2_text}
                </p>
              </div>
              <div className="space-y-6">
                <span className="text-6xl font-serif opacity-20">03</span>
                <h3 className="text-xl font-bold uppercase tracking-widest">{content.value_3_title}</h3>
                <p className="text-white/70 leading-relaxed">
                  {content.value_3_text}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="py-32 px-4 text-center bg-secondary/10">
          <blockquote className="max-w-4xl mx-auto">
            <p className="font-serif text-3xl md:text-5xl italic leading-tight mb-8">
              &quot;{content.quote_text}&quot;
            </p>
            <footer className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {content.quote_author}
            </footer>
          </blockquote>
        </div>

      </main>
      <Footer />
    </div>
  )
}
