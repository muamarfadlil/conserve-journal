// lib/auth.ts
// Konfigurasi NextAuth — kredensial + JWT strategy

import { NextAuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.isActive) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl ?? null,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.avatarUrl = (user as { avatarUrl?: string | null }).avatarUrl ?? null
      }
      // Allow client-side update() calls to refresh avatarUrl in token
      if (trigger === "update" && session?.avatarUrl !== undefined) {
        token.avatarUrl = session.avatarUrl
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatarUrl = token.avatarUrl as string | null | undefined
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 jam
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// Helper — ambil session di Server Component / Route Handler
export const getSession = () => getServerSession(authOptions)

// Re-export role helpers (definisi asli di lib/roles.ts agar bisa dipakai client component)
export { isAdmin, isSuperAdmin } from "./roles"
