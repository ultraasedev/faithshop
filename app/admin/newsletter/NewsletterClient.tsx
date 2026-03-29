'use client'

import { useState, useCallback, useMemo } from 'react'
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
  Plus,
  Type,
  Image as ImageIcon,
  MousePointer,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  Sparkles,
  ShoppingBag,
  Palette,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── Types ───
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

type BlockType = 'heading' | 'text' | 'image' | 'button' | 'divider' | 'spacer'

interface Block {
  id: string
  type: BlockType
  content: string
  url?: string
  alt?: string
  align?: 'left' | 'center' | 'right'
  level?: 1 | 2 | 3
}

// ─── Templates ───
const TEMPLATES: { name: string; icon: React.ReactNode; description: string; blocks: Omit<Block, 'id'>[] }[] = [
  {
    name: 'Nouvelle Collection',
    icon: <ShoppingBag className="h-5 w-5" />,
    description: 'Annonce de nouvelle collection',
    blocks: [
      { type: 'heading', content: 'Nouvelle Collection Disponible', level: 1, align: 'center' },
      { type: 'text', content: 'Découvrez notre nouvelle collection, inspirée par la foi et le style. Des pièces uniques qui allient confort et élégance.', align: 'center' },
      { type: 'image', content: '', url: '', alt: 'Nouvelle collection' },
      { type: 'button', content: 'DÉCOUVRIR LA COLLECTION', url: '/shop', align: 'center' },
      { type: 'divider', content: '' },
      { type: 'text', content: 'Livraison offerte dès 50€ d\'achat avec le code WELCOME10', align: 'center' },
    ]
  },
  {
    name: 'Promotion',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Annonce de promo / soldes',
    blocks: [
      { type: 'heading', content: '🎉 Offre Spéciale', level: 1, align: 'center' },
      { type: 'text', content: 'Profitez de -20% sur toute la boutique pendant 48h seulement !', align: 'center' },
      { type: 'spacer', content: '' },
      { type: 'button', content: 'J\'EN PROFITE', url: '/shop', align: 'center' },
      { type: 'spacer', content: '' },
      { type: 'text', content: 'Utilisez le code PROMO20 au moment du paiement.', align: 'center' },
    ]
  },
  {
    name: 'Vide',
    icon: <Palette className="h-5 w-5" />,
    description: 'Commencer de zéro',
    blocks: [
      { type: 'heading', content: 'Titre de votre newsletter', level: 1, align: 'center' },
      { type: 'text', content: 'Votre message ici...', align: 'center' },
    ]
  },
]

// ─── Block to HTML ───
function blockToHtml(block: Block): string {
  const align = block.align || 'center'
  switch (block.type) {
    case 'heading': {
      const sizes = { 1: '28px', 2: '22px', 3: '18px' }
      const size = sizes[block.level || 1]
      return `<h${block.level || 2} style="font-size:${size};font-weight:700;color:#000;text-align:${align};margin:0 0 16px;font-family:Georgia,serif;">${block.content}</h${block.level || 2}>`
    }
    case 'text':
      return `<p style="font-size:16px;line-height:1.7;color:#444;text-align:${align};margin:0 0 20px;">${block.content}</p>`
    case 'image':
      return block.url
        ? `<div style="text-align:center;margin:0 0 20px;"><img src="${block.url}" alt="${block.alt || ''}" style="max-width:100%;height:auto;border-radius:8px;" /></div>`
        : ''
    case 'button':
      return `<div style="text-align:${align};margin:24px 0;"><a href="${block.url || '#'}" style="display:inline-block;padding:16px 40px;background-color:#000;color:#fff!important;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${block.content}</a></div>`
    case 'divider':
      return '<hr style="border:none;border-top:1px solid #e0e0e0;margin:30px 0;" />'
    case 'spacer':
      return '<div style="height:24px;"></div>'
    default:
      return ''
  }
}

function blocksToHtml(blocks: Block[]): string {
  return blocks.map(blockToHtml).join('\n')
}

