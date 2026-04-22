import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 — Halaman Tidak Ditemukan",
}

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4
                    bg-[var(--bg-base)]">
      <div className="text-center space-y-6 animate-fade-up">

        <div className="font-serif font-bold text-[120px] sm:text-[160px] leading-none select-none
                        bg-gradient-to-b from-ocean-600 to-ocean-900
                        dark:from-ocean-700 dark:to-ocean-950
                        bg-clip-text text-transparent">
          404
        </div>

        <div className="space-y-2">
          <h1 className="font-serif font-semibold text-[var(--text-primary)] text-2xl">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
            Sepertinya halaman yang Anda cari telah menyelam terlalu dalam —
            kami tidak berhasil menemukannya. Mungkin URL-nya salah atau artikel sudah dipindahkan.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium
                     bg-[var(--bg-surface)] border border-[var(--border-default)]
                     text-[var(--text-primary)] hover:border-ocean-400
                     transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
