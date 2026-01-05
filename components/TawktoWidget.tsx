'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void
      showWidget?: () => void
    }
    Tawk_LoadStart?: Date
  }
}

// Pages où le chat doit être caché
const HIDDEN_PATHS = ['/admin', '/login', '/forgot-password', '/reset-password']

export function TawktoWidget() {
  const pathname = usePathname()

  // Check if current page should hide the widget
  const shouldHide = HIDDEN_PATHS.some(path => pathname?.startsWith(path))

  // Handle widget visibility based on route
  useEffect(() => {
    const updateVisibility = () => {
      if (window.Tawk_API) {
        if (shouldHide) {
          window.Tawk_API.hideWidget?.()
        } else {
          window.Tawk_API.showWidget?.()
        }
      }
    }

    // Try multiple times as Tawk loads asynchronously
    updateVisibility()
    const t1 = setTimeout(updateVisibility, 500)
    const t2 = setTimeout(updateVisibility, 1500)
    const t3 = setTimeout(updateVisibility, 3000)
    const t4 = setTimeout(updateVisibility, 5000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [pathname, shouldHide])

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
