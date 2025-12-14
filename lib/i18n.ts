import { getSiteConfigs } from '@/app/actions/admin/settings'

type Locale = 'fr' | 'en' | 'es' | 'de' | 'it'

interface TranslationKeys {
  // Navigation
  'nav.home': string
  'nav.shop': string
  'nav.about': string
  'nav.contact': string
  'nav.new': string

  // Cart
  'cart.empty': string
  'cart.add': string
  'cart.remove': string
  'cart.total': string
  'cart.checkout': string
  'cart.shipping': string
  'cart.free_shipping': string

  // Product
  'product.in_stock': string
  'product.out_of_stock': string
  'product.low_stock': string
  'product.size_guide': string
  'product.add_to_cart': string

  // Checkout
  'checkout.title': string
  'checkout.secure_payment': string
  'checkout.order_summary': string
  'checkout.shipping_address': string
  'checkout.payment_method': string

  // Orders
  'order.success_title': string
  'order.success_message': string
  'order.tracking': string
  'order.status': string

  // General
  'general.loading': string
  'general.save': string
  'general.cancel': string
  'general.edit': string
  'general.delete': string
  'general.search': string

  // Shipping
  'shipping.free_from': string
  'shipping.standard': string
  'shipping.express': string
  'shipping.days': string

  // Footer
  'footer.shop': string
  'footer.info': string
  'footer.legal': string
  'footer.copyright': string
}

// Traductions par défaut (français)
const defaultTranslations: Record<keyof TranslationKeys, string> = {
  // Navigation
  'nav.home': 'Accueil',
  'nav.shop': 'Boutique',
  'nav.about': 'À Propos',
  'nav.contact': 'Contact',
  'nav.new': 'Nouveautés',

  // Cart
  'cart.empty': 'Votre panier est vide',
  'cart.add': 'Ajouter au panier',
  'cart.remove': 'Retirer',
  'cart.total': 'Total',
  'cart.checkout': 'Commander',
  'cart.shipping': 'Livraison',
  'cart.free_shipping': '✓ OFFERTE',

  // Product
  'product.in_stock': 'En stock',
  'product.out_of_stock': 'Rupture de stock',
  'product.low_stock': 'Plus que {} exemplaires !',
  'product.size_guide': 'Guide des tailles',
  'product.add_to_cart': 'Ajouter au panier',

  // Checkout
  'checkout.title': 'Finaliser ma commande',
  'checkout.secure_payment': 'Paiement sécurisé',
  'checkout.order_summary': 'Récapitulatif',
  'checkout.shipping_address': 'Adresse de livraison',
  'checkout.payment_method': 'Mode de paiement',

  // Orders
  'order.success_title': 'Commande confirmée !',
  'order.success_message': 'Merci pour votre commande. Vous recevrez un email de confirmation.',
  'order.tracking': 'Suivi de commande',
  'order.status': 'Statut',

  // General
  'general.loading': 'Chargement...',
  'general.save': 'Sauvegarder',
  'general.cancel': 'Annuler',
  'general.edit': 'Modifier',
  'general.delete': 'Supprimer',
  'general.search': 'Rechercher',

  // Shipping
  'shipping.free_from': 'Livraison offerte dès {}€',
  'shipping.standard': 'Livraison standard',
  'shipping.express': 'Livraison express',
  'shipping.days': '{} jours',

  // Footer
  'footer.shop': 'Boutique',
  'footer.info': 'Informations',
  'footer.legal': 'Légal',
  'footer.copyright': 'Tous droits réservés'
}

// Cache des traductions
let translationsCache: Record<Locale, Partial<TranslationKeys>> = {
  fr: {},
  en: {},
  es: {},
  de: {},
  it: {}
}

// Charger les traductions depuis la DB
export async function loadTranslations(locale: Locale = 'fr'): Promise<TranslationKeys> {
  try {
    const configs = await getSiteConfigs(`i18n_${locale}`)
    const translations: Partial<TranslationKeys> = { ...defaultTranslations }

    configs.forEach(config => {
      const key = config.key.replace(`i18n_${locale}_`, '') as keyof TranslationKeys
      translations[key] = config.value
    })

    translationsCache[locale] = translations
    return translations as TranslationKeys
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error)
    return defaultTranslations
  }
}

// Hook pour utiliser les traductions
export function useTranslations(locale: Locale = 'fr') {
  const t = (key: keyof TranslationKeys, params?: Record<string, string | number>): string => {
    let translation = translationsCache[locale][key] || defaultTranslations[key] || key

    // Remplacer les paramètres
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value))
        translation = translation.replace('{}', String(value)) // Pour compatibility
      })
    }

    return translation
  }

  return { t }
}

// Détecter la langue depuis le navigateur
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'fr'

  const browserLang = navigator.language.split('-')[0] as Locale
  const supportedLocales: Locale[] = ['fr', 'en', 'es', 'de', 'it']

  return supportedLocales.includes(browserLang) ? browserLang : 'fr'
}

// Générer automatiquement les traductions manquantes
export async function generateMissingTranslations(baseLocale: Locale = 'fr') {
  const baseTranslations = await loadTranslations(baseLocale)
  const targetLocales: Locale[] = ['en', 'es', 'de', 'it']

  const autoTranslations: Record<Locale, Partial<TranslationKeys>> = {
    en: {
      // Navigation
      'nav.home': 'Home',
      'nav.shop': 'Shop',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.new': 'New',

      // Cart
      'cart.empty': 'Your cart is empty',
      'cart.add': 'Add to cart',
      'cart.remove': 'Remove',
      'cart.total': 'Total',
      'cart.checkout': 'Checkout',
      'cart.shipping': 'Shipping',
      'cart.free_shipping': '✓ FREE',

      // Product
      'product.in_stock': 'In stock',
      'product.out_of_stock': 'Out of stock',
      'product.low_stock': 'Only {} left!',
      'product.size_guide': 'Size guide',
      'product.add_to_cart': 'Add to cart',

      // General
      'general.loading': 'Loading...',
      'general.save': 'Save',
      'general.cancel': 'Cancel',
      'general.edit': 'Edit',
      'general.delete': 'Delete',
      'general.search': 'Search',

      'footer.copyright': 'All rights reserved'
    },
    es: {
      'nav.home': 'Inicio',
      'nav.shop': 'Tienda',
      'nav.about': 'Acerca',
      'nav.contact': 'Contacto',
      'cart.empty': 'Tu carrito está vacío',
      'cart.add': 'Añadir al carrito',
      'product.add_to_cart': 'Añadir al carrito',
      'general.loading': 'Cargando...',
      'footer.copyright': 'Todos los derechos reservados'
    },
    de: {
      'nav.home': 'Startseite',
      'nav.shop': 'Shop',
      'nav.about': 'Über uns',
      'nav.contact': 'Kontakt',
      'cart.empty': 'Ihr Warenkorb ist leer',
      'cart.add': 'In den Warenkorb',
      'product.add_to_cart': 'In den Warenkorb',
      'general.loading': 'Laden...',
      'footer.copyright': 'Alle Rechte vorbehalten'
    },
    it: {
      'nav.home': 'Home',
      'nav.shop': 'Negozio',
      'nav.about': 'Chi siamo',
      'nav.contact': 'Contatto',
      'cart.empty': 'Il tuo carrello è vuoto',
      'cart.add': 'Aggiungi al carrello',
      'product.add_to_cart': 'Aggiungi al carrello',
      'general.loading': 'Caricamento...',
      'footer.copyright': 'Tutti i diritti riservati'
    }
  }

  return autoTranslations
}

// Types pour TypeScript
export type { Locale, TranslationKeys }