import { prisma } from '../lib/prisma'

/**
 * Migration script to convert existing page content to page builder blocks
 * This preserves the exact design while making it editable via the page builder
 */

interface PageBlock {
  id: string
  type: string
  content: Record<string, unknown>
  settings?: {
    padding?: { top: number; bottom: number; left: number; right: number }
    margin?: { top: number; bottom: number }
    backgroundColor?: string
    textColor?: string
  }
}

// Get page config from SiteConfig
async function getPageConfig(pageSlug: string): Promise<Record<string, string>> {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: { startsWith: `page_${pageSlug}_` }
    }
  })

  const result: Record<string, string> = {}
  for (const config of configs) {
    const key = config.key.replace(`page_${pageSlug}_`, '')
    result[key] = config.value
  }
  return result
}

// About page blocks
const createAboutBlocks = (config: Record<string, string>): PageBlock[] => [
  {
    id: 'about-hero',
    type: 'hero',
    content: {
      title: `${config.hero_title_1 || 'Faith in'}\n${config.hero_title_2 || 'Every Stitch'}`,
      subtitle: config.hero_subtitle || 'Notre Histoire',
      backgroundImage: config.hero_image || '/hero-bg.png',
      alignment: 'center',
      overlay: true,
      overlayOpacity: 40,
      height: '70vh'
    },
    settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
  },
  {
    id: 'about-manifesto',
    type: 'manifesto',
    content: {
      title: config.manifesto_title || "Plus qu'une marque, un mouvement.",
      text1: config.manifesto_text_1 || "Faith Shop est né d'une conviction simple : la mode peut être un vecteur de valeurs.",
      text2: config.manifesto_text_2 || "Chaque vêtement est conçu comme une toile vierge.",
      brandName: 'Faith-Shop',
      layout: 'left'
    },
    settings: { padding: { top: 96, bottom: 96, left: 0, right: 0 } }
  },
  {
    id: 'about-values',
    type: 'values',
    content: {
      values: [
        {
          title: config.value_1_title || 'Éthique',
          text: config.value_1_text || "Nous privilégions des matières biologiques et une production responsable."
        },
        {
          title: config.value_2_title || 'Qualité',
          text: config.value_2_text || "Des cotons épais (240gsm+), des coutures renforcées."
        },
        {
          title: config.value_3_title || 'Communauté',
          text: config.value_3_text || "Faith Shop rassemble ceux qui croient en quelque chose de plus grand."
        }
      ],
      backgroundColor: 'hsl(var(--foreground))',
      textColor: 'hsl(var(--background))'
    },
    settings: { padding: { top: 96, bottom: 96, left: 0, right: 0 } }
  },
  {
    id: 'about-quote',
    type: 'quote',
    content: {
      text: config.quote_text || "La mode passe, le style reste. La foi est éternelle.",
      author: config.quote_author || '— Le Fondateur',
      backgroundColor: 'hsl(var(--secondary) / 0.1)'
    },
    settings: { padding: { top: 128, bottom: 128, left: 0, right: 0 } }
  }
]

// Contact page blocks
const createContactBlocks = (): PageBlock[] => [
  {
    id: 'contact-hero',
    type: 'hero',
    content: {
      title: 'Contactez-nous',
      subtitle: 'Nous sommes là pour vous',
      alignment: 'center',
      overlay: true,
      overlayOpacity: 50,
      height: '40vh'
    },
    settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
  },
  {
    id: 'contact-form',
    type: 'contact-form',
    content: {
      title: 'Envoyez-nous un message',
      description: "Une question ? Une suggestion ? N'hésitez pas à nous écrire.",
      fields: ['name', 'email', 'subject', 'message'],
      submitText: 'Envoyer le message',
      successMessage: 'Merci pour votre message ! Nous vous répondrons sous 24-48h.'
    },
    settings: { padding: { top: 60, bottom: 60, left: 20, right: 20 } }
  }
]

