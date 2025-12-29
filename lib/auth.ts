import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    // Durée de session par défaut: 1 jour
    maxAge: 24 * 60 * 60, // 24 heures
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Update lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          rememberMe: credentials.rememberMe === 'true',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
        token.id = user.id as string
        token.rememberMe = user.rememberMe

        // Si remember me est activé, étendre la durée du token
        if (user.rememberMe) {
          // 30 jours
          token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
        } else {
          // 1 jour
          token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        }
      }

      // Rafraîchir l'expiration à chaque utilisation si remember me est activé
      if (trigger === 'update' && token.rememberMe) {
        token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
})
