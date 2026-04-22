import Link from "next/link";
import type { Article } from "@/lib/articles";

const categoryColors: Record<string, string> = {
  "Konservasi Pesisir":     "bg-ocean-100 text-ocean-700 border-ocean-300 dark:bg-ocean-900 dark:text-ocean-300 dark:border-ocean-700",
  "Lingkungan Hidup":       "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  "Kesehatan Masyarakat":   "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
  "Ekonomi Kreatif":        "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  "Pendidikan & Pelatihan": "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800",
  "Konservasi Hayati":      "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800",
};

const defaultCategoryColor = "bg-ocean-100 text-ocean-700 border-ocean-300 dark:bg-ocean-900 dark:text-ocean-300 dark:border-ocean-700";

interface ArticleCardProps {
  article: Article;
  index: number;
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  const categoryStyle = categoryColors[article.category ?? ''] ?? defaultCategoryColor;
  const authorNames = article.authors.map(a => a.name);

  return (
    <article
      className="group relative rounded-xl overflow-hidden transition-all duration-300
                 hover:-translate-y-1 hover:shadow-xl animate-fade-up
                 bg-[var(--bg-surface)] border border-[var(--border-default)]
                 hover:border-ocean-400 dark:hover:border-ocean-600
                 dark:hover:shadow-ocean-950/60"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Top gradient glow on hover */}
      <div className="absolute inset-x-0 top-0 h-px
                      bg-gradient-to-r from-transparent via-ocean-500 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Article number badge */}
      <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center
                      bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                      group-hover:border-ocean-400 transition-colors duration-200">
        <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-ocean-500 transition-colors">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3 pr-8">
          <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
            Hlm. {article.pages}
          </span>
          {article.category && (
            <>
              <span className="text-[var(--border-default)]">·</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border truncate ${categoryStyle}`}>
                {article.category}
              </span>
            </>
          )}
        </div>

        <Link href={`/articles/${article.id}`}>
          <h3 className="font-serif font-semibold text-[var(--text-primary)] text-base leading-snug
                         group-hover:text-gold-500 dark:group-hover:text-gold-400
                         transition-colors duration-200 line-clamp-3 mb-3">
            {article.title}
          </h3>
        </Link>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-4">
          {article.abstract}
        </p>

        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs text-[var(--text-secondary)] line-clamp-1">
            {authorNames.length > 2
              ? `${authorNames.slice(0, 2).join(", ")}, et al.`
              : authorNames.join(", ")}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border-default)] group-hover:border-ocean-300
                        dark:group-hover:border-ocean-700 flex items-center justify-between
                        transition-colors duration-200">
          <Link
            href={`/articles/${article.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium
                       text-ocean-600 dark:text-ocean-400
                       group-hover:text-gold-500 dark:group-hover:text-gold-400
                       transition-colors duration-200"
          >
            Baca Selengkapnya
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          {article.doi && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors duration-200
                             text-[var(--text-muted)] bg-[var(--bg-surface-alt)]
                             border border-[var(--border-default)] group-hover:border-ocean-400"
                  title={article.doi}>
              DOI
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
