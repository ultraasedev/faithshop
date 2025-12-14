import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

const footerLinks = {
  shop: [
    { name: 'Nouveautés', href: '/new' },
    { name: 'Vêtements', href: '/shop' },
    { name: 'Accessoires', href: '/accessories' },
  ],
  info: [
    { name: 'À Propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Livraison & Retours', href: '/livraison' },
  ],
  legal: [
    { name: 'Mentions Légales', href: '/legal' },
    { name: 'Confidentialité', href: '/privacy' },
    { name: 'CGV', href: '/cgv' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4 lg:gap-8">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-foreground">
              FAITH SHOP
            </Link>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-3">
            <div>
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-foreground">
                Boutique
              </h3>
              <ul className="space-y-4">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-foreground">
                Informations
              </h3>
              <ul className="space-y-4">
                {footerLinks.info.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-foreground">
                Légal
              </h3>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Faith Shop. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a href="https://instagram.com/faithshop" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="https://facebook.com/faithshop" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="https://twitter.com/faithshop" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

