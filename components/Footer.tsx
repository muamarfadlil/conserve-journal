import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden transition-colors duration-200
                       bg-[var(--bg-surface-alt)] dark:bg-gradient-to-b dark:from-ocean-950 dark:to-[#071a18]">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--border-default)]
                      dark:bg-gradient-to-r dark:from-transparent dark:via-ocean-600/50 dark:to-transparent" />

      {/* Ambient glow (dark only) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32
                      bg-ocean-700/8 blur-3xl pointer-events-none dark:opacity-100 opacity-0
                      transition-opacity duration-200" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Kolom 1: Identitas */}
          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-bold text-[var(--text-primary)] text-xl tracking-wide">
                CONSERVE
              </h3>
              <p className="text-[var(--text-muted)] text-[11px] font-mono tracking-widest uppercase mt-0.5">
                Journal of Community Services
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)] max-w-xs">
              Jurnal ilmiah yang didedikasikan untuk mempublikasikan hasil pengabdian
              kepada masyarakat dengan fokus pada pelestarian lingkungan dan pemberdayaan komunitas pesisir.
            </p>
            {/* ISSN badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                            cursor-default transition-colors duration-200
                            bg-[var(--bg-surface)] border border-[var(--border-default)]
                            text-[var(--text-secondary)] hover:border-ocean-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full
                                 bg-gold-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
              </span>
              <span>E-ISSN: 0000-0000</span>
              <span className="text-[var(--text-faint)]">·</span>
              <span>P-ISSN: 0000-0001</span>
            </div>
          </div>

          {/* Kolom 2: Navigasi */}
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] text-xs font-mono uppercase tracking-widest
                           flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-ocean-500 to-transparent" />
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/",              label: "Beranda" },
                { href: "/about",         label: "Tentang Jurnal" },
                { href: "/about#scope",   label: "Ruang Lingkup" },
                { href: "/about#editors", label: "Tim Editor" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2.5 text-sm
                               text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                               transition-colors duration-200"
                  >
                    <svg className="w-3.5 h-3.5 text-[var(--text-faint)] group-hover:text-ocean-500
                                    transition-colors duration-200 flex-shrink-0"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] text-xs font-mono uppercase tracking-widest
                           flex items-center gap-2">
              <span className="w-4 h-px bg-gradient-to-r from-ocean-500 to-transparent" />
              Kontak Editorial
            </h4>
            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
              <a
                href="mailto:editor@conservejournal.ac.id"
                className="group flex items-start gap-2.5 hover:text-[var(--text-primary)] transition-colors"
              >
                <div className="mt-0.5 p-1.5 rounded-md flex-shrink-0 transition-colors
                                bg-[var(--bg-surface)] border border-[var(--border-default)]
                                group-hover:border-ocean-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="leading-relaxed">editor@conservejournal.ac.id</span>
              </a>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1.5 rounded-md flex-shrink-0
                                bg-[var(--bg-surface)] border border-[var(--border-default)]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="leading-relaxed text-xs">
                  Lembaga Penelitian dan Pengabdian Masyarakat<br />
                  Universitas Bahari Nusantara<br />
                  Indonesia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border-default)] mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            © {year} CONSERVE Journal of Community Services. Seluruh hak dilindungi.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Dipublikasikan di bawah lisensi{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean-500 hover:text-gold-500 transition-colors underline-offset-2 hover:underline"
            >
              CC BY 4.0
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
