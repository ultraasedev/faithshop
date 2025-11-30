import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protéger toutes les routes /admin
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    })

    // Si pas connecté, rediriger vers login
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Vérifier que l'utilisateur est admin ou super admin
    const userRole = token.role as string | undefined
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      // Rediriger vers la page d'accueil si pas admin
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"]
}
