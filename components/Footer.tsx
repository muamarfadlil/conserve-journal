// ============================================================
// components/Footer.tsx
// Footer yang muncul di bagian bawah setiap halaman.
// Berisi informasi jurnal, tautan cepat, dan kontak.
// ============================================================

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ocean-950 border-t border-ocean-800 text-ocean-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* === KOLOM 1: IDENTITAS JURNAL === */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-white text-lg">CONSERVE</h3>
            <p className="text-sm leading-relaxed text-ocean-400">
              Journal of Community Services — Jurnal ilmiah yang didedikasikan
              untuk mempublikasikan hasil pengabdian kepada masyarakat
              dengan fokus pada pelestarian lingkungan dan pemberdayaan komunitas.
            </p>
            {/* Badge akreditasi (placeholder) */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ocean-900
                            rounded-full text-xs text-ocean-300 border border-ocean-700">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              E-ISSN: 0000-0000 · P-ISSN: 0000-0001
            </div>
          </div>

          {/* === KOLOM 2: TAUTAN CEPAT === */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-widest">
              Navigasi
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/",       label: "Beranda" },
                { href: "/about",  label: "Tentang Jurnal" },
                { href: "/about#scope",   label: "Ruang Lingkup" },
                { href: "/about#editors", label: "Tim Editor" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ocean-400 hover:text-gold-400 transition-colors duration-200
                               flex items-center gap-2 group"
                  >
                    <span className="w-3 h-px bg-ocean-700 group-hover:bg-gold-400 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === KOLOM 3: KONTAK === */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-widest">
              Kontak Editorial
            </h4>
            <div className="space-y-2 text-sm text-ocean-400">
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-ocean-500" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                editor@conservejournal.ac.id
              </p>
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-ocean-500" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  Lembaga Penelitian dan Pengabdian Masyarakat<br />
                  Universitas Bahari Nusantara<br />
                  Indonesia
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* === GARIS BAWAH & COPYRIGHT === */}
        <div className="mt-10 pt-6 border-t border-ocean-800 flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <p className="text-xs text-ocean-600">
            © {currentYear} CONSERVE Journal of Community Services. Seluruh hak dilindungi.
          </p>
          <p className="text-xs text-ocean-600">
            Dipublikasikan di bawah lisensi{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean-500 hover:text-gold-400 transition-colors"
            >
              CC BY 4.0
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
