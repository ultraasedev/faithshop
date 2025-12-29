'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { sendContactEmail } from '@/app/actions/contact'
import { Loader2, CheckCircle } from 'lucide-react'

interface ContactClientProps {
  content: {
    title: string
    description: string
    service_title: string
    service_hours: string
    service_email: string
    press_title: string
    press_email: string
    success_title: string
    success_message: string
  }
}

export default function ContactClient({ content }: ContactClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await sendContactEmail(formData)

    if (result.success) {
      setIsSuccess(true)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 md:pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-4xl mb-6 mt-8 md:mt-0">{content.title}</h1>
                <p className="text-muted-foreground leading-relaxed">
                  {content.description}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-xl">{content.service_title}</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {content.service_hours}
                </p>
                <a href={`mailto:${content.service_email}`} className="text-primary hover:underline block">{content.service_email}</a>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-xl">{content.press_title}</h3>
                <a href={`mailto:${content.press_email}`} className="text-muted-foreground hover:text-primary transition-colors">{content.press_email}</a>
              </div>
            </div>

            {/* Form */}
            <div className="bg-secondary/10 p-8 border border-border">
              {isSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h3 className="font-serif text-2xl">{content.success_title}</h3>
                  <p className="text-muted-foreground">
                    {content.success_message}
                  </p>
                  <Button variant="outline" onClick={() => setIsSuccess(false)} className="mt-4">
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstname" className="text-sm font-bold uppercase tracking-widest">Prénom</label>
                      <input name="firstname" type="text" id="firstname" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastname" className="text-sm font-bold uppercase tracking-widest">Nom</label>
                      <input name="lastname" type="text" id="lastname" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold uppercase tracking-widest">Email</label>
                    <input name="email" type="email" id="email" required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-bold uppercase tracking-widest">Sujet</label>
                    <select name="subject" id="subject" className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors appearance-none">
                      <option value="commande">Ma commande</option>
                      <option value="produit">Information produit</option>
                      <option value="retour">Retour / Échange</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-bold uppercase tracking-widest">Message</label>
                    <textarea name="message" id="message" rows={5} required className="w-full bg-background border border-border p-3 focus:outline-none focus:border-foreground transition-colors resize-none"></textarea>
                  </div>

                  <Button disabled={isSubmitting} className="w-full h-12 rounded-none uppercase tracking-widest font-bold">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...
                      </>
                    ) : (
                      'Envoyer'
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
