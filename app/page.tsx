// ============================================================
// app/page.tsx
// Halaman Beranda — halaman pertama yang dikunjungi pengguna.
// Menampilkan sampul edisi terkini dan daftar semua artikel.
// ============================================================

// Komponen ini adalah Server Component (default di App Router),
// artinya ia dirender di server sehingga aman mengakses data langsung.
import { getLatestIssue, formatDate } from "@/lib/articles";
import JournalCover from "@/components/JournalCover";
import ArticleCard from "@/components/ArticleCard";
import type { Metadata } from "next";

// Metadata khusus untuk halaman beranda
export const metadata: Metadata = {
  title: "Beranda",
  description:
    "CONSERVE Journal of Community Services — Publikasi ilmiah untuk pengabdian " +
    "masyarakat dan konservasi lingkungan hidup Indonesia.",
};

export default function HomePage() {
  // Ambil data edisi terkini langsung dari file data (di server)
  // Ini adalah pendekatan statik — tidak memerlukan API call
  const latestIssue = getLatestIssue();

  return (
    <>
      {/* ===== SEKSI 1: SAMPUL JURNAL (HERO) ===== */}
      <JournalCover issue={latestIssue} />

      {/* ===== SEKSI 2: DAFTAR ARTIKEL ===== */}
      <section className="bg-ocean-950 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Judul seksi dengan metadata edisi */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                {/* Label kecil di atas judul */}
                <p className="text-xs font-mono text-ocean-500 uppercase tracking-widest mb-1">
                  Edisi Volume {latestIssue.volume} · Nomor {latestIssue.number}
                </p>
                <h2 className="font-serif font-bold text-white text-3xl">
                  Daftar Artikel
                </h2>
                <p className="text-ocean-400 mt-1.5 text-sm">
                  Diterbitkan pada {formatDate(latestIssue.publishedDate)} ·{" "}
                  <span className="text-gold-400">{latestIssue.articles.length} artikel</span>
                </p>
              </div>

              {/* Tombol unduh seluruh edisi (simulasi) */}
              <a
                href="#issue-pdf"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                           bg-ocean-800 hover:bg-ocean-700 border border-ocean-700
                           text-sm text-ocean-300 hover:text-white transition-all duration-200
                           self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh Edisi Lengkap (PDF)
              </a>
            </div>

            {/* Garis pemisah gradien */}
            <div className="mt-6 h-px bg-gradient-to-r from-ocean-700 via-ocean-600 to-transparent" />
          </div>

          {/* === GRID ARTIKEL ===
              Responsive: 1 kolom di mobile, 2 kolom di tablet, 3 kolom di desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestIssue.articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ===== SEKSI 3: BANNER INFORMASI ===== */}
      <section className="bg-gradient-to-r from-ocean-900 to-ocean-800 border-y border-ocean-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                value: "P-ISSN",
                label: "0000-0001",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                ),
                value: "E-ISSN",
                label: "0000-0000",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                value: "Frekuensi",
                label: "2 kali setahun",
              },
            ].map(({ icon, value, label }) => (
              <div key={value} className="flex flex-col items-center gap-3 text-ocean-300">
                <div className="text-ocean-500">{icon}</div>
                <div>
                  <p className="text-xs text-ocean-500 uppercase tracking-widest">{value}</p>
                  <p className="font-semibold text-white mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
