// ============================================================
// components/ArticleCard.tsx
// Kartu artikel yang ditampilkan di beranda dalam daftar edisi.
// Setiap kartu menampilkan judul (bisa diklik), penulis,
// halaman, dan kategori artikel.
// ============================================================

import Link from "next/link";
import type { Article } from "@/lib/articles";

// Peta warna untuk badge kategori — masing-masing kategori punya warna berbeda
// sehingga pengguna bisa dengan cepat mengenali topik artikel
const categoryColors: Record<string, string> = {
  "Konservasi Pesisir":  "bg-ocean-900 text-ocean-300 border-ocean-700",
  "Lingkungan Hidup":    "bg-emerald-950 text-emerald-400 border-emerald-800",
  "Kesehatan Masyarakat":"bg-blue-950 text-blue-400 border-blue-800",
  "Ekonomi Kreatif":     "bg-amber-950 text-amber-400 border-amber-800",
  "Pendidikan & Pelatihan":"bg-purple-950 text-purple-400 border-purple-800",
  "Konservasi Hayati":   "bg-teal-950 text-teal-400 border-teal-800",
};

// Warna default jika kategori tidak ada di peta di atas
const defaultCategoryColor = "bg-ocean-900 text-ocean-300 border-ocean-700";

// Props yang diterima komponen ini dari halaman induk
interface ArticleCardProps {
  article: Article;
  index: number; // Nomor urut artikel dalam edisi (untuk animasi bertahap)
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  const categoryStyle = categoryColors[article.category] ?? defaultCategoryColor;

  return (
    <article
      className="group relative bg-ocean-950 border border-ocean-800 rounded-xl overflow-hidden
                 hover:border-ocean-600 transition-all duration-300 hover:shadow-lg
                 hover:shadow-ocean-900/50 animate-fade-up"
      // Animasi masuk bertahap — setiap kartu muncul sedikit lebih lambat dari sebelumnya
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Garis aksen warna di sisi kiri kartu — sentuhan desain editorial */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-ocean-500 to-ocean-700
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6">
        {/* === BARIS ATAS: Nomor artikel & kategori === */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-ocean-600">
            Hlm. {article.pages}
          </span>
          <span className={`
            text-[11px] font-semibold px-2.5 py-0.5 rounded-full border
            ${categoryStyle}
          `}>
            {article.category}
          </span>
        </div>

        {/* === JUDUL ARTIKEL (bisa diklik) === */}
        <Link href={`/articles/${article.id}`}>
          <h3 className="font-serif font-semibold text-white text-base leading-snug
                         group-hover:text-gold-400 transition-colors duration-200
                         line-clamp-3 mb-3">
            {article.title}
          </h3>
        </Link>

        {/* === ABSTRAK (dipotong 2 baris) === */}
        <p className="text-sm text-ocean-400 leading-relaxed line-clamp-2 mb-4">
          {article.abstract}
        </p>

        {/* === PENULIS === */}
        <div className="flex items-center gap-2">
          {/* Ikon orang */}
          <svg className="w-4 h-4 text-ocean-600 shrink-0" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xs text-ocean-500">
            {/* Jika penulis lebih dari 2, tampilkan 2 pertama + "et al." */}
            {article.authors.length > 2
              ? `${article.authors.slice(0, 2).join(", ")}, et al.`
              : article.authors.join(", ")}
          </span>
        </div>

        {/* === TAUTAN "BACA SELENGKAPNYA" === */}
        <div className="mt-4 pt-4 border-t border-ocean-800 flex items-center justify-between">
          <Link
            href={`/articles/${article.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-ocean-400
                       hover:text-gold-400 transition-colors duration-200 font-medium"
          >
            Baca Selengkapnya
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Indikator DOI */}
          <span className="text-[10px] font-mono text-ocean-700" title={article.doi}>
            DOI
          </span>
        </div>
      </div>
    </article>
  );
}
