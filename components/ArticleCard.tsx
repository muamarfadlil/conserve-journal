// components/ArticleCard.tsx
import Link from "next/link";
import type { Article } from "@/lib/articles";

const categoryColors: Record<string, string> = {
  "Konservasi Pesisir":     "bg-ocean-900 text-ocean-300 border-ocean-700",
  "Lingkungan Hidup":       "bg-emerald-950 text-emerald-400 border-emerald-800",
  "Kesehatan Masyarakat":   "bg-blue-950 text-blue-400 border-blue-800",
  "Ekonomi Kreatif":        "bg-amber-950 text-amber-400 border-amber-800",
  "Pendidikan & Pelatihan": "bg-purple-950 text-purple-400 border-purple-800",
  "Konservasi Hayati":      "bg-teal-950 text-teal-400 border-teal-800",
};

const defaultCategoryColor = "bg-ocean-900 text-ocean-300 border-ocean-700";

interface ArticleCardProps {
  article: Article;
  index: number;
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  const categoryStyle = categoryColors[article.category ?? ''] ?? defaultCategoryColor;
  const authorNames = article.authors.map(a => a.name)

  return (
    <article
      className="group relative bg-ocean-950 border border-ocean-800/80 rounded-xl overflow-hidden
                 hover:border-ocean-600/80 hover:bg-gradient-to-b hover:from-ocean-900 hover:to-ocean-950
                 transition-all duration-300 hover:shadow-xl hover:shadow-ocean-950/60
                 hover:-translate-y-1 animate-fade-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Top gradient glow on hover */}
      <div className="absolute inset-x-0 top-0 h-px
                      bg-gradient-to-r from-transparent via-ocean-500 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Nomor urut artikel */}
      <div className="absolute top-4 right-4 w-6 h-6 rounded-full
                      bg-ocean-900 border border-ocean-800 group-hover:border-ocean-700
                      flex items-center justify-center transition-colors duration-200">
        <span className="text-[10px] font-mono text-ocean-600 group-hover:text-ocean-400 transition-colors">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3 pr-8">
          <span className="text-xs font-mono text-ocean-600 shrink-0">
            Hlm. {article.pages}
          </span>
          {article.category && (
            <>
              <span className="text-ocean-800">·</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border truncate ${categoryStyle}`}>
                {article.category}
              </span>
            </>
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
          <svg className="w-3.5 h-3.5 text-ocean-600 shrink-0" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs text-ocean-500 line-clamp-1">
            {authorNames.length > 2
              ? `${authorNames.slice(0, 2).join(", ")}, et al.`
              : authorNames.join(", ")}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-ocean-800/60 group-hover:border-ocean-700/60
                        flex items-center justify-between transition-colors duration-200">
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
            <span className="text-[10px] font-mono text-ocean-600 bg-ocean-900 border border-ocean-800
                             group-hover:border-ocean-700 px-1.5 py-0.5 rounded transition-colors duration-200"
                  title={article.doi}>
              DOI
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
