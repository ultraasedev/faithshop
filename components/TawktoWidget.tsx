'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

export function TawktoWidget() {
  const pathname = usePathname()

  // Don't show on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

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
