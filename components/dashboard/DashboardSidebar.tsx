"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { isSuperAdmin, isAdmin } from "@/lib/roles"

type User = {
  id: string
  name?: string | null
  email?: string | null
  role: string
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
}

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "text-red-400",
  ADMIN: "text-ocean-300",
  USER: "text-ocean-500",
}

export default function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const role = user.role

  const navItems = [
    {
      href: "/dashboard",
      label: "Beranda",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      show: true,
    },
    {
      href: "/dashboard/articles",
      label: "Kelola Artikel",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      show: isAdmin(role),
    },
    {
      href: "/dashboard/users",
      label: "Kelola Pengguna",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      show: isSuperAdmin(role),
    },
  ]

  return (
    <aside className="w-64 bg-ocean-900 border-r border-ocean-800 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-ocean-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-ocean-700 flex items-center justify-center ring-2 ring-ocean-500">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-ocean-100"
                 stroke="currentColor" strokeWidth="1.8">
              <path d="M3 12c2-4 4-4 6 0s4 4 6 0" />
              <path d="M3 17c2-4 4-4 6 0s4 4 6 0" />
              <path d="M3 7c2-4 4-4 6 0s4 4 6 0" />
            </svg>
          </div>
          <div>
            <p className="font-serif font-bold text-white text-sm leading-none">CONSERVE</p>
            <p className="text-ocean-500 text-[9px] leading-tight mt-0.5">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-ocean-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ring-2 ring-ocean-700">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className={`text-xs font-mono ${ROLE_COLOR[role] ?? "text-ocean-500"}`}>
              {ROLE_LABEL[role] ?? role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-ocean-700/70 text-white ring-1 ring-ocean-600 ring-inset"
                    : "text-ocean-400 hover:text-white hover:bg-ocean-800"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-ocean-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ocean-400 hover:text-white hover:bg-ocean-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Lihat Situs
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-ocean-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  )
}
