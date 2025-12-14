'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Gift,
  Copy,
  Check,
  RefreshCw,
  Ban,
  Eye,
  DollarSign
} from 'lucide-react'
import {
  getGiftCards,
  createGiftCard,
  disableGiftCard
} from '@/app/actions/admin/discounts'

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
  expiresAt: Date | null
  createdAt: Date
  stripeCouponId?: string | null
}

const statusConfig: Record<GiftCardStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  USED: { label: 'Épuisée', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  EXPIRED: { label: 'Expirée', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  DISABLED: { label: 'Désactivée', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
}

export default function GiftCardsPage() {
  // ... (existing state)

  // ... (existing loadData)

  // ... (existing handlers)

  return (
    <div className="space-y-6">
      {/* ... (existing header and stats) ... */}

      {/* Liste des cartes */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les cartes cadeaux</CardTitle>
        </CardHeader>
        <CardContent>
          {giftCards.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune carte cadeau créée.</p>
              <Button className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une carte
              </Button>
            </div>
          ) : (
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
                      <tr key={card.id} className="border-b hover:bg-muted/50">
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
                            {card.stripeCouponId && (
                              <Badge variant="secondary" className="text-[10px] h-5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200">
                                Stripe
                              </Badge>
                            )}
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
                            <div className="w-full h-1 bg-muted rounded mt-1">
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
                            {card.status === 'ACTIVE' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => handleDisable(card.id)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
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
                <Input
                  type="number"
                  placeholder="50"
                  className="mt-1"
                  value={newCard.amount}
                  onChange={(e) => setNewCard({ ...newCard, amount: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom du destinataire</label>
                  <Input
                    placeholder="Marie Dupont"
                    className="mt-1"
                    value={newCard.recipientName}
                    onChange={(e) => setNewCard({ ...newCard, recipientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email du destinataire</label>
                  <Input
                    type="email"
                    placeholder="marie@example.com"
                    className="mt-1"
                    value={newCard.recipientEmail}
                    onChange={(e) => setNewCard({ ...newCard, recipientEmail: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Message personnalisé</label>
                <textarea
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                  rows={3}
                  placeholder="Joyeux anniversaire !"
                  value={newCard.message}
                  onChange={(e) => setNewCard({ ...newCard, message: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date d'expiration (optionnel)</label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newCard.expiresAt}
                  onChange={(e) => setNewCard({ ...newCard, expiresAt: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate}>
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
                    <span className="text-muted-foreground">Créé par</span>
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
