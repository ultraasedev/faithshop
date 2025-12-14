import { getSiteConfigs } from '@/app/actions/admin/settings'

export async function generateStructuredData() {
  try {
    const seoConfigs = await getSiteConfigs('seo')
    const config: any = {}

    // Parse les configurations SEO
    seoConfigs.forEach(item => {
      const key = item.key.replace('seo_', '')
      try {
        config[key] = item.type === 'json' ? JSON.parse(item.value) : item.value
      } catch (e) {
        config[key] = item.value
      }
    })

    // Organisation de base
    const organization = {
      "@context": "https://schema.org",
      "@type": config.businessType || "ClothingStore",
      "name": config.businessName || "Faith Shop",
      "description": config.businessDescription || "Boutique de vêtements chrétiens premium",
      "url": "https://faith-shop.fr",
      "logo": `https://faith-shop.fr${config.logo || '/logo2-nobg.png'}`,
      "image": `https://faith-shop.fr${config.logo || '/logo2-nobg.png'}`,
      "telephone": config.phone,
      "email": config.email || "contact@faith-shop.fr",
      "priceRange": config.priceRange || "€€",
      "currenciesAccepted": "EUR",
      "paymentAccepted": config.acceptedPayments || ["Carte bancaire", "PayPal"],
      "areaServed": config.deliveryAreas || ["France"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Vêtements chrétiens",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "T-shirts chrétiens",
              "category": "Clothing"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Hoodies chrétiens",
              "category": "Clothing"
            }
          }
        ]
      }
    }

    // Adresse si disponible
    if (config.address && config.city) {
      organization.address = {
        "@type": "PostalAddress",
        "streetAddress": config.address,
        "addressLocality": config.city,
        "postalCode": config.postalCode,
        "addressCountry": config.country || "France"
      }
    }

    // Horaires d'ouverture si disponibles
    if (config.openingHours) {
      const dayMap = {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday"
      }

      organization.openingHoursSpecification = Object.entries(config.openingHours)
        .filter(([_, hours]: [string, any]) => !hours.closed && hours.open && hours.close)
        .map(([day, hours]: [string, any]) => ({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": `https://schema.org/${dayMap[day as keyof typeof dayMap]}`,
          "opens": hours.open,
          "closes": hours.close
        }))
    }

    // Note et avis si disponibles
    if (config.aggregateRating && config.reviewCount) {
      organization.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": config.aggregateRating,
        "reviewCount": config.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }

    // Réseaux sociaux
    const socialConfigs = await getSiteConfigs('social')
    if (socialConfigs.length > 0) {
      organization.sameAs = socialConfigs
        .map(item => {
          try {
            const social = JSON.parse(item.value)
            return social.isVisible ? social.url : null
          } catch {
            return null
          }
        })
        .filter(Boolean)
    }

    return organization
  } catch (error) {
    console.error('Error generating structured data:', error)

    // Fallback basique
    return {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": "Faith Shop",
      "description": "Boutique de vêtements chrétiens premium et éthiques",
      "url": "https://faith-shop.fr",
      "logo": "https://faith-shop.fr/logo2-nobg.png"
    }
  }
}

export async function generateProductStructuredData(product: any) {
  const seoConfigs = await getSiteConfigs('seo')
  const config: any = {}

  seoConfigs.forEach(item => {
    const key = item.key.replace('seo_', '')
    try {
      config[key] = item.type === 'json' ? JSON.parse(item.value) : item.value
    } catch (e) {
      config[key] = item.value
    }
  })

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images.map((img: string) => `https://faith-shop.fr${img}`),
    "sku": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": config.businessName || "Faith Shop"
    },
    "category": "Clothing",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": config.businessName || "Faith Shop"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "FR"
        }
      }
    }
  }
}

export async function generateBreadcrumbStructuredData(breadcrumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://faith-shop.fr${item.url}`
    }))
  }
}