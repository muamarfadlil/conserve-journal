"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import DashboardSidebar from "./DashboardSidebar"
import NotificationBell from "./NotificationBell"

type User = {
  id: string
  name?: string | null
  email?: string | null
  role: string
  avatarUrl?: string | null
}

export default function DashboardShell({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Mobile backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300
                    ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto flex-shrink-0
                    transform transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <DashboardSidebar user={user} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-3
                           flex items-center gap-3
                           bg-[var(--bg-surface-alt)] border-b border-[var(--border-default)]
                           dark:bg-gradient-to-r dark:from-ocean-900/90 dark:to-ocean-950/90
                           dark:backdrop-blur-sm dark:border-ocean-800/70">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-lg transition-colors flex-shrink-0
                       text-[var(--text-muted)] hover:text-[var(--text-primary)]
                       hover:bg-[var(--bg-surface)] border border-transparent
                       hover:border-[var(--border-default)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
            aria-label="Buka navigasi"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center justify-between flex-1 min-w-0">
            <p className="text-sm flex items-center gap-1.5 truncate">
              <span className="hidden sm:inline text-[var(--text-muted)]">Panel Pengelolaan</span>
              <span className="text-[var(--border-default)] hidden sm:inline">·</span>
              <span className="text-[var(--text-primary)] font-medium">CONSERVE Journal</span>
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <p className="text-[var(--text-muted)] text-xs hidden md:block">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <NotificationBell />
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6 bg-[var(--bg-base)]">
          {children}
        </main>
      </div>
    </div>
  )
}
