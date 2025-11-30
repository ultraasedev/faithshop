import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section - Minimalist & Centered */}
        <section className="relative pt-32 pb-20 px-6 lg:px-12 text-center max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6 block animate-fade-in-up">
            Depuis 2024
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight animate-fade-in-up delay-100">
            L'Art de la Foi <br />
            <span className="italic text-muted-foreground">au Quotidien</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed animate-fade-in-up delay-200">
            Faith Shop est né d'une vision : créer un vestiaire qui célèbre la spiritualité avec l'exigence du luxe et la sincérité de l'artisanat.
          </p>
        </section>

        {/* Image Grid - Editorial Style */}
        <section className="px-4 lg:px-8 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[80vh] md:h-[600px]">
            {/* Large Image Left */}
            <div className="md:col-span-8 relative h-full bg-secondary overflow-hidden group">
              <Image
                src="/hero-bg.png"
                alt="Atelier de création"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            {/* Small Images Right */}
            <div className="md:col-span-4 flex flex-col gap-4 h-full">
              <div className="relative flex-1 bg-secondary overflow-hidden group">
                 <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-300 font-serif text-4xl">
                    Matière
                 </div>
              </div>
              <div className="relative flex-1 bg-secondary overflow-hidden group">
                 <div className="absolute inset-0 flex items-center justify-center bg-stone-800 text-stone-600 font-serif text-4xl">
                    Esprit
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto Section */}
        <section className="py-24 bg-secondary/10 border-y border-border">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl">Notre Philosophie</h2>
              <div className="w-12 h-px bg-primary mx-auto"></div>
            </div>
            <p className="text-lg leading-loose text-muted-foreground">
              Nous croyons que ce que nous portons est une extension de ce que nous sommes. 
              Chaque pièce de notre collection est pensée comme un rappel silencieux mais puissant. 
              Pas de logos ostentatoires, juste des coupes parfaites, des matières nobles (coton bio, lin) 
              et des messages subtils qui résonnent avec votre âme.
            </p>
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border/50">
              <div>
                <span className="block font-serif text-3xl mb-2">100%</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Coton Bio</span>
              </div>
              <div>
                <span className="block font-serif text-3xl mb-2">FR</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Design Paris</span>
              </div>
              <div>
                <span className="block font-serif text-3xl mb-2">∞</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Garantie</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
