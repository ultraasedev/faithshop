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

export const metadata: Metadata = {
  title: "Faith Shop | Mode Chrétienne Premium & Éthique",
  description: "Découvrez Faith Shop, la boutique de vêtements chrétiens haut de gamme. T-shirts, hoodies et accessoires inspirés par la foi. Livraison offerte dès 100€.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Faith Shop | Mode Chrétienne Premium",
    description: "L'élégance de la foi. Collection intemporelle de vêtements unisexe.",
    url: "https://faith-shop.fr",
    siteName: "Faith Shop",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://faith-shop.fr",
  },
};

import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import SessionProvider from '@/components/SessionProvider'

import { getActiveTheme } from '@/app/actions/admin/settings'

import { getIntegrations } from '@/app/actions/admin/cms'
import Script from 'next/script'

// Force le layout à être dynamique pour éviter les problèmes de connexion DB au build
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let activeTheme = null
  let integrations: any[] = []

  try {
    const [theme, ints] = await Promise.all([
      getActiveTheme(),
      getIntegrations()
    ])
    activeTheme = theme
    integrations = ints
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
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
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
          <ThemeProvider defaultThemeConfig={activeTheme}>
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
