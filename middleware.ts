import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protéger toutes les routes /admin
  if (pathname.startsWith("/admin")) {
    // Vérifier le cookie de session NextAuth
    const sessionToken = request.cookies.get("authjs.session-token")?.value ||
                         request.cookies.get("__Secure-authjs.session-token")?.value

    // Si pas de token de session, rediriger vers login
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Note: La vérification du rôle admin se fera côté serveur dans les pages admin
    // car on ne peut pas décoder le JWT facilement dans le middleware Edge
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"]
}
