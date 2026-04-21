// types/next-auth.d.ts
// Extend tipe bawaan NextAuth agar `role` dan `id` tersedia di session

import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    role: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
