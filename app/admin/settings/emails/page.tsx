'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Mail, Save, Loader2, TestTube, CheckCircle, AlertCircle, Settings, FileText, Users } from 'lucide-react'
import {
  getEmailSettings,
  updateEmailSettings,
  testEmailConnection,
  type EmailSettings
} from '@/app/actions/admin/email-settings'
import { toast } from 'sonner'

export default function EmailsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    fromEmail: 'noreply@faith-shop.fr',
    fromName: 'Faith-Shop',
    replyToEmail: 'contact@faith-shop.fr',
    orderConfirmationEnabled: true,
    orderConfirmationSubject: 'Confirmation de votre commande #{orderId}',
    orderConfirmationTemplate: '',
    shipmentNotificationEnabled: true,
    shipmentNotificationSubject: 'Votre commande #{orderId} a été expédiée',
    shipmentNotificationTemplate: '',
    passwordResetEnabled: true,
    passwordResetSubject: 'Réinitialisation de votre mot de passe',
    passwordResetTemplate: ''
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getEmailSettings()
        setSettings(data)
      } catch (error) {
        console.error('Failed to load email settings:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEmailSettings(settings)
      toast.success('Configuration email sauvegardée !')
    } catch (error) {
      console.error('Failed to save email settings:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const result = await testEmailConnection(settings)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Erreur lors du test de connexion')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Mail className="h-8 w-8" />
            Configuration des Emails
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les modèles d'emails et paramètres SMTP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Tester connexion
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="smtp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration SMTP
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Modèles d'emails
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Configuration serveur */}
            <Card>
              <CardHeader>
                <CardTitle>Serveur SMTP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Serveur SMTP</Label>
                  <Input
                    id="smtp-host"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value) || 587})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-secure">SSL/TLS</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="smtp-secure"
                        checked={settings.smtpSecure}
                        onCheckedChange={(checked) => setSettings({...settings, smtpSecure: checked})}
                      />
                      <Label htmlFor="smtp-secure">Activé</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-user">Nom d'utilisateur</Label>
                  <Input
                    id="smtp-user"
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                    placeholder="votre-email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Mot de passe</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuration expéditeur */}
            <Card>
              <CardHeader>
                <CardTitle>Informations expéditeur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from-name">Nom de l'expéditeur</Label>
                  <Input
                    id="from-name"
                    value={settings.fromName}
                    onChange={(e) => setSettings({...settings, fromName: e.target.value})}
                    placeholder="Faith-Shop"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">Email expéditeur</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={settings.fromEmail}
                    onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
                    placeholder="noreply@faith-shop.fr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reply-to">Adresse de réponse</Label>
                  <Input
                    id="reply-to"
                    type="email"
                    value={settings.replyToEmail}
                    onChange={(e) => setSettings({...settings, replyToEmail: e.target.value})}
                    placeholder="contact@faith-shop.fr"
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Aperçu</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>De :</strong> {settings.fromName} &lt;{settings.fromEmail}&gt;</p>
                    <p><strong>Répondre à :</strong> {settings.replyToEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="space-y-6">
            {/* Confirmation de commande */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Confirmation de commande
                  </CardTitle>
                  <Badge variant={settings.orderConfirmationEnabled ? "default" : "secondary"}>
                    {settings.orderConfirmationEnabled ? "Activé" : "Désactivé"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.orderConfirmationEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, orderConfirmationEnabled: checked})}
                  />
                  <Label>Envoyer un email de confirmation de commande</Label>
                </div>

                <div className="space-y-2">
                  <Label>Sujet de l'email</Label>
                  <Input
                    value={settings.orderConfirmationSubject}
                    onChange={(e) => setSettings({...settings, orderConfirmationSubject: e.target.value})}
                    placeholder="Confirmation de votre commande #{orderId}"
                    disabled={!settings.orderConfirmationEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Modèle HTML</Label>
                  <Textarea
                    value={settings.orderConfirmationTemplate}
                    onChange={(e) => setSettings({...settings, orderConfirmationTemplate: e.target.value})}
                    className="font-mono text-sm h-40"
                    placeholder="Template HTML..."
                    disabled={!settings.orderConfirmationEnabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables disponibles : {'{customerName}, {orderId}, {orderTotal}, {orderItems}'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notification d'expédition */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Notification d'expédition
                  </CardTitle>
                  <Badge variant={settings.shipmentNotificationEnabled ? "default" : "secondary"}>
                    {settings.shipmentNotificationEnabled ? "Activé" : "Désactivé"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.shipmentNotificationEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, shipmentNotificationEnabled: checked})}
                  />
                  <Label>Envoyer un email lors de l'expédition</Label>
                </div>

                <div className="space-y-2">
                  <Label>Sujet de l'email</Label>
                  <Input
                    value={settings.shipmentNotificationSubject}
                    onChange={(e) => setSettings({...settings, shipmentNotificationSubject: e.target.value})}
                    placeholder="Votre commande #{orderId} a été expédiée"
                    disabled={!settings.shipmentNotificationEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Modèle HTML</Label>
                  <Textarea
                    value={settings.shipmentNotificationTemplate}
                    onChange={(e) => setSettings({...settings, shipmentNotificationTemplate: e.target.value})}
                    className="font-mono text-sm h-40"
                    placeholder="Template HTML..."
                    disabled={!settings.shipmentNotificationEnabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables disponibles : {'{customerName}, {orderId}, {trackingNumber}, {carrier}, {trackingUrl}'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Réinitialisation de mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.passwordResetEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, passwordResetEnabled: checked})}
                />
                <Label>Permettre la réinitialisation par email</Label>
              </div>

              <div className="space-y-2">
                <Label>Sujet de l'email</Label>
                <Input
                  value={settings.passwordResetSubject}
                  onChange={(e) => setSettings({...settings, passwordResetSubject: e.target.value})}
                  placeholder="Réinitialisation de votre mot de passe"
                  disabled={!settings.passwordResetEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Modèle HTML</Label>
                <Textarea
                  value={settings.passwordResetTemplate}
                  onChange={(e) => setSettings({...settings, passwordResetTemplate: e.target.value})}
                  className="font-mono text-sm h-40"
                  placeholder="Template HTML..."
                  disabled={!settings.passwordResetEnabled}
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles : {'{customerName}, {resetUrl}'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-sm text-muted-foreground">Emails envoyés ce mois</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">--%</div>
                  <p className="text-sm text-muted-foreground">Taux de délivrabilité</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-sm text-muted-foreground">Emails en erreur</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Les statistiques détaillées seront bientôt disponibles.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}