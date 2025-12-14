'use client'

import { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TranslationWatcher } from '@/lib/translation-watcher'

interface TranslationInputProps {
  value: string
  onChange: (value: string) => void
  translationKey: string
  multiline?: boolean
  placeholder?: string
  rows?: number
  className?: string
}

export function TranslationInput({
  value,
  onChange,
  translationKey,
  multiline = false,
  placeholder,
  rows = 3,
  className
}: TranslationInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!inputRef.current) return

    const watcher = TranslationWatcher.getInstance()
    cleanupRef.current = watcher.watchElement(
      inputRef.current as HTMLInputElement | HTMLTextAreaElement,
      translationKey
    )

    return () => {
      cleanupRef.current?.()
    }
  }, [translationKey])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  if (multiline) {
    return (
      <Textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
    )
  }

  return (
    <Input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  )
}