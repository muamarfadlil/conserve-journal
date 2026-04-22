// components/ArticleCard.tsx
import Link from "next/link";
import type { Article } from "@/lib/articles";

const categoryColors: Record<string, string> = {
  "Konservasi Pesisir":    "bg-ocean-900 text-ocean-300 border-ocean-700",
  "Lingkungan Hidup":      "bg-emerald-950 text-emerald-400 border-emerald-800",
  "Kesehatan Masyarakat":  "bg-blue-950 text-blue-400 border-blue-800",
  "Ekonomi Kreatif":       "bg-amber-950 text-amber-400 border-amber-800",
  "Pendidikan & Pelatihan":"bg-purple-950 text-purple-400 border-purple-800",
  "Konservasi Hayati":     "bg-teal-950 text-teal-400 border-teal-800",
};

const defaultCategoryColor = "bg-ocean-900 text-ocean-300 border-ocean-700";

interface ArticleCardProps {
  article: Article;
  index: number;
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  // category sekarang bisa null, jadi kita sediakan fallback string kosong
  const categoryStyle = categoryColors[article.category ?? ''] ?? defaultCategoryColor;

  // Ekstrak nama penulis dari array objek Author
  // Sebelumnya: article.authors adalah string[]
  // Sekarang:   article.authors adalah { id, name, affiliation, email }[]
  const authorNames = article.authors.map(a => a.name)

  return (
    <article
      className="group relative bg-ocean-950 border border-ocean-800 rounded-xl overflow-hidden
                 hover:border-ocean-600 transition-all duration-300 hover:shadow-lg
                 hover:shadow-ocean-900/50 animate-fade-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-ocean-500 to-ocean-700
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-ocean-600">
            Hlm. {article.pages}
          </span>
          {/* Hanya tampilkan badge kategori jika kategori ada */}
          {article.category && (
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${categoryStyle}`}>
              {article.category}
            </span>
          )}
        </div>

        <Link href={`/articles/${article.id}`}>
          <h3 className="font-serif font-semibold text-white text-base leading-snug
                         group-hover:text-gold-400 transition-colors duration-200
                         line-clamp-3 mb-3">
            {article.title}
          </h3>
        </Link>

        <p className="text-sm text-ocean-400 leading-relaxed line-clamp-2 mb-4">
          {article.abstract}
        </p>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-ocean-600 shrink-0" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xs text-ocean-500">
            {/* Gunakan authorNames (string[]) hasil ekstraksi di atas */}
            {authorNames.length > 2
              ? `${authorNames.slice(0, 2).join(", ")}, et al.`
              : authorNames.join(", ")}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-ocean-800 flex items-center justify-between">
          <Link
            href={`/articles/${article.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-ocean-400
                       group-hover:text-gold-400 transition-colors duration-200 font-medium"
          >
            Baca Selengkapnya
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          {article.doi && (
            <span className="text-[10px] font-mono text-ocean-600 bg-ocean-900 border border-ocean-800 px-1.5 py-0.5 rounded" title={article.doi}>
              DOI
            </span>
          )}
        </div>
      </div>
    </article>
  )
}