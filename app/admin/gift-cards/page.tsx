'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Gift,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Ban,
  Eye,
  DollarSign
} from 'lucide-react'

type GiftCardStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'DISABLED'

interface GiftCard {
  id: string
  code: string
  initialAmount: number
  currentBalance: number
  status: GiftCardStatus
  recipientEmail: string | null
  recipientName: string | null
  purchaserName: string | null
  message: string | null
  expiresAt: string | null
  createdAt: string
}

const statusConfig: Record<GiftCardStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800' },
  USED: { label: 'Épuisée', color: 'bg-gray-100 text-gray-800' },
  EXPIRED: { label: 'Expirée', color: 'bg-red-100 text-red-800' },
  DISABLED: { label: 'Désactivée', color: 'bg-orange-100 text-orange-800' },
}

export default function GiftCardsPage() {
  const [showModal, setShowModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null)

  // Simulation de données
  const giftCards: GiftCard[] = [
    {
      id: '1',
      code: 'GIFT-ABCD-1234-EFGH',
      initialAmount: 100,
      currentBalance: 75.50,
      status: 'ACTIVE',
      recipientEmail: 'marie@example.com',
      recipientName: 'Marie Dupont',
      purchaserName: 'Jean Martin',
      message: 'Joyeux anniversaire !',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      code: 'GIFT-IJKL-5678-MNOP',
      initialAmount: 50,
      currentBalance: 0,
      status: 'USED',
      recipientEmail: 'pierre@example.com',
      recipientName: 'Pierre Bernard',
      purchaserName: null,
      message: null,
      expiresAt: null,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      code: 'GIFT-QRST-9012-UVWX',
      initialAmount: 200,
      currentBalance: 200,
      status: 'ACTIVE',
      recipientEmail: null,
      recipientName: null,
      purchaserName: 'Admin',
      message: 'Carte cadeau de compensation',
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const totalValue = giftCards.reduce((acc, card) => acc + card.initialAmount, 0)
  const totalBalance = giftCards.reduce((acc, card) => acc + card.currentBalance, 0)
  const activeCards = giftCards.filter(c => c.status === 'ACTIVE').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cartes Cadeaux</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle carte
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cartes actives</p>
                <p className="text-2xl font-bold">{activeCards}</p>
              </div>
              <Gift className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valeur totale émise</p>
                <p className="text-2xl font-bold">{totalValue.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde restant</p>
                <p className="text-2xl font-bold">{totalBalance.toFixed(2)}€</p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisé</p>
                <p className="text-2xl font-bold">{(totalValue - totalBalance).toFixed(2)}€</p>
              </div>
              <Check className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des cartes */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les cartes cadeaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Code</th>
                  <th className="text-left py-3 px-4 font-medium">Montant initial</th>
                  <th className="text-left py-3 px-4 font-medium">Solde</th>
                  <th className="text-left py-3 px-4 font-medium">Destinataire</th>
                  <th className="text-left py-3 px-4 font-medium">Expiration</th>
                  <th className="text-left py-3 px-4 font-medium">Statut</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {giftCards.map((card) => {
                  const config = statusConfig[card.status]

                  return (
                    <tr key={card.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{card.code}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyCode(card.code)}
                          >
                            {copiedCode === card.code ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{card.initialAmount.toFixed(2)}€</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${card.currentBalance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {card.currentBalance.toFixed(2)}€
                        </span>
                        {card.initialAmount > 0 && (
                          <div className="w-full h-1 bg-gray-200 rounded mt-1">
                            <div
                              className="h-1 rounded bg-green-500"
                              style={{ width: `${(card.currentBalance / card.initialAmount) * 100}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {card.recipientName ? (
                          <div>
                            <p className="text-sm font-medium">{card.recipientName}</p>
                            <p className="text-xs text-muted-foreground">{card.recipientEmail}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Non attribué</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {card.expiresAt
                          ? new Date(card.expiresAt).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={config.color}>{config.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedCard(card)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {card.recipientEmail && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {card.status === 'ACTIVE' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Nouvelle carte cadeau</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Montant (€)</label>
                <Input type="number" placeholder="50" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom du destinataire</label>
                  <Input placeholder="Marie Dupont" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email du destinataire</label>
                  <Input type="email" placeholder="marie@example.com" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Message personnalisé</label>
                <textarea
                  className="w-full mt-1 p-2 border rounded-md"
                  rows={3}
                  placeholder="Joyeux anniversaire !"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date d'expiration (optionnel)</label>
                <Input type="date" className="mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sendEmail" />
                <label htmlFor="sendEmail" className="text-sm">Envoyer par email au destinataire</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setShowModal(false)}>
                  Créer la carte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de détail */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Détails de la carte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                <p className="font-mono text-lg">{selectedCard.code}</p>
                <p className="text-3xl font-bold mt-2">{selectedCard.currentBalance.toFixed(2)}€</p>
                <p className="text-sm opacity-80">sur {selectedCard.initialAmount.toFixed(2)}€</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge className={statusConfig[selectedCard.status].color}>
                    {statusConfig[selectedCard.status].label}
                  </Badge>
                </div>
                {selectedCard.recipientName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Destinataire</span>
                    <span>{selectedCard.recipientName}</span>
                  </div>
                )}
                {selectedCard.purchaserName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Acheté par</span>
                    <span>{selectedCard.purchaserName}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Créée le</span>
                  <span>{new Date(selectedCard.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                {selectedCard.expiresAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expire le</span>
                    <span>{new Date(selectedCard.expiresAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                {selectedCard.message && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Message</p>
                    <p className="text-sm italic">"{selectedCard.message}"</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedCard(null)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
