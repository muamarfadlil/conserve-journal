// ============================================================
// components/Header.tsx
// Komponen navigasi atas yang konsisten di semua halaman.
// Menggunakan "sticky" agar tetap terlihat saat halaman di-scroll.
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Definisi item navigasi — mudah untuk ditambah di kemudian hari
const navLinks = [
  { href: "/",        label: "Beranda" },
  { href: "/about",  label: "Tentang Jurnal" },
];

export default function Header() {
  const pathname = usePathname();
  // State untuk toggle menu mobile (hamburger menu)
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ocean-950 border-b border-ocean-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* === LOGO & NAMA JURNAL === */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Ikon laut sederhana berbasis SVG — tidak memerlukan dependensi tambahan */}
            <div className="w-9 h-9 rounded-full bg-ocean-700 flex items-center justify-center
                            ring-2 ring-ocean-500 group-hover:ring-gold-400 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-ocean-100"
                   stroke="currentColor" strokeWidth="1.8">
                <path d="M3 12c2-4 4-4 6 0s4 4 6 0" />
                <path d="M3 17c2-4 4-4 6 0s4 4 6 0" />
                <path d="M3 7c2-4 4-4 6 0s4 4 6 0" />
              </svg>
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

          {/* === NAVIGASI DESKTOP === */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-ocean-700 text-white"
                      : "text-ocean-300 hover:text-white hover:bg-ocean-800"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
            {/* Tombol Submit Artikel — CTA utama di header */}
            <a
              href="mailto:editor@conservejournal.ac.id"
              className="ml-4 px-4 py-2 rounded-md text-sm font-semibold
                         bg-gold-500 hover:bg-gold-400 text-ocean-950
                         transition-colors duration-200"
            >
              Submit Artikel
            </a>
          </nav>

          {/* === TOMBOL HAMBURGER (MOBILE) === */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-ocean-300 hover:text-white hover:bg-ocean-800
                       transition-colors duration-200"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          >
            {menuOpen ? (
              // Ikon X (close)
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Ikon hamburger (3 garis)
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* === MENU MOBILE (muncul saat hamburger di-klik) === */}
        {menuOpen && (
          <div className="md:hidden border-t border-ocean-800 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)} // Tutup menu setelah navigasi
                  className={`
                    block px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-ocean-700 text-white"
                      : "text-ocean-300 hover:text-white hover:bg-ocean-800"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href="mailto:editor@conservejournal.ac.id"
              className="block mt-2 px-4 py-2 text-center rounded-md text-sm font-semibold
                         bg-gold-500 text-ocean-950 hover:bg-gold-400 transition-colors"
            >
              Submit Artikel
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