// CGV page blocks
const createCGVBlocks = (): PageBlock[] => [
  {
    id: 'cgv-hero',
    type: 'text',
    content: {
      content: '<h1 class="text-4xl font-serif text-center mb-8">Conditions Générales de Vente</h1><p class="text-center text-muted-foreground">Dernière mise à jour : Janvier 2025</p>',
      alignment: 'center'
    },
    settings: { padding: { top: 120, bottom: 40, left: 20, right: 20 } }
  },
  {
    id: 'cgv-content',
    type: 'text',
    content: {
      content: `
<h2>Article 1 - Objet</h2>
<p>Les présentes conditions générales de vente régissent les relations contractuelles entre Faith Shop et ses clients.</p>

<h2>Article 2 - Prix</h2>
<p>Les prix sont indiqués en euros TTC. Faith Shop se réserve le droit de modifier ses prix à tout moment.</p>

<h2>Article 3 - Commande</h2>
<p>Toute commande implique l'acceptation des présentes conditions générales de vente. La confirmation de commande entraîne acceptation des présentes conditions.</p>

<h2>Article 4 - Paiement</h2>
<p>Le paiement s'effectue en ligne par carte bancaire via notre plateforme sécurisée Stripe.</p>

<h2>Article 5 - Livraison</h2>
<p>Les produits sont livrés à l'adresse indiquée lors de la commande. Les délais de livraison sont donnés à titre indicatif.</p>

<h2>Article 6 - Retours et Remboursements</h2>
<p>Vous disposez d'un délai de 30 jours à compter de la réception pour retourner votre commande. Les articles doivent être retournés dans leur état d'origine.</p>

<h2>Article 7 - Données Personnelles</h2>
<p>Faith Shop s'engage à protéger vos données personnelles conformément au RGPD. Consultez notre politique de confidentialité pour plus d'informations.</p>
`,
      alignment: 'left'
    },
    settings: { padding: { top: 20, bottom: 60, left: 20, right: 20 } }
  }
]

// Legal page blocks
const createLegalBlocks = (): PageBlock[] => [
  {
    id: 'legal-hero',
    type: 'text',
    content: {
      content: '<h1 class="text-4xl font-serif text-center mb-8">Mentions Légales</h1>',
      alignment: 'center'
    },
    settings: { padding: { top: 120, bottom: 40, left: 20, right: 20 } }
  },
  {
    id: 'legal-content',
    type: 'text',
    content: {
      content: `
<h2>Éditeur du site</h2>
<p>Faith Shop<br/>
SIRET : [Numéro SIRET]<br/>
Adresse : [Adresse complète]<br/>
Email : contact@faithshop.fr</p>

<h2>Hébergement</h2>
<p>Ce site est hébergé par Vercel Inc.<br/>
340 S Lemon Ave #4133<br/>
Walnut, CA 91789, USA</p>

<h2>Propriété intellectuelle</h2>
<p>L'ensemble du contenu de ce site (textes, images, logos) est protégé par le droit d'auteur.</p>

<h2>Responsabilité</h2>
<p>Faith Shop s'efforce de fournir des informations exactes mais ne peut garantir l'absence d'erreurs.</p>
`,
      alignment: 'left'
    },
    settings: { padding: { top: 20, bottom: 60, left: 20, right: 20 } }
  }
]

// Privacy page blocks
const createPrivacyBlocks = (): PageBlock[] => [
  {
    id: 'privacy-hero',
    type: 'text',
    content: {
      content: '<h1 class="text-4xl font-serif text-center mb-8">Politique de Confidentialité</h1><p class="text-center text-muted-foreground">Dernière mise à jour : Janvier 2025</p>',
      alignment: 'center'
    },
    settings: { padding: { top: 120, bottom: 40, left: 20, right: 20 } }
  },
  {
    id: 'privacy-content',
    type: 'text',
    content: {
      content: `
<h2>Collecte des données</h2>
<p>Nous collectons uniquement les données nécessaires au traitement de vos commandes : nom, email, adresse de livraison.</p>

<h2>Utilisation des données</h2>
<p>Vos données sont utilisées pour :</p>
<ul>
<li>Traiter vos commandes</li>
<li>Vous informer de l'état de vos commandes</li>
<li>Vous envoyer des communications marketing (si vous y avez consenti)</li>
</ul>

<h2>Protection des données</h2>
<p>Nous utilisons des mesures de sécurité appropriées pour protéger vos données personnelles.</p>

<h2>Vos droits</h2>
<p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à privacy@faithshop.fr.</p>

<h2>Cookies</h2>
<p>Ce site utilise des cookies pour améliorer votre expérience. Vous pouvez les désactiver dans les paramètres de votre navigateur.</p>
`,
      alignment: 'left'
    },
    settings: { padding: { top: 20, bottom: 60, left: 20, right: 20 } }
  }
]

