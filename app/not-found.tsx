// ============================================================
// app/not-found.tsx
// Halaman 404 kustom — tampil ketika URL tidak ditemukan.
// Next.js App Router secara otomatis menggunakan file ini.
// ============================================================

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Halaman Tidak Ditemukan",
};

export default function NotFoundPage() {
  return (
    <div className="bg-ocean-950 min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 animate-fade-up">

        {/* Angka 404 besar sebagai elemen visual */}
        <div className="font-serif font-bold text-[120px] sm:text-[160px] leading-none
                        bg-gradient-to-b from-ocean-700 to-ocean-950 bg-clip-text text-transparent
                        select-none">
          404
        </div>

        <div className="space-y-2">
          <h1 className="font-serif font-semibold text-white text-2xl">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-ocean-400 text-sm max-w-md mx-auto">
            Sepertinya halaman yang Anda cari telah menyelam terlalu dalam —
            kami tidak berhasil menemukannya. Mungkin URL-nya salah atau artikel sudah dipindahkan.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-ocean-800 hover:bg-ocean-700 border border-ocean-700
                     text-white text-sm font-medium transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
