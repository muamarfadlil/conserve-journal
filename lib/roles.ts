// lib/roles.ts — helpers yang aman di client + server component

export type AppRole = "SUPER_ADMIN" | "ADMIN" | "REVIEWER" | "USER"

/** Hierarki numerik — lebih tinggi = lebih banyak akses */
const RANK: Record<string, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  REVIEWER: 2,
  USER: 1,
}

export function getRank(role?: string | null): number {
  return RANK[role ?? ""] ?? 0
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === "SUPER_ADMIN"
}

export function isAdmin(role?: string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export function isReviewer(role?: string | null): boolean {
  return role === "REVIEWER" || role === "ADMIN" || role === "SUPER_ADMIN"
}

export function canSubmit(role?: string | null): boolean {
  return !!role // semua user yang login bisa submit
}

export const ROLE_META: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    desc: "Akses penuh — kelola semua pengguna, role, dan konten",
    color: "text-red-400",
    bg: "bg-red-900/30 border-red-800",
  },
  ADMIN: {
    label: "Admin / Editor",
    desc: "Kelola artikel, tetapkan reviewer, ubah status submission",
    color: "text-amber-400",
    bg: "bg-amber-900/30 border-amber-800",
  },
  REVIEWER: {
    label: "Reviewer",
    desc: "Tinjau submission yang ditugaskan, beri komentar & rekomendasi",
    color: "text-blue-400",
    bg: "bg-blue-900/30 border-blue-800",
  },
  USER: {
    label: "Penulis",
    desc: "Submit artikel dan pantau status submission sendiri",
    color: "text-ocean-400",
    bg: "bg-ocean-900 border-ocean-700",
  },
}