// Livraison page blocks
const createLivraisonBlocks = (): PageBlock[] => [
  {
    id: 'livraison-hero',
    type: 'hero',
    content: {
      title: 'Livraison',
      subtitle: 'Informations sur nos délais et modes de livraison',
      alignment: 'center',
      overlay: true,
      overlayOpacity: 50,
      height: '40vh'
    },
    settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
  },
  {
    id: 'livraison-content',
    type: 'text',
    content: {
      content: `
<h2>Délais de livraison</h2>
<p><strong>France métropolitaine :</strong> 2-5 jours ouvrés<br/>
<strong>Europe :</strong> 5-10 jours ouvrés<br/>
<strong>International :</strong> 10-15 jours ouvrés</p>

<h2>Frais de port</h2>
<p><strong>France :</strong> 4,90€ (Gratuit dès 100€)<br/>
<strong>Europe :</strong> 9,90€ (Gratuit dès 150€)<br/>
<strong>International :</strong> Sur devis</p>

<h2>Suivi de commande</h2>
<p>Un email avec votre numéro de suivi vous sera envoyé dès l'expédition de votre colis.</p>

<h2>Pré-commandes</h2>
<p>Pour les articles en pré-commande, les expéditions commencent à la date indiquée sur la fiche produit.</p>
`,
      alignment: 'left'
    },
    settings: { padding: { top: 60, bottom: 60, left: 20, right: 20 } }
  }
]

// Homepage blocks
const createHomeBlocks = (): PageBlock[] => [
  {
    id: 'home-slider',
    type: 'slider',
    content: {
      slides: [
        {
          image: '/hero-bg.png',
          title: 'Collection 2025',
          subtitle: 'Découvrez notre nouvelle collection',
          buttonText: 'Découvrir',
          buttonLink: '/shop',
          alignment: 'center'
        }
      ],
      autoplay: true,
      autoplaySpeed: 5000,
      showArrows: true,
      showDots: true,
      height: '100vh',
      overlay: true,
      overlayOpacity: 40
    },
    settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
  },
  {
    id: 'home-products',
    type: 'product-grid',
    content: {
      title: 'Nouveautés',
      source: 'new',
      columns: 4,
      limit: 4,
      showPrice: true,
      showAddToCart: true
    },
    settings: { padding: { top: 80, bottom: 80, left: 20, right: 20 } }
  },
  {
    id: 'home-manifesto',
    type: 'manifesto',
    content: {
      title: "Plus qu'une marque,\nun mouvement.",
      text1: "Faith Shop est né d'une conviction simple : la mode peut être un vecteur de valeurs.",
      text2: "Chaque vêtement est conçu comme une toile vierge sur laquelle s'expriment la foi, l'espoir et l'amour.",
      brandName: 'Faith-Shop',
      layout: 'left'
    },
    settings: { padding: { top: 80, bottom: 80, left: 0, right: 0 } }
  },
  {
    id: 'home-newsletter',
    type: 'newsletter',
    content: {
      title: 'Rejoignez la communauté',
      description: 'Inscrivez-vous pour recevoir nos dernières actualités et offres exclusives.',
      buttonText: "S'inscrire",
      backgroundColor: '#000000'
    },
    settings: { padding: { top: 0, bottom: 0, left: 0, right: 0 } }
  }
]

async function createOrUpdatePage(slug: string, title: string, blocks: PageBlock[]) {
  const content = JSON.stringify({ blocks })

  const existing = await prisma.pageContent.findUnique({
    where: { slug }
  })

  if (existing) {
    // Only update if current content is empty or simple
    const currentContent = existing.content
    let shouldUpdate = false

    try {
      const parsed = JSON.parse(currentContent)
      // Update if blocks array is empty or doesn't exist
      shouldUpdate = !parsed.blocks || parsed.blocks.length === 0
    } catch {
      // If can't parse, it's legacy HTML - update it
      shouldUpdate = true
    }

    if (shouldUpdate) {
      await prisma.pageContent.update({
        where: { slug },
        data: { title, content }
      })
      console.log(`✅ Updated page: ${slug}`)
    } else {
      console.log(`⏭️  Skipped page (has content): ${slug}`)
    }
  } else {
    await prisma.pageContent.create({
      data: {
        slug,
        title,
        content,
        isPublished: true
      }
    })
    console.log(`✅ Created page: ${slug}`)
  }
}

async function main() {
  console.log('🚀 Starting page migration to page builder...\n')

  // Get existing config for about page
  const aboutConfig = await getPageConfig('about')

  // Migrate pages
  await createOrUpdatePage('about', 'À Propos', createAboutBlocks(aboutConfig))
  await createOrUpdatePage('contact', 'Contact', createContactBlocks())
  await createOrUpdatePage('cgv', 'Conditions Générales de Vente', createCGVBlocks())
  await createOrUpdatePage('legal', 'Mentions Légales', createLegalBlocks())
  await createOrUpdatePage('privacy', 'Politique de Confidentialité', createPrivacyBlocks())
  await createOrUpdatePage('livraison', 'Livraison', createLivraisonBlocks())
  await createOrUpdatePage('home', 'Accueil', createHomeBlocks())

  console.log('\n✨ Migration complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