// ─── Component ───
export function NewsletterClient({ subscribers: initialSubscribers, stats }: NewsletterClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'compose' | 'subscribers'>('compose')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Editor state
  const [subject, setSubject] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)

  const htmlContent = useMemo(() => blocksToHtml(blocks), [blocks])

  // ─── Block operations ───
  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: type === 'heading' ? 'Nouveau titre' : type === 'text' ? 'Votre texte ici...' : type === 'button' ? 'CLIQUEZ ICI' : '',
      align: 'center',
      level: type === 'heading' ? 2 : undefined,
      url: type === 'button' ? '/shop' : type === 'image' ? '' : undefined,
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === id)
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === blocks.length - 1)) return
    const newBlocks = [...blocks]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]]
    setBlocks(newBlocks)
  }

  const loadTemplate = (template: typeof TEMPLATES[number]) => {
    if (blocks.length > 0 && !confirm('Remplacer le contenu actuel ?')) return
    setBlocks(template.blocks.map(b => ({ ...b, id: crypto.randomUUID() })))
    setSelectedBlockId(null)
  }

  // ─── Send ───
  const sendNewsletter = useCallback(async (isTest: boolean) => {
    if (!subject.trim()) { toast.error('Sujet requis'); return }
    if (blocks.length === 0) { toast.error('Ajoutez du contenu'); return }
    if (isTest && !testEmail.trim()) { toast.error('Entrez un email de test'); return }
    if (!isTest && !confirm(`Envoyer à ${stats.active} abonnés actifs ?`)) return

    isTest ? setIsSendingTest(true) : setIsSending(true)
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content: htmlContent, ...(isTest ? { testEmail } : {}) }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        if (!isTest) { setSubject(''); setBlocks([]) }
      } else {
        toast.error(data.error)
      }
    } catch { toast.error('Erreur réseau') }
    finally { isTest ? setIsSendingTest(false) : setIsSending(false) }
  }, [subject, htmlContent, blocks.length, testEmail, stats.active])

  // ─── Subscribers ───
  const filteredSubscribers = initialSubscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'active' ? s.isActive : !s.isActive)
    return matchesSearch && matchesFilter
  })

  const toggleSubscriber = useCallback(async (id: string, isActive: boolean) => {
    const res = await fetch('/api/admin/newsletter', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive: !isActive }) })
    if (res.ok) { toast.success(isActive ? 'Désactivé' : 'Réactivé'); router.refresh() }
  }, [router])

  const deleteSubscriber = useCallback(async (id: string) => {
    if (!confirm('Supprimer cet abonné ?')) return
    const res = await fetch('/api/admin/newsletter', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { toast.success('Supprimé'); router.refresh() }
  }, [router])

  const exportCSV = useCallback(() => {
    const active = initialSubscribers.filter(s => s.isActive)
    const csv = 'email,date_inscription\n' + active.map(s => `${s.email},${new Date(s.createdAt).toISOString()}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success(`${active.length} abonnés exportés`)
  }, [initialSubscribers])

  const selectedBlock = blocks.find(b => b.id === selectedBlockId)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground mt-1">{stats.active} abonnés actifs</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === 'compose' ? 'default' : 'outline'} onClick={() => setTab('compose')} className="gap-2">
            <Mail className="h-4 w-4" /> Composer
          </Button>
          <Button variant={tab === 'subscribers' ? 'default' : 'outline'} onClick={() => setTab('subscribers')} className="gap-2">
            <Users className="h-4 w-4" /> Abonnés ({stats.total})
          </Button>
        </div>
      </div>

      {tab === 'compose' ? (
        <>
          {/* Templates */}
          {blocks.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TEMPLATES.map(t => (
                <Card key={t.name} className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary" onClick={() => loadTemplate(t)}>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      {t.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Subject */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Label className="shrink-0 font-semibold">Sujet</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Nouvelle collection disponible !" className="text-lg" />
              </div>
            </CardContent>
          </Card>

          {blocks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor - left 2/3 */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Contenu</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-1">
                          <Eye className="h-3.5 w-3.5" /> {showPreview ? 'Éditeur' : 'Aperçu'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showPreview ? (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-black p-6 text-center">
                          <h1 className="text-white text-xl font-light tracking-[4px]">FAITH SHOP</h1>
                        </div>
                        <div className="p-8" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
                          Vous recevez cet email car vous êtes inscrit(e) à la newsletter Faith Shop.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {blocks.map((block, idx) => (
                          <div
                            key={block.id}
                            onClick={() => setSelectedBlockId(block.id)}
                            className={cn(
                              'group relative flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all',
                              selectedBlockId === block.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-gray-200'
                            )}
                          >
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up') }} disabled={idx === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20">
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <GripVertical className="h-3 w-3 text-gray-400" />
                              <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down') }} disabled={idx === blocks.length - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20">
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="flex-1 min-w-0">
                              {block.type === 'heading' && (
                                <p className="font-serif font-bold text-lg truncate">{block.content || 'Titre...'}</p>
                              )}
                              {block.type === 'text' && (
                                <p className="text-sm text-gray-600 line-clamp-2">{block.content || 'Texte...'}</p>
                              )}
                              {block.type === 'image' && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <ImageIcon className="h-4 w-4" />
                                  {block.url ? <img src={block.url} alt="" className="h-12 rounded" /> : 'Image (ajouter URL)'}
                                </div>
                              )}
                              {block.type === 'button' && (
                                <span className="inline-block px-4 py-1.5 bg-black text-white text-xs font-bold tracking-wider">{block.content || 'BOUTON'}</span>
                              )}
                              {block.type === 'divider' && <hr className="border-gray-300" />}
                              {block.type === 'spacer' && <div className="h-4 border border-dashed border-gray-200 rounded text-center text-[10px] text-gray-300">espace</div>}
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600 transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Add block buttons */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t">
                          {[
                            { type: 'heading' as const, icon: <Type className="h-3.5 w-3.5" />, label: 'Titre' },
                            { type: 'text' as const, icon: <Type className="h-3.5 w-3.5" />, label: 'Texte' },
                            { type: 'image' as const, icon: <ImageIcon className="h-3.5 w-3.5" />, label: 'Image' },
                            { type: 'button' as const, icon: <MousePointer className="h-3.5 w-3.5" />, label: 'Bouton' },
                            { type: 'divider' as const, icon: <span className="text-xs">—</span>, label: 'Séparateur' },
                            { type: 'spacer' as const, icon: <Plus className="h-3.5 w-3.5" />, label: 'Espace' },
                          ].map(b => (
                            <Button key={b.type} variant="outline" size="sm" onClick={() => addBlock(b.type)} className="gap-1.5 text-xs">
                              {b.icon} {b.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Send actions */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex gap-2 flex-1">
                        <Input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="Email de test" className="flex-1" />
                        <Button variant="outline" onClick={() => sendNewsletter(true)} disabled={isSendingTest} className="gap-2 shrink-0">
                          {isSendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Tester
                        </Button>
                      </div>
                      <Button onClick={() => sendNewsletter(false)} disabled={isSending || stats.active === 0} className="gap-2">
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {isSending ? 'Envoi...' : `Envoyer à ${stats.active} abonnés`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Properties panel - right 1/3 */}
              <div className="space-y-4">
                {selectedBlock ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                        {selectedBlock.type === 'heading' ? 'Titre' : selectedBlock.type === 'text' ? 'Texte' : selectedBlock.type === 'image' ? 'Image' : selectedBlock.type === 'button' ? 'Bouton' : 'Bloc'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(selectedBlock.type === 'heading' || selectedBlock.type === 'text' || selectedBlock.type === 'button') && (
                        <div className="space-y-2">
                          <Label>Contenu</Label>
                          {selectedBlock.type === 'text' ? (
                            <textarea
                              value={selectedBlock.content}
                              onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })}
                              className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                            />
                          ) : (
                            <Input value={selectedBlock.content} onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })} />
                          )}
                        </div>
                      )}

                      {selectedBlock.type === 'heading' && (
                        <div className="space-y-2">
                          <Label>Taille</Label>
                          <div className="flex gap-1">
                            {([1, 2, 3] as const).map(l => (
                              <Button key={l} variant={selectedBlock.level === l ? 'default' : 'outline'} size="sm" onClick={() => updateBlock(selectedBlock.id, { level: l })}>
                                H{l}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedBlock.type === 'image' && (
                        <>
                          <div className="space-y-2">
                            <Label>URL de l'image</Label>
                            <Input value={selectedBlock.url || ''} onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })} placeholder="https://..." />
                          </div>
                          <div className="space-y-2">
                            <Label>Texte alternatif</Label>
                            <Input value={selectedBlock.alt || ''} onChange={e => updateBlock(selectedBlock.id, { alt: e.target.value })} placeholder="Description" />
                          </div>
                          {selectedBlock.url && <img src={selectedBlock.url} alt="" className="w-full rounded border" />}
                        </>
                      )}

                      {selectedBlock.type === 'button' && (
                        <div className="space-y-2">
                          <Label>Lien</Label>
                          <Input value={selectedBlock.url || ''} onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })} placeholder="/shop" />
                        </div>
                      )}

                      {['heading', 'text', 'button'].includes(selectedBlock.type) && (
                        <div className="space-y-2">
                          <Label>Alignement</Label>
                          <div className="flex gap-1">
                            {(['left', 'center', 'right'] as const).map(a => (
                              <Button key={a} variant={selectedBlock.align === a ? 'default' : 'outline'} size="sm" onClick={() => updateBlock(selectedBlock.id, { align: a })} className="flex-1 text-xs">
                                {a === 'left' ? 'Gauche' : a === 'center' ? 'Centre' : 'Droite'}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sélectionnez un bloc pour modifier ses propriétés</p>
                    </CardContent>
                  </Card>
                )}

                {/* Quick templates */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {TEMPLATES.map(t => (
                      <button key={t.name} onClick={() => loadTemplate(t)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                        <div className="p-2 rounded bg-primary/10">{t.icon}</div>
                        <div>
                          <p className="text-sm font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.description}</p>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ─── Subscribers tab ─── */
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card className="cursor-pointer" onClick={() => setFilter('all')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" /><p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p></div>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer" onClick={() => setFilter('active')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-green-500" /><p className="text-xs text-muted-foreground uppercase tracking-wide">Actifs</p></div>
                <p className="text-2xl font-bold mt-1">{stats.active}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer" onClick={() => setFilter('inactive')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2"><UserX className="h-4 w-4 text-red-500" /><p className="text-xs text-muted-foreground uppercase tracking-wide">Désinscrits</p></div>
                <p className="text-2xl font-bold mt-1">{stats.inactive}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Abonnés</CardTitle>
                  <CardDescription>{filteredSubscribers.length} abonné{filteredSubscribers.length > 1 ? 's' : ''}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9" />
                  </div>
                  <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1 shrink-0">
                    <Download className="h-4 w-4" /> CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {(['all', 'active', 'inactive'] as const).map(f => (
                  <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                    {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Désinscrits'}
                  </Button>
                ))}
              </div>

              {filteredSubscribers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Aucun abonné trouvé</div>
              ) : (
                <div className="divide-y">
                  {filteredSubscribers.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('h-2 w-2 rounded-full shrink-0', sub.isActive ? 'bg-green-500' : 'bg-gray-300')} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{sub.email}</p>
                          <p className="text-xs text-muted-foreground">Inscrit le {format(new Date(sub.createdAt), 'dd MMM yyyy', { locale: fr })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => toggleSubscriber(sub.id, sub.isActive)} title={sub.isActive ? 'Désactiver' : 'Réactiver'}>
                          {sub.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteSubscriber(sub.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
