'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

interface PreviewData {
  title: string
  description: string
  price: number
  images: string[]
  content: string
  isActive: boolean
  tags?: string[]
  category?: string
}

interface LivePreviewProps {
  data: PreviewData
  type: 'product' | 'page' | 'collection'
  className?: string
}

const DeviceFrame = ({ device, children, className = '' }: {
  device: 'desktop' | 'tablet' | 'mobile',
  children: React.ReactNode,
  className?: string
}) => {
  const frameClasses = {
    desktop: 'w-full max-w-6xl mx-auto',
    tablet: 'w-full max-w-3xl mx-auto',
    mobile: 'w-full max-w-sm mx-auto'
  }

  const contentClasses = {
    desktop: 'min-h-[600px]',
    tablet: 'min-h-[500px]',
    mobile: 'min-h-[400px]'
  }

  return (
    <div className={`${frameClasses[device]} ${className}`}>
      <div className={`bg-background border rounded-lg overflow-hidden shadow-lg ${contentClasses[device]}`}>
        {children}
      </div>
    </div>
  )
}

const ProductPreview = ({ data, device }: { data: PreviewData, device: string }) => {
  const isDesktop = device === 'desktop'
  const isMobile = device === 'mobile'

  return (
    <div className={`p-4 ${isDesktop ? 'flex gap-8' : 'space-y-4'}`}>
      {/* Images */}
      <div className={`${isDesktop ? 'w-1/2' : 'w-full'}`}>
        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
          {data.images.length > 0 ? (
            <Image
              src={data.images[0]}
              alt={data.title}
              fill
              className="object-cover"
              sizes={isDesktop ? "50vw" : "100vw"}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/10 rounded-lg flex items-center justify-center">
                  📷
                </div>
                <p className="text-sm">Image du produit</p>
              </div>
            </div>
          )}
        </div>

        {data.images.length > 1 && (
          <div className={`flex gap-2 mt-3 ${isMobile ? 'justify-center' : ''}`}>
            {data.images.slice(1, 5).map((image, index) => (
              <div key={index} className="w-16 h-16 relative rounded-md overflow-hidden bg-muted">
                <Image
                  src={image}
                  alt={`${data.title} ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`${isDesktop ? 'w-1/2' : 'w-full'}`}>
        <div className="space-y-4">
          <div>
            <h1 className={`font-serif font-bold ${isDesktop ? 'text-3xl' : isMobile ? 'text-xl' : 'text-2xl'}`}>
              {data.title || 'Nom du produit'}
            </h1>
            {data.category && (
              <p className="text-muted-foreground mt-1">{data.category}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`font-bold ${isDesktop ? 'text-2xl' : 'text-xl'}`}>
              {data.price.toFixed(2)} €
            </span>
            {!data.isActive && (
              <Badge variant="secondary">Indisponible</Badge>
            )}
          </div>

          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: data.description || '<p>Description du produit...</p>' }} />
          </div>

          <div className="space-y-3">
            <Button className="w-full" disabled={!data.isActive}>
              {data.isActive ? 'Ajouter au panier' : 'Produit indisponible'}
            </Button>
            <Button variant="outline" className="w-full">
              Ajouter à ma liste de souhaits
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PagePreview = ({ data, device }: { data: PreviewData, device: string }) => {
  const isDesktop = device === 'desktop'

  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Hero Section */}
        <div className={`text-center space-y-4 ${isDesktop ? 'py-16' : 'py-8'}`}>
          <h1 className={`font-serif font-bold ${isDesktop ? 'text-4xl' : 'text-2xl'}`}>
            {data.title || 'Titre de la page'}
          </h1>
          {data.description && (
            <p className={`text-muted-foreground max-w-2xl mx-auto ${isDesktop ? 'text-lg' : 'text-base'}`}>
              <span dangerouslySetInnerHTML={{ __html: data.description }} />
            </p>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none mx-auto">
          <div dangerouslySetInnerHTML={{ __html: data.content || '<p>Contenu de la page...</p>' }} />
        </div>
      </div>
    </div>
  )
}

export default function LivePreview({ data, type, className = '' }: LivePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isVisible, setIsVisible] = useState(true)

  const renderPreview = () => {
    switch (type) {
      case 'product':
        return <ProductPreview data={data} device={device} />
      case 'page':
        return <PagePreview data={data} device={device} />
      default:
        return <ProductPreview data={data} device={device} />
    }
  }

  if (!isVisible) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Aperçu masqué
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Afficher
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Aperçu en temps réel
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={device} onValueChange={(value) => setDevice(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center gap-2">
              <Tablet className="h-4 w-4" />
              Tablet
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="desktop">
            <DeviceFrame device="desktop">
              {renderPreview()}
            </DeviceFrame>
          </TabsContent>

          <TabsContent value="tablet">
            <DeviceFrame device="tablet">
              {renderPreview()}
            </DeviceFrame>
          </TabsContent>

          <TabsContent value="mobile">
            <DeviceFrame device="mobile">
              {renderPreview()}
            </DeviceFrame>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}