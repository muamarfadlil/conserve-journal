"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang Jurnal" },
];

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  SUPER_ADMIN: { label: "Super Admin", cls: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700" },
  ADMIN:       { label: "Admin",       cls: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700" },
  REVIEWER:    { label: "Reviewer",    cls: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700" },
  USER:        { label: "Penulis",     cls: "bg-teal-50 text-teal-700 border-teal-300 dark:bg-ocean-900 dark:text-ocean-400 dark:border-ocean-700" },
};

function RoleBadge({ role }: { role: string }) {
  const { label, cls } = ROLE_BADGE[role] ?? ROLE_BADGE.USER;
  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border leading-none ${cls}`}>
      {label}
    </span>
  );
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isLoggedIn = !!session?.user;
  const initials = getInitials(session?.user?.name);
  const avatarUrl = session?.user?.avatarUrl;

  return (
    <header className="sticky top-0 z-50 border-b shadow-sm transition-colors duration-200
                       bg-[var(--bg-header)] border-[var(--border-default)]">

      {/* ISSN strip */}
      <div className="hidden sm:flex justify-end items-center px-4 sm:px-6 lg:px-8 py-1
                      border-b border-[var(--border-default)] bg-[var(--bg-surface-alt)]">
        <p className="text-[11px] font-mono text-[var(--text-muted)] tracking-wide">
          <span className="mr-4">Online ISSN : 0000-0000</span>
          <span>Print ISSN : 0000-0001</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white ring-2 ring-ocean-400
                            group-hover:ring-gold-400 transition-all duration-300 flex-shrink-0
                            flex items-center justify-center p-0.5">
              <Image src="/logo.png" alt="CONSERVE Logo" width={36} height={36}
                     className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif font-bold text-[var(--text-primary)] text-lg leading-tight tracking-wide">
                CONSERVE
              </span>
              <span className="block text-ocean-500 text-[10px] leading-tight tracking-widest uppercase">
                Journal of Community Services
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative
                    ${isActive
                      ? "text-[var(--text-primary)] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-gold-400"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Theme toggle */}
            <ThemeToggle />

            {isLoggedIn ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg
                             bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                             hover:border-ocean-400 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700
                                  flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                                  overflow-hidden">
                    {avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      : initials}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-[var(--text-primary)] font-medium leading-none mb-0.5">
                      {session.user.name}
                    </p>
                    <RoleBadge role={session.user.role} />
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200
                                ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-52 rounded-xl shadow-xl py-1.5 z-50
                              transition-all duration-150 origin-top-right
                              bg-[var(--bg-surface)] border border-[var(--border-default)]
                              shadow-black/10 dark:shadow-ocean-950/60
                              ${userMenuOpen
                                ? "opacity-100 scale-100 pointer-events-auto"
                                : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  <div className="px-4 py-2.5 border-b border-[var(--border-default)]">
                    <p className="text-[var(--text-primary)] text-xs font-medium truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[var(--text-muted)] text-[10px] truncate mt-0.5">
                      {session.user.email}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm
                               text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                               hover:bg-[var(--bg-surface-alt)] transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm
                               text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                               hover:bg-[var(--bg-surface-alt)] transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Profil Saya
                  </Link>

                  <div className="h-px bg-[var(--border-default)] mx-2 my-1" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                               text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300
                               hover:bg-[var(--bg-surface-alt)] transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold
                           bg-gold-500 hover:bg-gold-400 text-ocean-950 transition-colors duration-200"
              >
                Masuk
              </Link>
            )}
          </nav>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-2 rounded-md text-[var(--text-secondary)]
                         hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]
                         transition-colors"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden border-t border-[var(--border-default)] py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-[var(--bg-surface-alt)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"}`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isLoggedIn ? (
              <>
                <div className="mx-4 my-2 h-px bg-[var(--border-default)]" />
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700
                                  flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                                  overflow-hidden">
                    {avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      : initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] text-sm font-medium truncate">{session.user.name}</p>
                    <RoleBadge role={session.user.role} />
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm
                             text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                             hover:bg-[var(--bg-surface-alt)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm
                             text-red-500 hover:bg-[var(--bg-surface-alt)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block mt-1 px-4 py-2.5 text-center rounded-lg text-sm
                           font-semibold bg-gold-500 text-ocean-950 hover:bg-gold-400 transition-colors"
              >
                Masuk
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
