'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CreditCard, DollarSign, Shield, Settings } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration des Paiements</h1>
        <p className="text-muted-foreground mt-2">
          Gérez Stripe et les méthodes de paiement
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stripe Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Stripe</CardTitle>
                <p className="text-sm text-muted-foreground">Configuration principale des paiements</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripe-pk">Clé publique (Publishable Key)</Label>
              <Input
                id="stripe-pk"
                placeholder="pk_live_..."
                value={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Configurée via les variables d'environnement
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe-sk">Clé secrète (Secret Key)</Label>
              <Input
                id="stripe-sk"
                type="password"
                placeholder="sk_live_..."
                value="••••••••••••••••"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Masquée pour des raisons de sécurité
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode Test</Label>
                <p className="text-xs text-muted-foreground">
                  Actuellement en mode {process.env.NODE_ENV === 'development' ? 'test' : 'production'}
                </p>
              </div>
              <Switch
                checked={process.env.NODE_ENV === 'development'}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Méthodes de paiement</CardTitle>
                <p className="text-sm text-muted-foreground">Types de paiement acceptés</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-8 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                  <span className="text-sm">Cartes Visa</span>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-8 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                    MC
                  </div>
                  <span className="text-sm">Mastercard</span>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-8 bg-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">
                    AMEX
                  </div>
                  <span className="text-sm">American Express</span>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-8 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    GPay
                  </div>
                  <span className="text-sm">Google Pay</span>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-8 bg-gray-800 rounded text-white text-xs flex items-center justify-center font-bold">
                    Pay
                  </div>
                  <span className="text-sm">Apple Pay</span>
                </div>
                <Switch checked disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle>Sécurité</CardTitle>
              <p className="text-sm text-muted-foreground">Paramètres de sécurité des paiements</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-2 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-sm">SSL/TLS</h4>
              <p className="text-xs text-green-600 dark:text-green-400">Activé</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-2 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-sm">PCI DSS</h4>
              <p className="text-xs text-green-600 dark:text-green-400">Conforme</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-2 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-sm">3D Secure</h4>
              <p className="text-xs text-green-600 dark:text-green-400">Activé</p>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note :</strong> Stripe gère automatiquement la sécurité de vos paiements.
              Vos clients bénéficient d'une protection complète contre la fraude.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration avancée</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Pour modifier la configuration Stripe, contactez votre développeur ou
            modifiez les variables d'environnement du serveur.
          </p>
          <Button variant="outline" disabled>
            <Settings className="h-4 w-4 mr-2" />
            Configuration avancée (Bientôt)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}