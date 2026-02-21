import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import SessionProvider from '@/components/SessionProvider'
import { TawktoWidget } from '@/components/TawktoWidget'

import { getThemes, getSeoConfig, getThemeConfig } from '@/app/actions/admin/settings'

import { getIntegrations } from '@/app/actions/admin/cms'
import { generateStructuredData } from '@/lib/seo'
import Script from 'next/script'

// Generate dynamic metadata from database settings
export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoConfig = await getSeoConfig()

    return {
      title: seoConfig.metaTitle || "Faith Shop | Mode Chrétienne Premium",
      description: seoConfig.metaDescription || "Découvrez notre collection de vêtements de qualité.",
      keywords: seoConfig.keywords,
      icons: {
        icon: seoConfig.favicon || "/favicon.jpeg",
        shortcut: seoConfig.favicon || "/favicon.jpeg",
        apple: seoConfig.favicon || "/favicon.jpeg",
      },
      openGraph: {
        title: seoConfig.metaTitle || "Faith Shop | Mode Chrétienne Premium",
        description: seoConfig.metaDescription || "Découvrez notre collection de vêtements de qualité.",
        url: "https://faith-shop.fr",
        siteName: seoConfig.siteName || "Faith Shop",
        images: seoConfig.ogImage ? [{ url: seoConfig.ogImage }] : [],
        locale: "fr_FR",
        type: "website",
      },
      alternates: {
        canonical: "https://faith-shop.fr",
      },
    }
  } catch (error) {
    // Fallback metadata if database is not available
    return {
      title: "Faith Shop | Mode Chrétienne Premium",
      description: "Découvrez notre collection de vêtements de qualité.",
      icons: {
        icon: "/favicon.jpeg",
        shortcut: "/favicon.jpeg",
        apple: "/favicon.jpeg",
      },
    }
  }
}

// Force le layout à être dynamique pour éviter les problèmes de connexion DB au build
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let allThemes: any[] = []
  let integrations: any[] = []
  let structuredData: any = null
  let defaultDarkMode = false

  try {
    const [themes, ints, seoData, themeConfig] = await Promise.all([
      getThemes(),
      getIntegrations(),
      generateStructuredData(),
      getThemeConfig()
    ])
    // Serialize themes to avoid DateTime hydration issues
    allThemes = themes.map(t => ({
      name: t.name,
      isDefault: t.isDefault,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      accentColor: t.accentColor,
      backgroundColor: t.backgroundColor,
      textColor: t.textColor,
      mutedColor: t.mutedColor,
      borderColor: t.borderColor
    }))
    integrations = ints
    structuredData = seoData
    defaultDarkMode = themeConfig.darkModeDefault
  } catch (error) {
    console.error('Failed to fetch layout data:', error)
  }

  const ga = integrations.find((i: any) => i.provider === 'google_analytics' && i.isEnabled)
  const gads = integrations.find((i: any) => i.provider === 'google_ads' && i.isEnabled)
  const fb = integrations.find((i: any) => i.provider === 'facebook_pixel' && i.isEnabled)

  const gaId = ga ? JSON.parse(ga.config).measurementId : null
  const gadsId = gads ? JSON.parse(gads.config).conversionId : null
  const fbId = fb ? JSON.parse(fb.config).pixelId : null

  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Prevent theme flash - must be first */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && ${defaultDarkMode}) ||
                      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        {/* Données structurées pour IA et SEO */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData)
            }}
          />
        )}

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        
        {/* Google Ads */}
        {gadsId && (
           <Script id="google-ads" strategy="afterInteractive">
             {`
               window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
               gtag('config', '${gadsId}');
             `}
           </Script>
        )}

        {/* Facebook Pixel */}
        {fbId && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <SessionProvider>
          <ThemeProvider themes={allThemes} defaultDarkMode={defaultDarkMode}>
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </SessionProvider>

        {/* Tawk.to Live Chat Widget - Hidden on admin */}
        <TawktoWidget />
      </body>
    </html>
  )
}
