'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Upload,
  X,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Save,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Play,
  FileVideo
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Collection {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  product?: any
  collections: Collection[]
}

interface VariantAttribute {
  id: string
  name: string
  values: string[]
}

interface ProductVariant {
  id: string
  sku: string
  title: string
  attributes: Record<string, string>
  price: number
  comparePrice?: number
  stock: number
  images: string[]
}

interface ProductVideo {
  id: string
  type: 'upload' | 'youtube' | 'vimeo'
  url: string
  thumbnail?: string
  title?: string
  size?: number
  duration?: number
}

// Pending image with local preview
interface PendingImage {
  id: string
  localUrl: string
  file: File
  status: 'uploading' | 'success' | 'error'
  remoteUrl?: string
  error?: string
}

export function ProductForm({ product, collections }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product

  // Basic info
  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [comparePrice, setComparePrice] = useState(product?.comparePrice?.toString() || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)

  // Type
  const [productType, setProductType] = useState<'IN_STOCK' | 'PRINT_ON_DEMAND'>(
    product?.productType || 'IN_STOCK'
  )
  const [printProvider, setPrintProvider] = useState(product?.printProvider || '')

  // Stock
  const [stock, setStock] = useState(product?.stock?.toString() || '0')
  const [trackQuantity, setTrackQuantity] = useState(product?.trackQuantity ?? true)
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product?.lowStockThreshold?.toString() || '5'
  )

  // Media
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [videos, setVideos] = useState<ProductVideo[]>(product?.videos || [])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [compressVideo, setCompressVideo] = useState(true)

  // Variants
  const [hasVariants, setHasVariants] = useState(product?.hasVariants ?? false)
  const [variantAttributes, setVariantAttributes] = useState<VariantAttribute[]>(
    product?.variantAttributes || []
  )
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || [])

  // Collections
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    product?.collections?.map((c: any) => c.collectionId) || []
  )

  // SEO
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription || '')
  const [slug, setSlug] = useState(product?.slug || '')

  // Tags
  const [tags, setTags] = useState<string[]>(product?.tags || [])
  const [newTag, setNewTag] = useState('')

  // Form state
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Upload with retry mechanism
  const uploadWithRetry = async (file: File, maxRetries = 3): Promise<string> => {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'product')

        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed')
        }

        return data.url
      } catch (error: any) {
        lastError = error
        console.warn(`Upload attempt ${attempt}/${maxRetries} failed:`, error.message)

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff: 1s, 2s, 4s...)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
        }
      }
    }

    throw lastError || new Error('Upload failed after retries')
  }

  // Image upload with instant preview
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Create pending images with local preview URLs immediately
    const newPendingImages: PendingImage[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      localUrl: URL.createObjectURL(file),
      file,
      status: 'uploading' as const
    }))

    setPendingImages(prev => [...prev, ...newPendingImages])
    setUploadingImages(true)

    // Upload all images in parallel
    const uploadPromises = newPendingImages.map(async (pending) => {
      try {
        const url = await uploadWithRetry(pending.file)

        // Update pending image status
        setPendingImages(prev => prev.map(p =>
          p.id === pending.id
            ? { ...p, status: 'success' as const, remoteUrl: url }
            : p
        ))

        // Add to final images and remove from pending after short delay
        setTimeout(() => {
          setImages(prev => [...prev, url])
          setPendingImages(prev => prev.filter(p => p.id !== pending.id))
          // Cleanup blob URL
          URL.revokeObjectURL(pending.localUrl)
        }, 500) // Brief delay to show success state

        return { success: true, file: pending.file.name }
      } catch (error: any) {
        // Update pending image with error
        setPendingImages(prev => prev.map(p =>
          p.id === pending.id
            ? { ...p, status: 'error' as const, error: error.message }
            : p
        ))
        return { success: false, file: pending.file.name, error: error.message }
      }
    })

    const results = await Promise.all(uploadPromises)

    const successCount = results.filter(r => r.success).length
    const failedResults = results.filter(r => !r.success)

    if (successCount > 0) {
      toast.success(`${successCount} image(s) uploadée(s)`)
    }

    if (failedResults.length > 0) {
      toast.error(`Échec: ${failedResults.map(r => r.file).join(', ')}`)
    }

    setUploadingImages(false)
  }, [])

  // Retry failed pending image
  const retryPendingImage = async (pendingId: string) => {
    const pending = pendingImages.find(p => p.id === pendingId)
    if (!pending) return

    setPendingImages(prev => prev.map(p =>
      p.id === pendingId ? { ...p, status: 'uploading' as const, error: undefined } : p
    ))

    try {
      const url = await uploadWithRetry(pending.file)
      setImages(prev => [...prev, url])
      setPendingImages(prev => prev.filter(p => p.id !== pendingId))
      URL.revokeObjectURL(pending.localUrl)
      toast.success('Image uploadée')
    } catch (error: any) {
      setPendingImages(prev => prev.map(p =>
        p.id === pendingId ? { ...p, status: 'error' as const, error: error.message } : p
      ))
      toast.error('Échec de l\'upload')
    }
  }

  // Remove failed pending image
  const removePendingImage = (pendingId: string) => {
    const pending = pendingImages.find(p => p.id === pendingId)
    if (pending) {
      URL.revokeObjectURL(pending.localUrl)
    }
    setPendingImages(prev => prev.filter(p => p.id !== pendingId))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  })

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Add video
  const [videoUrl, setVideoUrl] = useState('')
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo'>('youtube')

  const addVideoEmbed = () => {
    if (!videoUrl.trim()) return

    const video: ProductVideo = {
      id: crypto.randomUUID(),
      type: videoType,
      url: videoUrl,
      title: `Vidéo ${videos.length + 1}`
    }

    setVideos(prev => [...prev, video])
    setVideoUrl('')
    toast.success('Vidéo ajoutée')
  }

  const removeVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id))
  }

  // Video upload with retry mechanism
  const handleVideoUpload = async (file: File, maxRetries = 3) => {
    setUploadingVideo(true)
    setVideoUploadProgress(0)

    // Vérifier la taille max (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 100MB). Veuillez compresser votre vidéo.')
      setUploadingVideo(false)
      return
    }

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          toast.info(`Nouvelle tentative (${attempt}/${maxRetries})...`)
          setVideoUploadProgress(0)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'product')

        const xhr = new XMLHttpRequest()

        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              setVideoUploadProgress(progress)
            }
          })

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText)
                reject(new Error(errorData.error || 'Upload failed'))
              } catch {
                reject(new Error('Upload failed'))
              }
            }
          })

          xhr.addEventListener('error', () => reject(new Error('Erreur réseau')))
          xhr.addEventListener('abort', () => reject(new Error('Upload annulé')))

          xhr.open('POST', '/api/admin/upload-video')
          xhr.send(formData)
        })

        const result = JSON.parse(xhr.responseText)

        if (result.success) {
          const video: ProductVideo = {
            id: crypto.randomUUID(),
            type: 'upload',
            url: result.url,
            title: file.name,
            size: file.size
          }
          setVideos(prev => [...prev, video])
          toast.success('Vidéo uploadée avec succès')
          return // Success, exit the retry loop
        } else {
          throw new Error(result.error)
        }
      } catch (error: any) {
        lastError = error
        console.warn(`Video upload attempt ${attempt}/${maxRetries} failed:`, error.message)

        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    // All retries failed
    toast.error(lastError?.message || "Erreur lors de l'upload. Vérifiez votre connexion.")
    setUploadingVideo(false)
    setVideoUploadProgress(0)
  }

  // Video dropzone
  const onVideoDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await handleVideoUpload(file)
    }
  }, [compressVideo])

  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDragActive
  } = useDropzone({
    onDrop: onVideoDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
    disabled: uploadingVideo
  })

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Variant attributes
  const addVariantAttribute = () => {
    setVariantAttributes(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: '', values: [] }
    ])
  }

  const updateVariantAttribute = (id: string, updates: Partial<VariantAttribute>) => {
    setVariantAttributes(prev =>
      prev.map(attr => attr.id === id ? { ...attr, ...updates } : attr)
    )
  }

  const removeVariantAttribute = (id: string) => {
    setVariantAttributes(prev => prev.filter(attr => attr.id !== id))
  }

  // Generate variants from attributes
  const generateVariants = () => {
    if (variantAttributes.length === 0) return

    const generateCombinations = (
      attrs: VariantAttribute[],
      current: Record<string, string> = {},
      index: number = 0
    ): Record<string, string>[] => {
      if (index >= attrs.length) {
        return [current]
      }

      const attr = attrs[index]
      const combinations: Record<string, string>[] = []

      for (const value of attr.values) {
        combinations.push(
          ...generateCombinations(
            attrs,
            { ...current, [attr.name]: value },
            index + 1
          )
        )
      }

      return combinations
    }

    const combinations = generateCombinations(variantAttributes)

    const newVariants: ProductVariant[] = combinations.map((combo, i) => ({
      id: crypto.randomUUID(),
      sku: `${sku || 'SKU'}-${i + 1}`,
      title: Object.values(combo).join(' / '),
      attributes: combo,
      price: parseFloat(price) || 0,
      stock: 0,
      images: []
    }))

    setVariants(newVariants)
    toast.success(`${newVariants.length} variante(s) générée(s)`)
  }

  // Update variant
  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setVariants(prev =>
      prev.map(v => v.id === id ? { ...v, ...updates } : v)
    )
  }

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id))
  }

  // Tags
  const addTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return
    setTags(prev => [...prev, newTag.trim()])
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  // Save product
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Le nom du produit est requis')
      setActiveTab('basic')
      return
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error('Le prix doit être supérieur à 0')
      setActiveTab('basic')
      return
    }

    setSaving(true)

    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        sku: sku || null,
        isActive,
        isFeatured,
        productType,
        printProvider: productType === 'PRINT_ON_DEMAND' ? printProvider : null,
        stock: hasVariants ? 0 : parseInt(stock),
        trackQuantity,
        lowStockThreshold: parseInt(lowStockThreshold),
        images,
        videos,
        hasVariants,
        variantAttributes: hasVariants ? variantAttributes : [],
        variants: hasVariants ? variants.map(v => ({
          ...v,
          price: v.price,
          stock: v.stock
        })) : [],
        collections: selectedCollections,
        tags,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || description.slice(0, 160),
        slug: slug || generateSlug(name)
      }

      const url = isEditing
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la sauvegarde')
      }

      toast.success(isEditing ? 'Produit mis à jour' : 'Produit créé')
      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Informations</TabsTrigger>
          <TabsTrigger value="media">Médias</TabsTrigger>
          <TabsTrigger value="variants">Variantes</TabsTrigger>
          <TabsTrigger value="organization">Organisation</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: T-shirt Premium Coton Bio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre produit..."
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Prix barré (optionnel)</Label>
                  <div className="relative">
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                      placeholder="0.00"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (référence)</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="Ex: TSHIRT-001"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Type de produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setProductType('IN_STOCK')}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    productType === 'IN_STOCK'
                      ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <h3 className="font-medium">En stock</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Produit géré avec votre propre inventaire
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('PRINT_ON_DEMAND')}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    productType === 'PRINT_ON_DEMAND'
                      ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <h3 className="font-medium">Print-on-demand</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Fabriqué à la demande par un fournisseur
                  </p>
                </button>
              </div>

              {productType === 'PRINT_ON_DEMAND' && (
                <div className="space-y-2">
                  <Label htmlFor="printProvider">Fournisseur</Label>
                  <Select value={printProvider} onValueChange={setPrintProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="printful">Printful</SelectItem>
                      <SelectItem value="printify">Printify</SelectItem>
                      <SelectItem value="custom">Fournisseur propre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {!hasVariants && (
            <Card>
              <CardHeader>
                <CardTitle>Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Suivre la quantité</Label>
                    <p className="text-sm text-gray-500">
                      Activer le suivi des stocks pour ce produit
                    </p>
                  </div>
                  <Switch
                    checked={trackQuantity}
                    onCheckedChange={setTrackQuantity}
                  />
                </div>

                {trackQuantity && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Quantité en stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStock">Seuil stock bas</Label>
                      <Input
                        id="lowStock"
                        type="number"
                        min="0"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Produit actif</Label>
                  <p className="text-sm text-gray-500">
                    Le produit sera visible sur la boutique
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Produit en vedette</Label>
                  <p className="text-sm text-gray-500">
                    Afficher en priorité sur la page d'accueil
                  </p>
                </div>
                <Switch
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                La première image sera synchronisée avec Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
                )}
              >
                <input {...getInputProps()} />
                {uploadingImages ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Upload en cours...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Glissez-déposez vos images ici, ou cliquez pour sélectionner
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG, WebP jusqu'à 5MB
                    </p>
                  </>
                )}
              </div>

              {(images.length > 0 || pendingImages.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Uploaded images */}
                  {images.map((url, index) => (
                    <div
                      key={`uploaded-${index}`}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2",
                        index === 0
                          ? "border-gray-900 dark:border-white"
                          : "border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <Image
                        src={url}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
                          Principale
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Pending images (uploading, success, or error) */}
                  {pendingImages.map((pending) => (
                    <div
                      key={pending.id}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2",
                        pending.status === 'uploading' && "border-blue-400 dark:border-blue-500",
                        pending.status === 'success' && "border-green-400 dark:border-green-500",
                        pending.status === 'error' && "border-red-400 dark:border-red-500"
                      )}
                    >
                      {/* Local preview image - using img tag for blob URLs */}
                      <img
                        src={pending.localUrl}
                        alt="Uploading..."
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-opacity",
                          pending.status === 'uploading' && "opacity-70"
                        )}
                      />

                      {/* Status overlay */}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        pending.status === 'uploading' && "bg-black/30",
                        pending.status === 'success' && "bg-green-500/20",
                        pending.status === 'error' && "bg-red-500/30"
                      )}>
                        {pending.status === 'uploading' && (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                            <span className="text-white text-xs mt-1 font-medium">Upload...</span>
                          </div>
                        )}
                        {pending.status === 'success' && (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        )}
                        {pending.status === 'error' && (
                          <div className="flex flex-col items-center gap-1">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                            <span className="text-white text-xs bg-red-500 px-1 rounded">Échec</span>
                          </div>
                        )}
                      </div>

                      {/* Error actions */}
                      {pending.status === 'error' && (
                        <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => retryPendingImage(pending.id)}
                            className="flex-1 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Réessayer
                          </button>
                          <button
                            type="button"
                            onClick={() => removePendingImage(pending.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vidéos</CardTitle>
              <CardDescription>
                Uploadez des vidéos ou ajoutez des liens YouTube/Vimeo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload vidéo */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Upload depuis votre PC</Label>
                <div
                  {...getVideoRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isVideoDragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400",
                    uploadingVideo && "pointer-events-none opacity-50"
                  )}
                >
                  <input {...getVideoInputProps()} />
                  {uploadingVideo ? (
                    <div className="space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload en cours... {videoUploadProgress}%
                      </p>
                      <Progress value={videoUploadProgress} className="w-full max-w-xs mx-auto" />
                    </div>
                  ) : (
                    <>
                      <FileVideo className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Glissez une vidéo ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        MP4, WebM, MOV, AVI, MKV (max 100MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Ou lien externe */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">ou</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Lien YouTube / Vimeo</Label>
                <div className="flex gap-2">
                  <Select value={videoType} onValueChange={(v: 'youtube' | 'vimeo') => setVideoType(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="URL de la vidéo"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addVideoEmbed}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Liste des vidéos */}
              {videos.length > 0 && (
                <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                  <Label className="text-base font-medium">Vidéos ajoutées ({videos.length})</Label>
                  <div className="space-y-2">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {video.type === 'upload' ? (
                            <div className="h-12 w-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              <Play className="h-5 w-5 text-gray-500" />
                            </div>
                          ) : (
                            <div className={cn(
                              "h-12 w-16 rounded flex items-center justify-center text-white text-xs font-bold",
                              video.type === 'youtube' ? "bg-red-600" : "bg-blue-600"
                            )}>
                              {video.type === 'youtube' ? 'YT' : 'VM'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{video.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {video.type === 'upload' ? (
                                <>
                                  <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                    Uploadé
                                  </span>
                                  {video.size && <span>{formatFileSize(video.size)}</span>}
                                </>
                              ) : (
                                <span className="truncate max-w-xs">{video.url}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {video.type === 'upload' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(video.url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVideo(video.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants */}
        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
              <CardDescription>
                Créez des variantes pour les différentes options de votre produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ce produit a des variantes</Label>
                  <p className="text-sm text-gray-500">
                    Tailles, couleurs, matières, etc.
                  </p>
                </div>
                <Switch
                  checked={hasVariants}
                  onCheckedChange={setHasVariants}
                />
              </div>

              {hasVariants && (
                <>
                  {/* Attributes */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Attributs</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVariantAttribute}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un attribut
                      </Button>
                    </div>

                    {variantAttributes.map((attr, index) => (
                      <div key={attr.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label>Nom de l'attribut</Label>
                            <Input
                              value={attr.name}
                              onChange={(e) => updateVariantAttribute(attr.id, { name: e.target.value })}
                              placeholder="Ex: Taille, Couleur, Tissu..."
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariantAttribute(attr.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div>
                          <Label>Valeurs (séparées par des virgules)</Label>
                          <Input
                            value={attr.values.join(', ')}
                            onChange={(e) => updateVariantAttribute(attr.id, {
                              values: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                            })}
                            placeholder="Ex: S, M, L, XL"
                          />
                        </div>
                      </div>
                    ))}

                    {variantAttributes.length > 0 && variantAttributes.every(a => a.name && a.values.length > 0) && (
                      <Button type="button" onClick={generateVariants} className="w-full">
                        Générer les variantes
                      </Button>
                    )}
                  </div>

                  {/* Generated Variants */}
                  {variants.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium">Variantes ({variants.length})</h3>
                      <div className="space-y-2">
                        {variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-4 mb-3">
                              <GripVertical className="h-5 w-5 text-gray-400" />
                              <span className="font-medium">{variant.title}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label className="text-xs">SKU</Label>
                                <Input
                                  value={variant.sku}
                                  onChange={(e) => updateVariant(variant.id, { sku: e.target.value })}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Prix</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(variant.id, { price: parseFloat(e.target.value) || 0 })}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Stock</Label>
                                <Input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => updateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVariant(variant.id)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {collections.map((collection) => (
                  <label
                    key={collection.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedCollections.includes(collection.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCollections(prev => [...prev, collection.id])
                        } else {
                          setSelectedCollections(prev => prev.filter(id => id !== collection.id))
                        }
                      }}
                    />
                    <span>{collection.name}</span>
                  </label>
                ))}
                {collections.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Aucune collection disponible
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Référencement (SEO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL du produit</Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">/products/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={generateSlug(name) || 'url-du-produit'}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaTitle">Titre SEO</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={name || 'Titre de la page'}
                />
                <p className="text-xs text-gray-500">
                  {metaTitle.length || name.length}/60 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Description SEO</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={description.slice(0, 160) || 'Description pour les moteurs de recherche'}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  {metaDescription.length || description.slice(0, 160).length}/160 caractères
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Aperçu Google</p>
                <div>
                  <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {metaTitle || name || 'Titre du produit'}
                  </p>
                  <p className="text-green-700 text-sm">
                    faith-shop.fr/products/{slug || generateSlug(name) || 'url'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {metaDescription || description.slice(0, 160) || 'Description du produit...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions - Mobile-first sticky footer */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-white dark:bg-gray-900 border-t sticky bottom-0 z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3 sm:h-10 sm:px-4"
          onClick={() => router.back()}
        >
          <X className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Annuler</span>
        </Button>
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 sm:h-10 sm:px-4"
            onClick={() => window.open(`/products/preview?data=${encodeURIComponent(JSON.stringify({ name, price, images }))}`, '_blank')}
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Prévisualiser</span>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            size="sm"
            className="h-9 px-3 sm:h-10 sm:px-4"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                <span className="hidden sm:inline">Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{isEditing ? 'Mettre à jour' : 'Créer'}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
