import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface LegalPageTemplateProps {
  title: string
  content: string
  lastUpdate?: string
}

export function LegalPageTemplate({ title, content, lastUpdate }: LegalPageTemplateProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-20 pt-40">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-12 font-serif text-4xl text-center">{title}</h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground">
            {lastUpdate && (
              <p className="text-sm italic">Dernière mise à jour : {lastUpdate}</p>
            )}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
