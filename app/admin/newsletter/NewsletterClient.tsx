'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Mail,
  Users,
  UserCheck,
  UserX,
  Send,
  Trash2,
  RefreshCw,
  Loader2,
  Search,
  Download,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Subscriber {
  id: string
  email: string
  isActive: boolean
  createdAt: Date
}

interface NewsletterClientProps {
  subscribers: Subscriber[]
  stats: { total: number; active: number; inactive: number }
}

export function NewsletterClient({ subscribers: initialSubscribers, stats }: NewsletterClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)

  const filteredSubscribers = initialSubscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'active' ? s.isActive : !s.isActive)
    return matchesSearch && matchesFilter
  })

  const toggleSubscriber = useCallback(async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      })
      if (res.ok) {
        toast.success(isActive ? 'Abonné désactivé' : 'Abonné réactivé')
        router.refresh()
      }
    } catch {
      toast.error('Erreur')
    }
  }, [router])

  const deleteSubscriber = useCallback(async (id: string) => {
    if (!confirm('Supprimer cet abonné ?')) return
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success('Abonné supprimé')
        router.refresh()
      }
    } catch {
      toast.error('Erreur')
    }
  }, [router])

  const sendNewsletter = useCallback(async (isTest: boolean) => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Sujet et contenu requis')
      return
    }
    if (isTest && !testEmail.trim()) {
      toast.error('Entrez un email de test')
      return
    }
    if (!isTest && !confirm(`Envoyer la newsletter à ${stats.active} abonnés actifs ?`)) return

    isTest ? setIsSendingTest(true) : setIsSending(true)
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          content,
          ...(isTest ? { testEmail } : {}),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        if (!isTest) {
          setSubject('')
          setContent('')
        }
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      isTest ? setIsSendingTest(false) : setIsSending(false)
    }
  }, [subject, content, testEmail, stats.active])

  const exportCSV = useCallback(() => {
    const active = initialSubscribers.filter(s => s.isActive)
    const csv = 'email,date_inscription\n' + active.map(s =>
      `${s.email},${new Date(s.createdAt).toISOString()}`
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${active.length} abonnés exportés`)
  }, [initialSubscribers])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground mt-1">Gérez vos abonnés et envoyez des newsletters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
          <Button variant="outline" onClick={() => router.refresh()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer" onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter('active')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Actifs</p>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter('inactive')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Désinscrits</p>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.inactive}</p>
          </CardContent>
        </Card>
      </div>

      {/* Send Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envoyer une Newsletter
          </CardTitle>
          <CardDescription>
            Composez et envoyez un email à tous vos abonnés actifs ({stats.active})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sujet</Label>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Ex: Nouvelle collection disponible !"
            />
          </div>
          <div className="space-y-2">
            <Label>Contenu (HTML supporté)</Label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={"<h2>Bonjour !</h2>\n<p>Découvrez notre nouvelle collection...</p>\n<a href=\"https://faith-shop.fr/shop\" style=\"display:inline-block;padding:14px 32px;background:#000;color:#fff;text-decoration:none;font-weight:bold;letter-spacing:1px;\">DÉCOUVRIR</a>"}
              className="w-full min-h-[200px] px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <Input
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="Email de test"
                className="flex-1"
              />
              <Button variant="outline" onClick={() => sendNewsletter(true)} disabled={isSendingTest} className="gap-2 shrink-0">
                {isSendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Tester
              </Button>
            </div>
            <Button onClick={() => sendNewsletter(false)} disabled={isSending || stats.active === 0} className="gap-2">
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSending ? 'Envoi en cours...' : `Envoyer à ${stats.active} abonnés`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Abonnés</CardTitle>
              <CardDescription>{filteredSubscribers.length} abonné{filteredSubscribers.length > 1 ? 's' : ''}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Désinscrits'}
              </Button>
            ))}
          </div>

          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun abonné trouvé
            </div>
          ) : (
            <div className="divide-y">
              {filteredSubscribers.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      sub.isActive ? 'bg-green-500' : 'bg-gray-300'
                    )} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{sub.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {format(new Date(sub.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSubscriber(sub.id, sub.isActive)}
                      title={sub.isActive ? 'Désactiver' : 'Réactiver'}
                    >
                      {sub.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSubscriber(sub.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
