'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void
      showWidget?: () => void
      onLoad?: () => void
    }
    Tawk_LoadStart?: Date
  }
}

// Pages where chat should be hidden
const HIDDEN_PATHS = ['/admin', '/login', '/forgot-password', '/reset-password']

export function TawktoWidget() {
  const pathname = usePathname()
  const tawkLoaded = useRef(false)
  const shouldHideRef = useRef(false)
  const titleObserverRef = useRef<MutationObserver | null>(null)

  // Check if current page should hide the widget
  const shouldHide = HIDDEN_PATHS.some(path => pathname?.startsWith(path))
  shouldHideRef.current = shouldHide // Keep ref in sync

  // Protect page title from Tawk.to modifications on hidden pages
  useEffect(() => {
    if (!shouldHide) {
      // On public pages, stop protecting title
      titleObserverRef.current?.disconnect()
      titleObserverRef.current = null
      return
    }

    // On admin/hidden pages, observe and restore title changes caused by Tawk.to
    const originalTitle = document.title

    const observer = new MutationObserver(() => {
      const currentTitle = document.title
      // Tawk.to sets titles like "un nouveau message..." or "(1) ..."
      if (
        currentTitle !== originalTitle &&
        (currentTitle.includes('nouveau message') ||
         currentTitle.includes('new message') ||
         /^\(\d+\)\s/.test(currentTitle))
      ) {
        document.title = originalTitle
      }
    })

    const titleEl = document.querySelector('title')
    if (titleEl) {
      observer.observe(titleEl, { childList: true, characterData: true, subtree: true })
    }

    titleObserverRef.current = observer

    return () => {
      observer.disconnect()
      titleObserverRef.current = null
    }
  }, [pathname, shouldHide])

  // Initialize Tawk_API before script loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.Tawk_API = window.Tawk_API || {}
      window.Tawk_LoadStart = new Date()

      // Set onLoad callback - will be called when Tawk finishes loading
      window.Tawk_API.onLoad = function() {
        tawkLoaded.current = true
        // Use ref to get current value
        if (shouldHideRef.current) {
          window.Tawk_API?.hideWidget?.()
        } else {
          window.Tawk_API?.showWidget?.()
        }
      }
    }
  }, []) // Only run once on mount

  // Handle visibility changes when route changes
  useEffect(() => {
    const updateVisibility = () => {
      if (window.Tawk_API && tawkLoaded.current) {
        if (shouldHide) {
          window.Tawk_API.hideWidget?.()
        } else {
          window.Tawk_API.showWidget?.()
        }
      }
    }

    // Try multiple times as Tawk loads asynchronously
    updateVisibility()
    const t1 = setTimeout(updateVisibility, 1000)
    const t2 = setTimeout(updateVisibility, 2500)
    const t3 = setTimeout(updateVisibility, 5000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname, shouldHide])

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      src="https://embed.tawk.to/695054165823b7197c1541f2/1jdgsgubt"
    />
  )
}
