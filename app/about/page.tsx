import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const dynamic = 'force-dynamic'

export default function AboutPage() {
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
              src="/hero-bg.png"
              alt="Faith Shop Background"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative z-20 text-center text-white px-4 max-w-4xl">
            <span className="block text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">Notre Histoire</span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Faith in <br/><span className="italic font-light">Every Stitch</span>
            </h1>
          </div>
        </div>

        {/* Manifesto Section */}
        <div className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">
                Plus qu&apos;une marque,<br/> un mouvement.
              </h2>
              <div className="w-20 h-1 bg-foreground" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Faith Shop est né d&apos;une conviction simple : la mode peut être un vecteur de valeurs. Nous créons des pièces intemporelles qui allient esthétique minimaliste et messages profonds.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Chaque vêtement est conçu comme une toile vierge sur laquelle s&apos;expriment la foi, l&apos;espoir et l&apos;amour. Nous ne suivons pas les tendances éphémères, nous construisons un style durable.
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
                <h3 className="text-xl font-bold uppercase tracking-widest">Éthique</h3>
                <p className="text-white/70 leading-relaxed">
                  Nous privilégions des matières biologiques et une production responsable. Le respect de l&apos;humain et de la planète est au cœur de notre démarche.
                </p>
              </div>
              <div className="space-y-6">
                <span className="text-6xl font-serif opacity-20">02</span>
                <h3 className="text-xl font-bold uppercase tracking-widest">Qualité</h3>
                <p className="text-white/70 leading-relaxed">
                  Pas de compromis. Des cotons épais (240gsm+), des coutures renforcées et des finitions impeccables pour des vêtements qui durent.
                </p>
              </div>
              <div className="space-y-6">
                <span className="text-6xl font-serif opacity-20">03</span>
                <h3 className="text-xl font-bold uppercase tracking-widest">Communauté</h3>
                <p className="text-white/70 leading-relaxed">
                  Faith Shop rassemble ceux qui croient en quelque chose de plus grand. Une famille unie par des valeurs communes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="py-32 px-4 text-center bg-secondary/10">
          <blockquote className="max-w-4xl mx-auto">
            <p className="font-serif text-3xl md:text-5xl italic leading-tight mb-8">
              &quot;La mode passe, le style reste. La foi est éternelle.&quot;
            </p>
            <footer className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              — Le Fondateur
            </footer>
          </blockquote>
        </div>

      </main>
      <Footer />
    </div>
  )
}
