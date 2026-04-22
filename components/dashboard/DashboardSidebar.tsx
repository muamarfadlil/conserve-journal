"use client"

import Link from "next/link"
import Image from "next/image"
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
  USER: "Pengguna",
}

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "text-red-400",
  ADMIN: "text-amber-400",
  USER: "text-ocean-400",
}

const ROLE_BG: Record<string, string> = {
  SUPER_ADMIN: "bg-red-900/30 border-red-800",
  ADMIN: "bg-amber-900/30 border-amber-800",
  USER: "bg-ocean-900 border-ocean-700",
}

export default function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const role = user.role

  const navGroups = [
    {
      label: null,
      items: [
        {
          href: "/dashboard",
          label: "Beranda",
          show: true,
          exact: true,
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        },
      ],
    },
    {
      label: "Penulis",
      items: [
        {
          href: "/submit",
          label: "Submit Artikel",
          show: true,
          exact: false,
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
        },
        {
          href: "/dashboard/submissions",
          label: "Artikel Saya",
          show: true,
          exact: false,
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        },
      ],
    },
    {
      label: "Editor",
      items: [
        {
          href: "/dashboard/reviewer",
          label: "Reviewer",
          show: isAdmin(role),
          exact: false,
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
        },
        {
          href: "/dashboard/articles",
          label: "Kelola Artikel",
          show: isAdmin(role),
          exact: false,
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        },
        {
          href: "/dashboard/users",
          label: "Kelola Pengguna",
          show: isSuperAdmin(role),
          exact: false,
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        },
      ],
    },
  ]

  return (
    <aside className="w-60 bg-ocean-900 border-r border-ocean-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-ocean-800">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-ocean-700 group-hover:ring-ocean-500 flex-shrink-0 flex items-center justify-center p-0.5 transition-all">
            <Image src="/logo.png" alt="CONSERVE" width={32} height={32} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-serif font-bold text-white text-sm leading-none">CONSERVE</p>
            <p className="text-ocean-600 text-[9px] leading-tight mt-0.5 uppercase tracking-widest">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="p-3 border-b border-ocean-800">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-800
                          flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name}</p>
            <span className={`inline-flex text-[9px] font-mono px-1.5 py-0.5 rounded border mt-0.5
                             ${ROLE_BG[role] ?? "bg-ocean-900 border-ocean-700"} ${ROLE_COLOR[role] ?? "text-ocean-400"}`}>
              {ROLE_LABEL[role] ?? role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group) => {
          const visible = group.items.filter(i => i.show)
          if (visible.length === 0) return null
          return (
            <div key={group.label ?? "main"} className="px-2 mb-1">
              {group.label && (
                <p className="px-2 py-1.5 text-[9px] font-mono text-ocean-600 uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              {visible.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium
                                transition-all duration-150 mb-0.5
                                ${isActive
                                  ? "bg-ocean-700/60 text-white ring-1 ring-inset ring-ocean-600"
                                  : "text-ocean-400 hover:text-white hover:bg-ocean-800"}`}>
                    <span className={`flex-shrink-0 ${isActive ? "text-ocean-200" : ""}`}>{item.icon}</span>
                    {item.label}
                    {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-ocean-400" />}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-ocean-800">
        <Link href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-ocean-500 hover:text-white hover:bg-ocean-800 transition-colors mb-0.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Lihat Situs Publik
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:text-red-300 hover:bg-ocean-800 transition-colors">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  )
}
