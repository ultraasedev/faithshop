'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Package, User, MapPin, Heart, FileText, RotateCcw, Loader2, Plus, Pencil, Trash2, Check } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Address {
  id: string
  label: string | null
  firstName: string
  lastName: string
  address: string
  addressLine2: string | null
  city: string
  zipCode: string
  country: string
  phone: string | null
  isDefault: boolean
  isBilling: boolean
}

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    label: '',
    firstName: '',
    lastName: '',
    address: '',
    addressLine2: '',
    city: '',
    zipCode: '',
    country: 'France',
    phone: '',
    isDefault: false,
    isBilling: false,
  })

  const menuItems = [
    { href: '/account', icon: Package, label: 'Mes Commandes' },
    { href: '/account/profile', icon: User, label: 'Mes Informations' },
    { href: '/account/addresses', icon: MapPin, label: 'Mes Adresses', active: true },
    { href: '/account/wishlist', icon: Heart, label: 'Ma Liste de Souhaits' },
    { href: '/account/returns', icon: RotateCcw, label: 'Mes Retours' },
    { href: '/account/invoices', icon: FileText, label: 'Mes Factures' },
  ]

  useEffect(() => {
    if (session?.user) {
      fetchAddresses()
    }
  }, [session])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/account/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData

      const res = await fetch('/api/account/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingId ? 'Adresse modifiée' : 'Adresse ajoutée')
        fetchAddresses()
        resetForm()
      } else {
        toast.error('Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label || '',
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
      isBilling: address.isBilling,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette adresse ?')) return

    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Adresse supprimée')
        fetchAddresses()
      } else {
        toast.error('Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    }
  }

  const resetForm = () => {
    setFormData({
      label: '',
      firstName: '',
      lastName: '',
      address: '',
      addressLine2: '',
      city: '',
      zipCode: '',
      country: 'France',
      phone: '',
      isDefault: false,
      isBilling: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 bg-secondary/10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-serif text-3xl md:text-4xl mb-12">Mon Compte</h1>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar Menu */}
            <div className="md:col-span-1 space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant={item.active ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3 h-12"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                </Button>
              ))}
            </div>

            {/* Content Area */}
            <div className="md:col-span-3 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl">Mes Adresses</h2>
                {!showForm && (
                  <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Ajouter une adresse
                  </Button>
                )}
              </div>

              {showForm && (
                <div className="bg-background border border-border p-6">
                  <h3 className="font-medium mb-4">{editingId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom de l'adresse (optionnel)</label>
                      <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="Ex: Domicile, Bureau..."
                        className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Prénom *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                          className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nom *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                          className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Adresse *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Complément d'adresse</label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                        className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Code postal *</label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                          required
                          className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Ville *</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          required
                          className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Pays *</label>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                        >
                          <option value="France">France</option>
                          <option value="Belgique">Belgique</option>
                          <option value="Suisse">Suisse</option>
                          <option value="Luxembourg">Luxembourg</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                        />
                        <span className="text-sm">Adresse de livraison par défaut</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isBilling}
                          onChange={(e) => setFormData(prev => ({ ...prev, isBilling: e.target.checked }))}
                        />
                        <span className="text-sm">Adresse de facturation par défaut</span>
                      </label>
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {editingId ? 'Modifier' : 'Ajouter'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {addresses.length === 0 && !showForm ? (
                <div className="bg-background border border-border p-12 text-center">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Vous n'avez pas encore d'adresse enregistrée.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="bg-background border border-border p-6 relative">
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 text-xs bg-primary text-primary-foreground px-2 py-1 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Par défaut
                        </span>
                      )}
                      {address.label && <p className="font-medium text-sm text-muted-foreground mb-2">{address.label}</p>}
                      <p className="font-medium">{address.firstName} {address.lastName}</p>
                      <p className="text-muted-foreground text-sm mt-1">{address.address}</p>
                      {address.addressLine2 && <p className="text-muted-foreground text-sm">{address.addressLine2}</p>}
                      <p className="text-muted-foreground text-sm">{address.zipCode} {address.city}</p>
                      <p className="text-muted-foreground text-sm">{address.country}</p>
                      {address.phone && <p className="text-muted-foreground text-sm mt-2">{address.phone}</p>}

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(address)}>
                          <Pencil className="h-3 w-3 mr-1" /> Modifier
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(address.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
