"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang Jurnal" },
];

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  SUPER_ADMIN: { label: "Super Admin", cls: "bg-red-900/50 text-red-300 border-red-700" },
  ADMIN:       { label: "Admin",       cls: "bg-amber-900/50 text-amber-300 border-amber-700" },
  REVIEWER:    { label: "Reviewer",    cls: "bg-blue-900/50 text-blue-300 border-blue-700" },
  USER:        { label: "Penulis",     cls: "bg-ocean-900 text-ocean-400 border-ocean-700" },
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

  // Close user dropdown when clicking outside
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

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isLoggedIn = !!session?.user;
  const initials = getInitials(session?.user?.name);
  const avatarUrl = session?.user?.avatarUrl;

  return (
    <header className="sticky top-0 z-50 bg-ocean-950/95 backdrop-blur-sm border-b border-ocean-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white ring-2 ring-ocean-500
                            group-hover:ring-gold-400 transition-all duration-300 flex-shrink-0
                            flex items-center justify-center p-0.5">
              <Image src="/logo.png" alt="CONSERVE Logo" width={36} height={36}
                     className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif font-bold text-white text-lg leading-tight tracking-wide">
                CONSERVE
              </span>
              <span className="block text-ocean-400 text-[10px] leading-tight tracking-widest uppercase">
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
                      ? "text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-gold-400"
                      : "text-ocean-300 hover:text-white hover:bg-ocean-800"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isLoggedIn ? (
              <div className="relative ml-4" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-ocean-800/80
                             border border-ocean-700 hover:border-ocean-500 transition-all duration-200"
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
                    <p className="text-xs text-white font-medium leading-none mb-0.5">
                      {session.user.name}
                    </p>
                    <RoleBadge role={session.user.role} />
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-ocean-400 transition-transform duration-200
                                ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-52 bg-ocean-900/98 backdrop-blur-sm
                              border border-ocean-700 rounded-xl shadow-xl shadow-ocean-950/60
                              py-1.5 z-50 transition-all duration-150 origin-top-right
                              ${userMenuOpen
                                ? "opacity-100 scale-100 pointer-events-auto"
                                : "opacity-0 scale-95 pointer-events-none"}`}
                >
                  {/* User info header */}
                  <div className="px-4 py-2.5 border-b border-ocean-800">
                    <p className="text-white text-xs font-medium truncate">{session.user.name}</p>
                    <p className="text-ocean-500 text-[10px] truncate mt-0.5">{session.user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ocean-300
                               hover:text-white hover:bg-ocean-800 transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </Link>

                  <div className="h-px bg-ocean-800 mx-2 my-1" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                               text-red-400 hover:text-red-300 hover:bg-ocean-800 transition-colors"
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
                className="ml-4 px-4 py-2 rounded-lg text-sm font-semibold
                           bg-gold-500 hover:bg-gold-400 text-ocean-950 transition-colors duration-200"
              >
                Masuk
              </Link>
            )}
          </nav>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-md text-ocean-300 hover:text-white
                       hover:bg-ocean-800 transition-colors"
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

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden border-t border-ocean-800 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-ocean-700 text-white"
                      : "text-ocean-300 hover:text-white hover:bg-ocean-800"}`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isLoggedIn ? (
              <>
                <div className="mx-4 my-2 h-px bg-ocean-800" />
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
                    <p className="text-white text-sm font-medium truncate">{session.user.name}</p>
                    <RoleBadge role={session.user.role} />
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm
                             text-ocean-300 hover:text-white hover:bg-ocean-800 transition-colors"
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
                             text-red-400 hover:bg-ocean-800 transition-colors"
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
                className="block mt-1 mx-0 px-4 py-2.5 text-center rounded-lg text-sm
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
