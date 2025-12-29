import { getPageConfig } from '@/app/actions/admin/page-content'
import ContactClient from '@/components/contact/ContactClient'

export const dynamic = 'force-dynamic'

const DEFAULTS = {
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

export default async function ContactPage() {
  const dbContent = await getPageConfig('contact')
  const content = { ...DEFAULTS, ...dbContent }

  return <ContactClient content={content} />
}
