'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Settings,
  Shield,
  Globe,
  Database,
  Webhook,
  Activity,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Play,
  Pause,
  SkipForward
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface SyncProvider {
  id: string
  name: string
  type: 'marketplace' | 'payment' | 'fulfillment' | 'analytics' | 'inventory'
  icon: React.ElementType
  isConnected: boolean
  isActive: boolean
  lastSync: Date
  nextSync: Date
  syncFrequency: 'realtime' | '5min' | '15min' | '1hour' | '6hour' | '24hour'
  health: 'healthy' | 'warning' | 'error' | 'maintenance'
  config: {
    apiKey?: string
    apiSecret?: string
    webhookUrl?: string
    syncDirection: 'bidirectional' | 'push' | 'pull'
    autoResolveConflicts: boolean
  }
  stats: {
    totalSyncs: number
    successfulSyncs: number
    failedSyncs: number
    lastSyncDuration: number
    avgSyncDuration: number
  }
}

interface SyncConflict {
  id: string
  timestamp: Date
  type: 'product' | 'inventory' | 'order' | 'customer'
  entityId: string
  entityName: string
  field: string
  localValue: any
  remoteValue: any
  provider: string
  status: 'pending' | 'resolved' | 'ignored'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface SyncActivity {
  id: string
  timestamp: Date
  provider: string
  type: 'sync' | 'webhook' | 'manual' | 'conflict'
  action: 'create' | 'update' | 'delete' | 'resolve'
  entity: string
  entityId: string
  status: 'success' | 'error' | 'warning'
  message: string
  duration: number
  metadata?: any
}

const mockProviders: SyncProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'payment',
    icon: DollarSign,
    isConnected: true,
    isActive: true,
    lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    nextSync: new Date(Date.now() + 10 * 60 * 1000), // 10 min later
    syncFrequency: 'realtime',
    health: 'healthy',
    config: {
      syncDirection: 'bidirectional',
      autoResolveConflicts: true
    },
    stats: {
      totalSyncs: 1247,
      successfulSyncs: 1235,
      failedSyncs: 12,
      lastSyncDuration: 2.3,
      avgSyncDuration: 1.8
    }
  },
  {
    id: 'printful',
    name: 'Printful',
    type: 'fulfillment',
    icon: Package,
    isConnected: true,
    isActive: true,
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    nextSync: new Date(Date.now() + 45 * 60 * 1000),
    syncFrequency: '1hour',
    health: 'warning',
    config: {
      syncDirection: 'push',
      autoResolveConflicts: false
    },
    stats: {
      totalSyncs: 456,
      successfulSyncs: 450,
      failedSyncs: 6,
      lastSyncDuration: 12.7,
      avgSyncDuration: 8.2
    }
  },
  {
    id: 'facebook',
    name: 'Facebook Shop',
    type: 'marketplace',
    icon: Globe,
    isConnected: true,
    isActive: false,
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextSync: new Date(Date.now() + 4 * 60 * 60 * 1000),
    syncFrequency: '6hour',
    health: 'error',
    config: {
      syncDirection: 'bidirectional',
      autoResolveConflicts: true
    },
    stats: {
      totalSyncs: 89,
      successfulSyncs: 78,
      failedSyncs: 11,
      lastSyncDuration: 45.2,
      avgSyncDuration: 32.1
    }
  }
]

const mockConflicts: SyncConflict[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'product',
    entityId: 'faith-tshirt-blessed',
    entityName: 'T-shirt Faith "Blessed"',
    field: 'price',
    localValue: 29.99,
    remoteValue: 27.99,
    provider: 'Facebook Shop',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: 'inventory',
    entityId: 'hoodie-faith-premium-m',
    entityName: 'Hoodie Faith Premium - M',
    field: 'stock',
    localValue: 15,
    remoteValue: 0,
    provider: 'Printful',
    status: 'pending',
    priority: 'critical'
  }
]

const mockActivity: SyncActivity[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    provider: 'Stripe',
    type: 'webhook',
    action: 'update',
    entity: 'Product',
    entityId: 'faith-tshirt-blessed',
    status: 'success',
    message: 'Prix mis à jour automatiquement',
    duration: 1.2
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    provider: 'Printful',
    type: 'sync',
    action: 'create',
    entity: 'Order',
    entityId: 'FAITH-2024-001',
    status: 'success',
    message: 'Commande envoyée pour production',
    duration: 8.5
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    provider: 'Facebook Shop',
    type: 'sync',
    action: 'update',
    entity: 'Product',
    entityId: 'hoodie-faith-premium',
    status: 'error',
    message: 'Erreur API - Connexion expirée',
    duration: 30.1
  }
]

