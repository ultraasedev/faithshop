import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-12 font-serif text-4xl text-center">Mentions Légales</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">1. Éditeur du site</h2>
              <p>
                Le site <strong>faith-shop.fr</strong> est édité par l'entreprise individuelle <strong>FAITH SHOP</strong>.<br />
                Siège social : [Adresse Complète à insérer]<br />
                Immatriculée au Registre du Commerce et des Sociétés sous le numéro : [Numéro SIRET]<br />
                Numéro de TVA intracommunautaire : [Numéro TVA]<br />
                Directeur de la publication : Franck [Nom]<br />
                Contact : <a href="mailto:contact@faith-shop.fr" className="underline hover:text-primary">contact@faith-shop.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">2. Hébergement</h2>
              <p>
                Le site est hébergé par <strong>Vercel Inc.</strong><br />
                Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.<br />
                Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">https://vercel.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">3. Propriété intellectuelle</h2>
              <p>
                L'ensemble des éléments figurant sur le site faith-shop.fr (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) ainsi que le site lui-même, relèvent des législations françaises et internationales sur le droit d'auteur et la propriété intellectuelle.
              </p>
              <p className="mt-4">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'éditeur.
              </p>
            </section>

            <section>
              <h2 className="text-foreground font-serif text-xl mb-4">4. Limitation de responsabilité</h2>
              <p>
                L'éditeur ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site faith-shop.fr. L'éditeur décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur faith-shop.fr.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
