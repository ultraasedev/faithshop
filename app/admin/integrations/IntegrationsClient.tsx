'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Facebook,
  Instagram,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Unplug,
  ShoppingBag,
  Package,
  Clock,
  TrendingUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
}

interface SocialConnection {
  id: string
  provider: string
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
  accountId: string | null
  accountName: string | null
  shopId: string | null
  catalogId: string | null
  pageId: string | null
  isActive: boolean
  lastSyncAt: string | null
  syncEnabled: boolean
  config: string | null
  createdAt: string
  updatedAt: string
}

interface SyncStats {
  synced: number
  pending: number
  error: number
}

interface SocialOrder {
  id: string
  provider: string
  externalOrderId: string
  customerName: string | null
  totalAmount: string
  status: string
  createdAt: string
}

interface IntegrationsClientProps {
  connections: SocialConnection[]
  stats: {
    meta: SyncStats
    tiktok: SyncStats
  }
  recentOrders: SocialOrder[]
}

export function IntegrationsClient({ connections, stats, recentOrders }: IntegrationsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Check for success/error in URL params
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'meta') {
      setSuccessMessage('Facebook/Instagram connecté avec succès !')
    } else if (success === 'tiktok') {
      setSuccessMessage('TikTok Shop connecté avec succès !')
    }

    if (error) {
      setErrorMessage(decodeURIComponent(error))
    }

    // Clear URL params after showing message
    if (success || error) {
      window.history.replaceState({}, '', '/admin/integrations')
    }
  }, [searchParams])

  const metaConnection = connections.find(c => c.provider === 'meta')
  const tiktokConnection = connections.find(c => c.provider === 'tiktok_shop')

  const handleConnect = async (provider: 'meta' | 'tiktok') => {
    setIsLoading(provider)
    try {
      const response = await fetch(`/api/social/${provider}/auth`)
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setErrorMessage(data.error || 'Erreur lors de la connexion')
      }
    } catch {
      setErrorMessage('Erreur lors de la connexion')
    } finally {
      setIsLoading(null)
    }
  }

  const handleDisconnect = async (provider: string) => {
    setIsLoading(provider)
    try {
      const response = await fetch(`/api/social/${provider}/disconnect`, {
        method: 'POST'
      })

      if (response.ok) {
        setSuccessMessage(`${provider === 'meta' ? 'Facebook/Instagram' : 'TikTok Shop'} déconnecté`)
        router.refresh()
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Erreur lors de la déconnexion')
      }
    } catch {
      setErrorMessage('Erreur lors de la déconnexion')
    } finally {
      setIsLoading(null)
      setShowDisconnectDialog(null)
    }
  }

  const handleSync = async (provider: string) => {
    setIsLoading(`sync-${provider}`)
    try {
      const response = await fetch(`/api/social/${provider}/sync`, {
        method: 'POST'
      })

      if (response.ok) {
        setSuccessMessage('Synchronisation lancée')
        router.refresh()
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Erreur lors de la synchronisation')
      }
    } catch {
      setErrorMessage('Erreur lors de la synchronisation')
    } finally {
      setIsLoading(null)
    }
  }

  const getStatusBadge = (connection: SocialConnection | undefined) => {
    if (!connection) {
      return <Badge variant="secondary">Non connecté</Badge>
    }
    if (!connection.isActive) {
      return <Badge variant="destructive">Désactivé</Badge>
    }
    if (connection.expiresAt && new Date(connection.expiresAt) < new Date()) {
      return <Badge variant="secondary" className="bg-yellow-500 text-white dark:bg-yellow-600">Token expiré</Badge>
    }
    return <Badge variant="default" className="bg-green-500 dark:bg-green-600">Connecté</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Intégrations</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Connectez vos boutiques sociales pour synchroniser vos produits et recevoir les commandes
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => setSuccessMessage(null)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => setErrorMessage(null)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Platform Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Meta (Facebook + Instagram) */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <Facebook className="w-full h-full" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Facebook className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Meta Commerce
                    {getStatusBadge(metaConnection)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Facebook className="h-3 w-3" /> Facebook
                    <Instagram className="h-3 w-3 ml-2" /> Instagram
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {metaConnection ? (
              <>
                {/* Connected Info */}
                <div className="space-y-2 text-sm">
                  {metaConnection.accountName && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Compte :</span>
                      <span className="font-medium">{metaConnection.accountName}</span>
                    </div>
                  )}
                  {metaConnection.lastSyncAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500">
                        Dernière sync : {formatDistanceToNow(new Date(metaConnection.lastSyncAt), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sync Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.meta.synced}</div>
                    <div className="text-xs text-gray-500">Synchronisés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{stats.meta.pending}</div>
                    <div className="text-xs text-gray-500">En attente</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{stats.meta.error}</div>
                    <div className="text-xs text-gray-500">Erreurs</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleSync('meta')}
                    disabled={isLoading === 'sync-meta'}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading === 'sync-meta' ? 'animate-spin' : ''}`} />
                    Synchroniser
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                    onClick={() => setShowDisconnectDialog('meta')}
                  >
                    <Unplug className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Connectez votre compte Meta Business pour synchroniser vos produits avec Facebook Shop et Instagram Shopping.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sync automatique des produits
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Réception des commandes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Mise à jour de l&apos;inventaire
                  </div>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleConnect('meta')}
                  disabled={isLoading === 'meta'}
                >
                  {isLoading === 'meta' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Facebook className="h-4 w-4 mr-2" />
                  )}
                  Connecter Facebook / Instagram
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* TikTok Shop */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <TikTokIcon className="w-full h-full" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-black">
                  <TikTokIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    TikTok Shop
                    {getStatusBadge(tiktokConnection)}
                  </CardTitle>
                  <CardDescription>
                    Vendez directement sur TikTok
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tiktokConnection ? (
              <>
                {/* Connected Info */}
                <div className="space-y-2 text-sm">
                  {tiktokConnection.accountName && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Boutique :</span>
                      <span className="font-medium">{tiktokConnection.accountName}</span>
                    </div>
                  )}
                  {tiktokConnection.lastSyncAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500">
                        Dernière sync : {formatDistanceToNow(new Date(tiktokConnection.lastSyncAt), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sync Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.tiktok.synced}</div>
                    <div className="text-xs text-gray-500">Synchronisés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{stats.tiktok.pending}</div>
                    <div className="text-xs text-gray-500">En attente</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{stats.tiktok.error}</div>
                    <div className="text-xs text-gray-500">Erreurs</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleSync('tiktok')}
                    disabled={isLoading === 'sync-tiktok'}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading === 'sync-tiktok' ? 'animate-spin' : ''}`} />
                    Synchroniser
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                    onClick={() => setShowDisconnectDialog('tiktok_shop')}
                  >
                    <Unplug className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Connectez votre TikTok Shop pour vendre vos produits directement sur TikTok.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sync automatique des produits
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Réception des commandes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Mise à jour de l&apos;inventaire
                  </div>
                </div>
                <Button
                  className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  onClick={() => handleConnect('tiktok')}
                  disabled={isLoading === 'tiktok'}
                >
                  {isLoading === 'tiktok' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TikTokIcon className="h-4 w-4 mr-2" />
                  )}
                  Connecter TikTok Shop
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Social Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Commandes récentes des réseaux sociaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {order.provider === 'meta' ? (
                      <Facebook className="h-5 w-5 text-blue-600" />
                    ) : (
                      <TikTokIcon className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium">{order.customerName || 'Client'}</p>
                      <p className="text-sm text-gray-500">#{order.externalOrderId.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{parseFloat(order.totalAmount).toFixed(2)} €</p>
                    <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comment ça marche ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold">
                  1
                </div>
                <h3 className="font-medium">Connectez</h3>
              </div>
              <p className="text-sm text-gray-500">
                Cliquez sur &quot;Connecter&quot; et autorisez l&apos;accès à votre compte professionnel.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 font-bold">
                  2
                </div>
                <h3 className="font-medium">Synchronisez</h3>
              </div>
              <p className="text-sm text-gray-500">
                Vos produits sont automatiquement synchronisés avec le catalogue de la plateforme.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 font-bold">
                  3
                </div>
                <h3 className="font-medium">Vendez</h3>
              </div>
              <p className="text-sm text-gray-500">
                Les commandes passées sur les réseaux sociaux apparaissent directement dans votre admin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Dialog */}
      <Dialog open={!!showDisconnectDialog} onOpenChange={() => setShowDisconnectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déconnecter {showDisconnectDialog === 'meta' ? 'Facebook/Instagram' : 'TikTok Shop'} ?</DialogTitle>
            <DialogDescription>
              Cette action va supprimer la connexion avec la plateforme. Vos produits ne seront plus synchronisés et vous ne recevrez plus les commandes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisconnectDialog(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDisconnectDialog && handleDisconnect(showDisconnectDialog)}
              disabled={!!isLoading}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Unplug className="h-4 w-4 mr-2" />}
              Déconnecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
