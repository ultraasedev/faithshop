'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  Settings,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'push' | 'sms'
  trigger: string
  subject: string
  content: string
  isActive: boolean
}

interface NotificationStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
}

export default function NotificationSystem() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    failed: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
    fetchStats()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/notifications/templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
      // Templates de fallback
      setTemplates([
        {
          id: '1',
          name: 'Commande confirmée',
          type: 'email',
          trigger: 'order.confirmed',
          subject: 'Votre commande #{orderId} est confirmée',
          content: 'Bonjour {customerName}, votre commande a été confirmée...',
          isActive: true
        },
        {
          id: '2',
          name: 'Produit expédié',
          type: 'email',
          trigger: 'order.shipped',
          subject: 'Votre commande #{orderId} est en route',
          content: 'Votre commande a été expédiée. Numéro de suivi: {trackingNumber}',
          isActive: true
        },
        {
          id: '3',
          name: 'Stock faible',
          type: 'push',
          trigger: 'product.low_stock',
          subject: 'Alerte stock faible',
          content: 'Le produit {productName} n\'a plus que {stockQuantity} unités',
          isActive: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/notifications/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      // Stats de fallback
      setStats({
        sent: 1247,
        delivered: 1198,
        opened: 892,
        clicked: 234,
        failed: 49
      })
    }
  }

  const sendTestNotification = async (templateId: string) => {
    try {
      await fetch(`/api/admin/notifications/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      })
      alert('Notification de test envoyée !')
    } catch (error) {
      console.error('Erreur lors de l\'envoi du test:', error)
      alert('Erreur lors de l\'envoi')
    }
  }

  const toggleTemplate = async (templateId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/notifications/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      setTemplates(prev => prev.map(t =>
        t.id === templateId ? { ...t, isActive } : t
      ))
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const saveTemplate = async (template: NotificationTemplate) => {
    try {
      const method = template.id ? 'PATCH' : 'POST'
      const url = template.id
        ? `/api/admin/notifications/templates/${template.id}`
        : '/api/admin/notifications/templates'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })
      fetchTemplates()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'push': return Bell
      case 'sms': return MessageSquare
      default: return Bell
    }
  }

  const getTriggerLabel = (trigger: string) => {
    const triggers: { [key: string]: string } = {
      'order.confirmed': 'Commande confirmée',
      'order.shipped': 'Commande expédiée',
      'order.delivered': 'Commande livrée',
      'product.low_stock': 'Stock faible',
      'customer.registered': 'Nouveau client',
      'payment.failed': 'Paiement échoué'
    }
    return triggers[trigger] || trigger
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Système de Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les notifications email, push et SMS
          </p>
        </div>
        <Button onClick={() => setSelectedTemplate('new')} className="gap-2">
          <Zap className="h-4 w-4" />
          Nouveau Template
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.sent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Envoyées</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.delivered.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Délivrées</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.opened.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Ouvertes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.clicked.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Clics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.failed.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Échecs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'email', event: 'Commande confirmée envoyée à marie@example.com', time: '2 min' },
                  { type: 'push', event: 'Notification stock faible: T-shirt Faith', time: '15 min' },
                  { type: 'email', event: 'Commande expédiée envoyée à jean@example.com', time: '1h' },
                ].map((activity, index) => {
                  const Icon = getTypeIcon(activity.type)
                  return (
                    <div key={index} className="flex items-center gap-3 p-2 rounded border">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.event}</p>
                        <p className="text-xs text-muted-foreground">Il y a {activity.time}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => {
              const Icon = getTypeIcon(template.type)
              return (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getTriggerLabel(template.trigger)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.type === 'email' ? 'default' : 'secondary'}>
                          {template.type}
                        </Badge>
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={(checked) => toggleTemplate(template.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendTestNotification(template.id)}
                        >
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Serveur SMTP</label>
                  <Input placeholder="smtp.example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Port SMTP</label>
                  <Input placeholder="587" type="number" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Utilisateur SMTP</label>
                  <Input placeholder="notifications@faith-shop.fr" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mot de passe SMTP</label>
                  <Input placeholder="••••••••" type="password" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Clé API Push (Firebase)</label>
                <Input placeholder="AIza..." />
              </div>

              <div>
                <label className="text-sm font-medium">Clé API SMS (Twilio)</label>
                <Input placeholder="SK..." />
              </div>

              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Sauvegarder la Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}