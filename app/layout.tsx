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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
