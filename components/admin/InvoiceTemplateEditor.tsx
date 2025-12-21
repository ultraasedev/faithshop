'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  FileText,
  Eye,
  Save,
  Download,
  Palette,
  Type,
  Image as ImageIcon,
  Settings
} from 'lucide-react'
import RichTextEditor from './RichTextEditor'

interface InvoiceTemplate {
  id: string
  name: string
  isDefault: boolean
  settings: {
    // Header
    showLogo: boolean
    logoUrl: string
    companyName: string
    companyAddress: string
    companyPhone: string
    companyEmail: string
    companyWebsite: string

    // Invoice Info
    titleText: string
    numberPrefix: string
    dateFormat: string
    dueDate: number

    // Colors & Design
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    fontSize: number
    showBorder: boolean
    borderColor: string

    // Content
    showItemImages: boolean
    showItemDescriptions: boolean
    showTaxDetails: boolean
    showDiscountDetails: boolean
    showShippingDetails: boolean

    // Footer
    footerText: string
    termsAndConditions: string
    thankYouMessage: string

    // Languages
    currency: string
    language: string

    // Layout
    layout: 'modern' | 'classic' | 'minimal'
    paperSize: 'A4' | 'Letter'
    margins: {
      top: number
      bottom: number
      left: number
      right: number
    }
  }
}

interface InvoiceTemplateEditorProps {
  template?: InvoiceTemplate
  onSave: (template: InvoiceTemplate) => void
}

const defaultTemplate: InvoiceTemplate = {
  id: '',
  name: 'Template par défaut',
  isDefault: true,
  settings: {
    showLogo: true,
    logoUrl: '',
    companyName: 'Faith Shop SAS',
    companyAddress: '123 Rue de la Mode\n75001 Paris, France',
    companyPhone: '+33 1 23 45 67 89',
    companyEmail: 'contact@faith-shop.fr',
    companyWebsite: 'www.faith-shop.fr',

    titleText: 'FACTURE',
    numberPrefix: 'FAC-',
    dateFormat: 'DD/MM/YYYY',
    dueDate: 30,

    primaryColor: '#000000',
    secondaryColor: '#6B7280',
    fontFamily: 'Inter',
    fontSize: 12,
    showBorder: true,
    borderColor: '#E5E7EB',

    showItemImages: true,
    showItemDescriptions: true,
    showTaxDetails: true,
    showDiscountDetails: true,
    showShippingDetails: true,

    footerText: 'Merci pour votre confiance !',
    termsAndConditions: 'Paiement à réception de facture. Retard de paiement passible de pénalités.',
    thankYouMessage: 'Nous espérons vous revoir bientôt !',

    currency: 'EUR',
    language: 'fr',

    layout: 'modern',
    paperSize: 'A4',
    margins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    }
  }
}

const sampleInvoiceData = {
  number: 'FAC-2024-001',
  date: '15/03/2024',
  dueDate: '14/04/2024',
  customer: {
    name: 'Marie Dupont',
    address: '456 Avenue des Exemples\n69000 Lyon, France',
    email: 'marie.dupont@email.com'
  },
  items: [
    {
      id: '1',
      name: 'T-shirt Faith Premium',
      description: 'Coton bio, couleur blanc, taille M',
      quantity: 2,
      unitPrice: 29.99,
      total: 59.98,
      image: '/api/placeholder/60/60'
    },
    {
      id: '2',
      name: 'Sweat à capuche Faith',
      description: 'Coton bio, couleur noir, taille L',
      quantity: 1,
      unitPrice: 49.99,
      total: 49.99,
      image: '/api/placeholder/60/60'
    }
  ],
  subtotal: 109.97,
  taxRate: 20,
  taxAmount: 21.99,
  discount: 10.00,
  shipping: 5.99,
  total: 127.95
}

