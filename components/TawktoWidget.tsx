'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
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

export function TawktoWidget() {
  const pathname = usePathname()
  const [tawkLoaded, setTawkLoaded] = useState(false)

  const isAdminPage = pathname?.startsWith('/admin')

  // Handle widget visibility based on route
  useEffect(() => {
    if (!tawkLoaded) return

    const updateVisibility = () => {
      if (window.Tawk_API) {
        if (isAdminPage) {
          window.Tawk_API.hideWidget?.()
        } else {
          window.Tawk_API.showWidget?.()
        }
      }
    }

    // Try immediately
    updateVisibility()

    // Also try after a short delay in case Tawk isn't ready
    const timeout = setTimeout(updateVisibility, 1000)

    return () => clearTimeout(timeout)
  }, [pathname, tawkLoaded, isAdminPage])

  // Set up Tawk onLoad callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.Tawk_API = window.Tawk_API || {}
      const originalOnLoad = window.Tawk_API.onLoad

      window.Tawk_API.onLoad = () => {
        setTawkLoaded(true)
        // Hide immediately if on admin page
        if (isAdminPage && window.Tawk_API?.hideWidget) {
          window.Tawk_API.hideWidget()
        }
        // Call original onLoad if it existed
        if (originalOnLoad) {
          originalOnLoad()
        }
      }
    }
  }, [isAdminPage])

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
    >
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/695054165823b7197c1541f2/1jdgsgubt';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  )
}
