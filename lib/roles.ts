// lib/roles.ts
// Helper role yang aman dipakai di client component maupun server component
// Tidak mengandung dependensi server-only (Prisma, bcrypt, NextAuth server)

export function isSuperAdmin(role?: string | null): boolean {
  return role === "SUPER_ADMIN"
}

export function isAdmin(role?: string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
}
