import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from 'next-intl/middleware'
import { getSiteConfigs } from './app/actions/admin/settings'

// Configuration i18n dynamique depuis la DB
async function getI18nConfig() {
  try {
    const configs = await getSiteConfigs('i18n')
    const enabledLocales = configs
      .filter(c => c.key.endsWith('_enabled') && c.value === 'true')
      .map(c => c.key.replace('i18n_', '').replace('_enabled', ''))

    return {
      locales: enabledLocales.length > 0 ? enabledLocales : ['fr'],
      defaultLocale: configs.find(c => c.key === 'i18n_default_locale')?.value || 'fr'
    }
  } catch (error) {
    return { locales: ['fr'], defaultLocale: 'fr' }
  }
}

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en', 'es', 'de'], // Fallback, sera remplacé par la config DB
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protection admin
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("authjs.session-token")?.value ||
                         request.cookies.get("__Secure-authjs.session-token")?.value

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // TODO: Réactiver l'i18n une fois les variables d'environnement configurées en prod
  // Routes à exclure de l'internationalisation
  // const excludedPaths = ['/api/', '/admin/', '/_next/', '/favicon.ico', '/robots.txt']
  // const shouldExcludeI18n = excludedPaths.some(path => pathname.startsWith(path))

  // Internationalisation pour les routes publiques
  // if (!shouldExcludeI18n) {
  //   return intlMiddleware(request)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|admin|_next|_vercel|.*\\..*).*)",
    "/admin/:path*"
  ]
}
