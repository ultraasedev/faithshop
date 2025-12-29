'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save, Image as ImageIcon, Upload, Plus, Trash2, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'

interface Slide {
  id: string
  image: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

const createEmptySlide = (): Slide => ({
  id: crypto.randomUUID(),
  image: '',
  title: '',
  subtitle: '',
  ctaText: 'Découvrir',
  ctaLink: '/shop'
})

export default function HomepageEditorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null)
  const [slides, setSlides] = useState<Slide[]>([createEmptySlide()])
  const [previewIndex, setPreviewIndex] = useState(0)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/homepage-config')
      if (res.ok) {
        const data = await res.json()
        // Check if we have slides JSON or legacy config
        if (data.home_hero_slides) {
          try {
            const parsedSlides = JSON.parse(data.home_hero_slides)
            if (Array.isArray(parsedSlides) && parsedSlides.length > 0) {
              setSlides(parsedSlides)
            }
          } catch {
            // Legacy format - convert single hero to slide
            if (data.home_hero_image || data.home_hero_title) {
              setSlides([{
                id: crypto.randomUUID(),
                image: data.home_hero_image || '',
                title: data.home_hero_title || '',
                subtitle: data.home_hero_subtitle || '',
                ctaText: data.home_hero_cta_text || 'Découvrir',
                ctaLink: data.home_hero_cta_link || '/shop'
              }])
            }
          }
        } else if (data.home_hero_image || data.home_hero_title) {
          // Legacy format
          setSlides([{
            id: crypto.randomUUID(),
            image: data.home_hero_image || '',
            title: data.home_hero_title || '',
            subtitle: data.home_hero_subtitle || '',
            ctaText: data.home_hero_cta_text || 'Découvrir',
            ctaLink: data.home_hero_cta_link || '/shop'
          }])
        }
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_hero_slides: JSON.stringify(slides),
          // Keep legacy fields for backwards compatibility
          home_hero_image: slides[0]?.image || '',
          home_hero_title: slides[0]?.title || '',
          home_hero_subtitle: slides[0]?.subtitle || '',
          home_hero_cta_text: slides[0]?.ctaText || '',
          home_hero_cta_link: slides[0]?.ctaLink || ''
        })
      })

      if (res.ok) {
        toast.success('Homepage mise à jour')
        router.refresh()
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingSlideId(slideId)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        updateSlide(slideId, 'image', data.url)
        toast.success('Image uploadée')
      } else {
        toast.error('Erreur lors de l\'upload')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploadingSlideId(null)
    }
  }

  const addSlide = () => {
    const newSlide = createEmptySlide()
    setSlides([...slides, newSlide])
    setPreviewIndex(slides.length)
  }

  const removeSlide = (id: string) => {
    if (slides.length <= 1) {
      toast.error('Vous devez avoir au moins un slide')
      return
    }
    const newSlides = slides.filter(s => s.id !== id)
    setSlides(newSlides)
    if (previewIndex >= newSlides.length) {
      setPreviewIndex(Math.max(0, newSlides.length - 1))
    }
  }

  const updateSlide = (id: string, field: keyof Slide, value: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return
    const newSlides = [...slides]
    const [removed] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, removed)
    setSlides(newSlides)
    setPreviewIndex(toIndex)
  }

  const currentSlide = slides[previewIndex] || slides[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Page d'Accueil</h1>
          <p className="text-muted-foreground">Personnalisez les slides du hero</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>

      {/* Hero Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu du Slider</CardTitle>
          <CardDescription>
            {slides.length} slide{slides.length > 1 ? 's' : ''} • Slide {previewIndex + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-[21/9] bg-gray-900 rounded-lg overflow-hidden">
            {currentSlide?.image ? (
              currentSlide.image.endsWith('.mp4') || currentSlide.image.endsWith('.webm') ? (
                <video
                  src={currentSlide.image}
                  className="w-full h-full object-cover opacity-70"
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <Image
                  src={currentSlide.image}
                  alt="Hero preview"
                  fill
                  className="object-cover opacity-70"
                />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
              <p className="text-xs uppercase tracking-widest mb-2 opacity-80">
                {currentSlide?.subtitle || 'Sous-titre'}
              </p>
              <h2 className="text-2xl md:text-4xl font-serif mb-4">
                {currentSlide?.title || 'Titre du Slide'}
              </h2>
              <span className="px-4 py-2 bg-white text-black text-sm">
                {currentSlide?.ctaText || 'Bouton'}
              </span>
            </div>

            {/* Navigation Preview */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={() => setPreviewIndex(prev => prev === 0 ? slides.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setPreviewIndex(prev => prev === slides.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === previewIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slides List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Slides du Hero</CardTitle>
            <CardDescription>Ajoutez et gérez vos slides</CardDescription>
          </div>
          <Button onClick={addSlide} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un slide
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`p-4 border rounded-lg transition-all ${
                index === previewIndex ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveSlide(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <button
                    onClick={() => moveSlide(index, index + 1)}
                    disabled={index === slides.length - 1}
                    className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="font-medium">Slide {index + 1}</span>
                <button
                  onClick={() => setPreviewIndex(index)}
                  className="text-xs text-primary hover:underline ml-auto"
                >
                  Voir
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlide(slide.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image */}
                <div className="space-y-2">
                  <Label>Image/Vidéo de fond</Label>
                  <div className="flex gap-2">
                    <Input
                      value={slide.image}
                      onChange={(e) => updateSlide(slide.id, 'image', e.target.value)}
                      placeholder="URL ou uploadez"
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleImageUpload(slide.id, e)}
                        className="hidden"
                      />
                      <Button variant="outline" size="icon" asChild disabled={uploadingSlideId === slide.id}>
                        <span>
                          {uploadingSlideId === slide.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                  {slide.image && (
                    <div className="relative w-24 h-14 rounded overflow-hidden">
                      {slide.image.endsWith('.mp4') || slide.image.endsWith('.webm') ? (
                        <video src={slide.image} className="w-full h-full object-cover" muted />
                      ) : (
                        <Image src={slide.image} alt="" fill className="object-cover" />
                      )}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={slide.title}
                    onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                    placeholder="L'Élégance de la Foi"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label>Sous-titre</Label>
                  <Input
                    value={slide.subtitle}
                    onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                    placeholder="Collection 2025"
                  />
                </div>

                {/* CTA */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Bouton</Label>
                    <Input
                      value={slide.ctaText}
                      onChange={(e) => updateSlide(slide.id, 'ctaText', e.target.value)}
                      placeholder="Découvrir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lien</Label>
                    <Input
                      value={slide.ctaLink}
                      onChange={(e) => updateSlide(slide.id, 'ctaLink', e.target.value)}
                      placeholder="/shop"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