export default function AdvancedSyncManager() {
  const [providers, setProviders] = useState<SyncProvider[]>(mockProviders)
  const [conflicts, setConflicts] = useState<SyncConflict[]>(mockConflicts)
  const [activity, setActivity] = useState<SyncActivity[]>(mockActivity)
  const [isGlobalSyncRunning, setIsGlobalSyncRunning] = useState(false)

  const updateProviderStatus = (providerId: string, isActive: boolean) => {
    setProviders(prev => prev.map(provider =>
      provider.id === providerId ? { ...provider, isActive } : provider
    ))
  }

  const triggerManualSync = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    if (!provider) return

    // Simuler une synchronisation
    setProviders(prev => prev.map(p =>
      p.id === providerId
        ? {
            ...p,
            lastSync: new Date(),
            nextSync: new Date(Date.now() + getIntervalMs(p.syncFrequency)),
            stats: {
              ...p.stats,
              totalSyncs: p.stats.totalSyncs + 1,
              successfulSyncs: p.stats.successfulSyncs + 1,
              lastSyncDuration: Math.random() * 10 + 1
            }
          }
        : p
    ))

    // Ajouter une entrée d'activité
    const newActivity: SyncActivity = {
      id: Date.now().toString(),
      timestamp: new Date(),
      provider: provider.name,
      type: 'manual',
      action: 'update',
      entity: 'Multiple',
      entityId: 'bulk',
      status: 'success',
      message: 'Synchronisation manuelle réussie',
      duration: Math.random() * 5 + 2
    }

    setActivity(prev => [newActivity, ...prev.slice(0, 9)])
  }

  const resolveConflict = (conflictId: string, resolution: 'local' | 'remote' | 'ignore') => {
    setConflicts(prev => prev.map(conflict =>
      conflict.id === conflictId
        ? { ...conflict, status: resolution === 'ignore' ? 'ignored' : 'resolved' }
        : conflict
    ))
  }

  const getIntervalMs = (frequency: SyncProvider['syncFrequency']) => {
    switch (frequency) {
      case 'realtime': return 0
      case '5min': return 5 * 60 * 1000
      case '15min': return 15 * 60 * 1000
      case '1hour': return 60 * 60 * 1000
      case '6hour': return 6 * 60 * 60 * 1000
      case '24hour': return 24 * 60 * 60 * 1000
      default: return 60 * 60 * 1000
    }
  }

  const getHealthIcon = (health: SyncProvider['health']) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'maintenance': return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getHealthColor = (health: SyncProvider['health']) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-blue-100 text-blue-800'
    }
  }

  const getPriorityColor = (priority: SyncConflict['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
    }
  }

  const getSuccessRate = (provider: SyncProvider) => {
    return provider.stats.totalSyncs > 0
      ? Math.round((provider.stats.successfulSyncs / provider.stats.totalSyncs) * 100)
      : 0
  }

  const globalStats = {
    totalProviders: providers.length,
    activeProviders: providers.filter(p => p.isActive).length,
    healthyProviders: providers.filter(p => p.health === 'healthy').length,
    pendingConflicts: conflicts.filter(c => c.status === 'pending').length,
    totalSyncs: providers.reduce((sum, p) => sum + p.stats.totalSyncs, 0),
    avgSuccessRate: providers.length > 0
      ? Math.round(providers.reduce((sum, p) => sum + getSuccessRate(p), 0) / providers.length)
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Synchronisation Avancée</h2>
          <p className="text-muted-foreground">
            Faith Shop - Synchronisation bidirectionnelle temps réel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsGlobalSyncRunning(!isGlobalSyncRunning)}
          >
            {isGlobalSyncRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isGlobalSyncRunning ? 'Pause' : 'Démarrer'} sync globale
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Synchroniser tout
          </Button>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.activeProviders}/{globalStats.totalProviders}</div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santé</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{globalStats.healthyProviders}</div>
            <p className="text-xs text-muted-foreground">Systèmes sains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflits</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{globalStats.pendingConflicts}</div>
            <p className="text-xs text-muted-foreground">À résoudre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Total</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalSyncs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Synchronisations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiabilité</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{globalStats.avgSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">Taux de réussite</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isGlobalSyncRunning ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">{isGlobalSyncRunning ? 'Actif' : 'Inactif'}</span>
            </div>
            <p className="text-xs text-muted-foreground">Synchronisation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="conflicts">
            Conflits
            {conflicts.filter(c => c.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">
                {conflicts.filter(c => c.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4">
            {providers.map(provider => (
              <Card key={provider.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                        <provider.icon className="h-6 w-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{provider.name}</h3>
                          <Badge variant="outline" className="capitalize">
                            {provider.type}
                          </Badge>
                          <Badge className={getHealthColor(provider.health)}>
                            {getHealthIcon(provider.health)}
                            {provider.health}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Dernière sync: {provider.lastSync.toLocaleString('fr-FR')} •
                          Fréquence: {provider.syncFrequency} •
                          Direction: {provider.config.syncDirection}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Stats */}
                      <div className="text-right text-sm">
                        <div className="font-medium">{getSuccessRate(provider)}% réussite</div>
                        <div className="text-muted-foreground">
                          {provider.stats.totalSyncs} syncs
                        </div>
                      </div>

                      {/* Contrôles */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={provider.isActive}
                          onCheckedChange={(checked) => updateProviderStatus(provider.id, checked)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerManualSync(provider.id)}
                          disabled={!provider.isConnected}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression et détails */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span>Fiabilité</span>
                      <span>{getSuccessRate(provider)}%</span>
                    </div>
                    <Progress value={getSuccessRate(provider)} className="h-1" />

                    <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground">
                      <div>
                        <div className="font-medium text-foreground">{provider.stats.successfulSyncs}</div>
                        <div>Réussies</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-600">{provider.stats.failedSyncs}</div>
                        <div>Échouées</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{provider.stats.lastSyncDuration.toFixed(1)}s</div>
                        <div>Dernière durée</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{provider.stats.avgSyncDuration.toFixed(1)}s</div>
                        <div>Durée moyenne</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          {conflicts.filter(c => c.status === 'pending').length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-500" />
                  <p className="text-lg font-medium">Aucun conflit en attente</p>
                  <p className="text-sm">Toutes les synchronisations sont à jour</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conflicts
                .filter(c => c.status === 'pending')
                .map(conflict => (
                  <Card key={conflict.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{conflict.entityName}</h3>
                            <Badge className={getPriorityColor(conflict.priority)}>
                              {conflict.priority}
                            </Badge>
                            <Badge variant="outline">
                              {conflict.provider}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">
                            Conflit sur le champ "{conflict.field}" pour {conflict.type}
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="font-medium text-blue-600">Valeur locale (Faith Shop)</Label>
                              <div className="mt-1 p-2 bg-blue-50 rounded border">
                                {typeof conflict.localValue === 'object'
                                  ? JSON.stringify(conflict.localValue)
                                  : String(conflict.localValue)
                                }
                              </div>
                            </div>
                            <div>
                              <Label className="font-medium text-orange-600">Valeur distante ({conflict.provider})</Label>
                              <div className="mt-1 p-2 bg-orange-50 rounded border">
                                {typeof conflict.remoteValue === 'object'
                                  ? JSON.stringify(conflict.remoteValue)
                                  : String(conflict.remoteValue)
                                }
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveConflict(conflict.id, 'local')}
                          >
                            Garder local
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveConflict(conflict.id, 'remote')}
                          >
                            Prendre distant
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resolveConflict(conflict.id, 'ignore')}
                          >
                            Ignorer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map(item => {
                  const statusIcon = item.status === 'success'
                    ? <CheckCircle className="h-4 w-4 text-green-500" />
                    : item.status === 'error'
                    ? <XCircle className="h-4 w-4 text-red-500" />
                    : <AlertTriangle className="h-4 w-4 text-yellow-500" />

                  return (
                    <div key={item.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                      {statusIcon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{item.provider}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.action}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.entity} {item.entityId} • {item.duration.toFixed(1)}s • {item.timestamp.toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de synchronisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Résolution automatique des conflits</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configurez comment gérer automatiquement les conflits de synchronisation
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-resolve-price">Conflits de prix</Label>
                      <p className="text-xs text-muted-foreground">Toujours prendre la valeur locale</p>
                    </div>
                    <Switch id="auto-resolve-price" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-resolve-inventory">Stock et inventaire</Label>
                      <p className="text-xs text-muted-foreground">Prendre la valeur la plus récente</p>
                    </div>
                    <Switch id="auto-resolve-inventory" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-resolve-orders">Statuts de commandes</Label>
                      <p className="text-xs text-muted-foreground">Synchronisation bidirectionnelle</p>
                    </div>
                    <Switch id="auto-resolve-orders" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Notifications</Label>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-conflicts">Notifier les conflits critiques</Label>
                    <Switch id="notify-conflicts" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-errors">Notifier les erreurs de sync</Label>
                    <Switch id="notify-errors" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-success">Résumé quotidien des syncs</Label>
                    <Switch id="notify-success" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}