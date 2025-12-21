'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Edit, Eye, Trash2, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  stock: number
  isActive: boolean
  category?: string
}

interface DragDropGridProps {
  products: Product[]
  onReorder: (products: Product[]) => void
  onEdit: (productId: string) => void
  onDelete: (productId: string) => void
  gridView?: boolean
}

interface SortableItemProps {
  product: Product
  onEdit: (productId: string) => void
  onDelete: (productId: string) => void
  gridView?: boolean
}

function SortableItem({ product, onEdit, onDelete, gridView = true }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (gridView) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={`relative group hover:shadow-lg transition-all duration-200 ${
          isDragging ? 'ring-2 ring-primary' : ''
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 p-1 bg-background/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
          {product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">{product.price.toFixed(2)} €</span>
            <span className="text-muted-foreground">Stock: {product.stock}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(product.id)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Modifier
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1"
            >
              <Link href={`/products/${product.id}`} target="_blank">
                <Eye className="h-3 w-3 mr-1" />
                Voir
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // List View
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group hover:shadow-md transition-all duration-200 ${
        isDragging ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Product Image */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-semibold">{product.name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="font-medium">{product.price.toFixed(2)} €</span>
              <span>Stock: {product.stock}</span>
              {product.category && <span>Catégorie: {product.category}</span>}
            </div>
          </div>

          {/* Status */}
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Actif" : "Inactif"}
          </Badge>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(product.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              asChild
            >
              <Link href={`/products/${product.id}`} target="_blank">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DragDropGrid({
  products,
  onReorder,
  onEdit,
  onDelete,
  gridView = true,
}: DragDropGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: any) {
    const { active } = event
    setActiveId(active.id)
  }

  function handleDragEnd(event: any) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = products.findIndex((item) => item.id === active.id)
      const newIndex = products.findIndex((item) => item.id === over.id)

      const newProducts = arrayMove(products, oldIndex, newIndex)
      onReorder(newProducts)
    }

    setActiveId(null)
  }

  const activeProduct = activeId ? products.find(p => p.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={products.map(p => p.id)}
        strategy={gridView ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={
          gridView
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {products.map((product) => (
            <SortableItem
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              gridView={gridView}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeProduct ? (
          <SortableItem
            product={activeProduct}
            onEdit={onEdit}
            onDelete={onDelete}
            gridView={gridView}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}