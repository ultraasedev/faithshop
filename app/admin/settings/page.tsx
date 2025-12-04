'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Palette,
  UserCog,
  FileText,
  Globe,
  Mail,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Database
} from 'lucide-react'

const settingsCategories = [
  {
    title: 'Apparence',
    description: 'Personnalisez les couleurs et le thème de votre boutique',
    href: '/admin/settings/appearance',
    icon: Palette
  },
  {
    title: 'Utilisateurs Admin',
    description: 'Gérez les accès administrateur et les permissions',
    href: '/admin/settings/users',
    icon: UserCog
  },
  {
    title: 'Pages & Contenu',
    description: 'Créez et modifiez les pages de votre site',
    href: '/admin/settings/pages',
    icon: FileText
  },
  {
    title: 'Navigation',
    description: 'Configurez les menus de navigation',
    href: '/admin/settings/navigation',
    icon: Globe
  },
  {
    title: 'Intégrations',
    description: 'Google Analytics, Facebook Pixel, etc.',
    href: '/admin/settings/integrations',
    icon: Database
  }
]

const comingSoonSettings = [
  {
    title: 'Emails',
    description: 'Modèles d\'emails et notifications',
    icon: Mail
  },
  {
    title: 'Paiements',
    description: 'Configuration Stripe et PayPal',
    icon: CreditCard
  },
  {
    title: 'Livraison',
    description: 'Zones et tarifs de livraison',
    icon: Truck
  },
  {
    title: 'Notifications',
    description: 'Alertes et rappels',
    icon: Bell
  },
  {
    title: 'Sécurité',
    description: 'Authentification et protection',
    icon: Shield
  }
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configurez votre boutique selon vos besoins
        </p>
      </div>

      {/* Active Settings */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => (
          <Link key={category.href} href={category.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Bientôt disponible</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {comingSoonSettings.map((setting, index) => (
            <Card key={index} className="h-full opacity-60">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <setting.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">{setting.title}</CardTitle>
                  <CardDescription>{setting.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
