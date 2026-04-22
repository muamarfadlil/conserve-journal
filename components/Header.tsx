"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang Jurnal" },
];

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    SUPER_ADMIN: { label: "Super Admin", cls: "bg-red-900/50 text-red-300 border-red-700" },
    ADMIN: { label: "Admin", cls: "bg-ocean-800 text-ocean-300 border-ocean-600" },
    USER: { label: "User", cls: "bg-ocean-900 text-ocean-400 border-ocean-700" },
  };
  const { label, cls } = map[role] ?? map.USER;
  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 bg-ocean-950 border-b border-ocean-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-ocean-500 group-hover:ring-gold-400 transition-all duration-300 flex-shrink-0">
              <Image src="/logo.png" alt="CONSERVE Logo" width={36} height={36} className="w-full h-full object-cover" />
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

          {/* NAVIGASI DESKTOP */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative
                    ${isActive
                      ? "text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-gold-400"
                      : "text-ocean-300 hover:text-white hover:bg-ocean-800"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* USER SECTION */}
            {isLoggedIn ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-ocean-800 border border-ocean-700 hover:border-ocean-500 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-ocean-600 flex items-center justify-center text-xs font-bold text-white">
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white font-medium leading-none">
                      {session.user.name}
                    </p>
                    <RoleBadge role={session.user.role} />
                  </div>
                  <svg className={`w-3.5 h-3.5 text-ocean-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-ocean-900/95 backdrop-blur-sm border border-ocean-700 rounded-lg shadow-xl shadow-ocean-950/60 py-1 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ocean-300 hover:text-white hover:bg-ocean-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <div className="h-px bg-ocean-800 my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-ocean-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-4 px-4 py-2 rounded-md text-sm font-semibold
                           bg-gold-500 hover:bg-gold-400 text-ocean-950
                           transition-colors duration-200"
              >
                Masuk
              </Link>
            )}
          </nav>

          {/* HAMBURGER (MOBILE) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-ocean-300 hover:text-white hover:bg-ocean-800 transition-colors"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
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

        {/* MENU MOBILE */}
        {menuOpen && (
          <div className="md:hidden border-t border-ocean-800 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    block px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive ? "bg-ocean-700 text-white" : "text-ocean-300 hover:text-white hover:bg-ocean-800"}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            {isLoggedIn ? (
              <>
                <div className="px-4 py-2 text-xs text-ocean-500 border-t border-ocean-800 mt-2 pt-2">
                  Login sebagai <span className="text-white font-medium">{session.user.name}</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 rounded-md text-sm text-ocean-300 hover:text-white hover:bg-ocean-800 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="block w-full text-left px-4 py-2 rounded-md text-sm text-red-400 hover:bg-ocean-800 transition-colors"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block mt-2 px-4 py-2 text-center rounded-md text-sm font-semibold bg-gold-500 text-ocean-950 hover:bg-gold-400 transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