export default function InvoiceTemplateEditor({ template, onSave }: InvoiceTemplateEditorProps) {
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate>(
    template || { ...defaultTemplate, id: Date.now().toString() }
  )

  const updateSetting = (path: string, value: any) => {
    setCurrentTemplate(prev => {
      const newTemplate = { ...prev }
      const keys = path.split('.')
      let current: any = newTemplate

      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i] === 'settings') {
          current[keys[i]] = { ...current[keys[i]] }
        } else {
          current[keys[i]] = { ...current[keys[i]] }
        }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newTemplate
    })
  }

  const generateInvoicePreview = () => {
    const { settings } = currentTemplate

    return (
      <div
        className="bg-white shadow-lg"
        style={{
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}px`,
          padding: `${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm`,
          maxWidth: settings.paperSize === 'A4' ? '210mm' : '8.5in',
          minHeight: settings.paperSize === 'A4' ? '297mm' : '11in',
          margin: '0 auto',
          color: '#000'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {settings.showLogo && settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-16 mb-4"
              />
            )}
            <div style={{ color: settings.primaryColor }}>
              <h1 className="text-2xl font-bold">{settings.companyName}</h1>
              <div className="text-sm mt-2" style={{ color: settings.secondaryColor }}>
                {settings.companyAddress.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
                <div>{settings.companyPhone}</div>
                <div>{settings.companyEmail}</div>
                <div>{settings.companyWebsite}</div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: settings.primaryColor }}
            >
              {settings.titleText}
            </h2>
            <div className="text-sm" style={{ color: settings.secondaryColor }}>
              <div>N° {sampleInvoiceData.number}</div>
              <div>Date: {sampleInvoiceData.date}</div>
              <div>Échéance: {sampleInvoiceData.dueDate}</div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3
            className="font-bold mb-2"
            style={{ color: settings.primaryColor }}
          >
            Facturé à:
          </h3>
          <div style={{ color: settings.secondaryColor }}>
            <div className="font-medium">{sampleInvoiceData.customer.name}</div>
            {sampleInvoiceData.customer.address.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            <div>{sampleInvoiceData.customer.email}</div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr
              className={settings.showBorder ? 'border-b-2' : ''}
              style={{ borderColor: settings.borderColor }}
            >
              {settings.showItemImages && <th className="text-left py-2">Image</th>}
              <th className="text-left py-2">Description</th>
              <th className="text-center py-2">Qté</th>
              <th className="text-right py-2">Prix unit.</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sampleInvoiceData.items.map((item, index) => (
              <tr
                key={item.id}
                className={settings.showBorder ? 'border-b' : ''}
                style={{ borderColor: settings.borderColor }}
              >
                {settings.showItemImages && (
                  <td className="py-2">
                    <img src={item.image} alt="" className="w-12 h-12 object-cover rounded" />
                  </td>
                )}
                <td className="py-2">
                  <div className="font-medium">{item.name}</div>
                  {settings.showItemDescriptions && (
                    <div className="text-sm" style={{ color: settings.secondaryColor }}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">{item.unitPrice.toFixed(2)} €</td>
                <td className="text-right py-2 font-medium">{item.total.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span style={{ color: settings.secondaryColor }}>Sous-total:</span>
              <span>{sampleInvoiceData.subtotal.toFixed(2)} €</span>
            </div>

            {settings.showDiscountDetails && sampleInvoiceData.discount > 0 && (
              <div className="flex justify-between py-1 text-green-600">
                <span>Remise:</span>
                <span>-{sampleInvoiceData.discount.toFixed(2)} €</span>
              </div>
            )}

            {settings.showShippingDetails && sampleInvoiceData.shipping > 0 && (
              <div className="flex justify-between py-1">
                <span style={{ color: settings.secondaryColor }}>Livraison:</span>
                <span>{sampleInvoiceData.shipping.toFixed(2)} €</span>
              </div>
            )}

            {settings.showTaxDetails && (
              <div className="flex justify-between py-1">
                <span style={{ color: settings.secondaryColor }}>TVA ({sampleInvoiceData.taxRate}%):</span>
                <span>{sampleInvoiceData.taxAmount.toFixed(2)} €</span>
              </div>
            )}

            <div
              className="flex justify-between py-2 border-t-2 font-bold text-lg"
              style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}
            >
              <span>Total:</span>
              <span>{sampleInvoiceData.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm" style={{ color: settings.secondaryColor }}>
          {settings.footerText && (
            <div className="mb-4 font-medium">{settings.footerText}</div>
          )}
          {settings.termsAndConditions && (
            <div className="mb-2">{settings.termsAndConditions}</div>
          )}
          {settings.thankYouMessage && (
            <div>{settings.thankYouMessage}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Éditeur de template de facture</h2>
          <p className="text-muted-foreground">Personnalisez l'apparence de vos factures</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
          <Button onClick={() => onSave(currentTemplate)}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4 mr-2" />
                Général
              </TabsTrigger>
              <TabsTrigger value="design">
                <Palette className="h-4 w-4 mr-2" />
                Design
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Contenu
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Type className="h-4 w-4 mr-2" />
                Mise en page
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Nom du template</Label>
                    <Input
                      id="template-name"
                      value={currentTemplate.name}
                      onChange={(e) => updateSetting('name', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is-default">Template par défaut</Label>
                    <Switch
                      id="is-default"
                      checked={currentTemplate.isDefault}
                      onCheckedChange={(checked) => updateSetting('isDefault', checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-name">Nom de l'entreprise</Label>
                    <Input
                      id="company-name"
                      value={currentTemplate.settings.companyName}
                      onChange={(e) => updateSetting('settings.companyName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-address">Adresse</Label>
                    <Textarea
                      id="company-address"
                      value={currentTemplate.settings.companyAddress}
                      onChange={(e) => updateSetting('settings.companyAddress', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-phone">Téléphone</Label>
                      <Input
                        id="company-phone"
                        value={currentTemplate.settings.companyPhone}
                        onChange={(e) => updateSetting('settings.companyPhone', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        value={currentTemplate.settings.companyEmail}
                        onChange={(e) => updateSetting('settings.companyEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Couleurs et police</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Couleur principale</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentTemplate.settings.primaryColor}
                          onChange={(e) => updateSetting('settings.primaryColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={currentTemplate.settings.primaryColor}
                          onChange={(e) => updateSetting('settings.primaryColor', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondary-color">Couleur secondaire</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentTemplate.settings.secondaryColor}
                          onChange={(e) => updateSetting('settings.secondaryColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={currentTemplate.settings.secondaryColor}
                          onChange={(e) => updateSetting('settings.secondaryColor', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="font-family">Police</Label>
                    <select
                      id="font-family"
                      value={currentTemplate.settings.fontFamily}
                      onChange={(e) => updateSetting('settings.fontFamily', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="font-size">Taille de police (px)</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={currentTemplate.settings.fontSize}
                      onChange={(e) => updateSetting('settings.fontSize', parseInt(e.target.value) || 12)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Éléments à afficher</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { key: 'showItemImages', label: 'Images des produits' },
                      { key: 'showItemDescriptions', label: 'Descriptions des produits' },
                      { key: 'showTaxDetails', label: 'Détails de la TVA' },
                      { key: 'showDiscountDetails', label: 'Détails des remises' },
                      { key: 'showShippingDetails', label: 'Détails de livraison' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <Switch
                          checked={currentTemplate.settings[key as keyof typeof currentTemplate.settings] as boolean}
                          onCheckedChange={(checked) => updateSetting(`settings.${key}`, checked)}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="footer-text">Message de pied de page</Label>
                    <Input
                      id="footer-text"
                      value={currentTemplate.settings.footerText}
                      onChange={(e) => updateSetting('settings.footerText', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="terms">Conditions générales</Label>
                    <Textarea
                      id="terms"
                      value={currentTemplate.settings.termsAndConditions}
                      onChange={(e) => updateSetting('settings.termsAndConditions', e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mise en page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="layout">Style de layout</Label>
                    <select
                      id="layout"
                      value={currentTemplate.settings.layout}
                      onChange={(e) => updateSetting('settings.layout', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="modern">Moderne</option>
                      <option value="classic">Classique</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="paper-size">Taille du papier</Label>
                    <select
                      id="paper-size"
                      value={currentTemplate.settings.paperSize}
                      onChange={(e) => updateSetting('settings.paperSize', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['top', 'bottom', 'left', 'right'].map(side => (
                      <div key={side}>
                        <Label htmlFor={`margin-${side}`}>
                          Marge {side === 'top' ? 'haut' : side === 'bottom' ? 'bas' : side === 'left' ? 'gauche' : 'droite'} (mm)
                        </Label>
                        <Input
                          id={`margin-${side}`}
                          type="number"
                          value={currentTemplate.settings.margins[side as keyof typeof currentTemplate.settings.margins]}
                          onChange={(e) => updateSetting(`settings.margins.${side}`, parseInt(e.target.value) || 20)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50 max-h-[800px] overflow-y-auto">
                {generateInvoicePreview()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}