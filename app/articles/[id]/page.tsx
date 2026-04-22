import { getArticleById, getAllArticleIds, formatDate } from "@/lib/articles";
import ArticleActions from "@/components/ArticleActions";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ArticlePageProps { params: { id: string } }

export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  try { return (await getAllArticleIds()).map(id => ({ id })) } catch { return [] }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleById(Number(params.id))
  if (!article) return { title: "Artikel Tidak Ditemukan" }
  return {
    title: article.title,
    description: article.abstract.slice(0, 160) + "...",
    openGraph: { title: article.title, description: article.abstract.slice(0, 160) },
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const article = await getArticleById(Number(params.id))
  if (!article) notFound()

  return (
    <div className="min-h-screen py-10 bg-[var(--bg-base)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/"
          className="inline-flex items-center gap-2 text-sm mb-8 group
                     text-[var(--text-muted)] hover:text-gold-500 dark:hover:text-gold-400
                     transition-colors duration-200">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Beranda
        </Link>

        <div className="rounded-2xl overflow-hidden shadow-xl
                        bg-[var(--bg-surface)] border border-[var(--border-default)]
                        dark:bg-ocean-900 dark:border-ocean-800
                        dark:shadow-ocean-950/50">

          {/* Header band */}
          <div className="px-8 py-5 border-b border-[var(--border-default)] dark:border-ocean-700
                          bg-[var(--bg-surface-alt)] dark:bg-gradient-to-r dark:from-ocean-800 dark:to-ocean-900">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono text-[var(--text-muted)] dark:text-ocean-400
                               bg-[var(--bg-surface)] dark:bg-ocean-950/50
                               px-3 py-1 rounded-full border border-[var(--border-default)] dark:border-ocean-700">
                Vol. {article!.volume.number} · No. {article!.volume.issue}
              </span>
              {article!.category && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full
                                 text-ocean-600 dark:text-ocean-300
                                 bg-ocean-100 dark:bg-ocean-800
                                 border border-ocean-300 dark:border-ocean-600">
                  {article!.category}
                </span>
              )}
              <span className="text-xs text-[var(--text-muted)]">Hlm. {article!.pages}</span>
            </div>
          </div>

          <div className="px-6 sm:px-10 py-8 space-y-8">

            <h1 className="font-serif font-bold text-[var(--text-primary)] text-2xl sm:text-3xl leading-snug">
              {article!.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 border
                              bg-[var(--bg-surface-alt)] border-[var(--border-default)]
                              dark:bg-ocean-950/50 dark:border-ocean-800">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Penulis</p>
                <ul className="space-y-1.5">
                  {article!.authors.map((author) => (
                    <li key={author.id} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                      <span>{author.name}</span>
                      {author.affiliation && (
                        <span className="text-[var(--text-muted)] text-xs">— {author.affiliation}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-4 border
                              bg-[var(--bg-surface-alt)] border-[var(--border-default)]
                              dark:bg-ocean-950/50 dark:border-ocean-800">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  Informasi Publikasi
                </p>
                <dl className="space-y-2 text-sm">
                  {[
                    { term: "Terbit", def: formatDate(article!.publishedAt) },
                    { term: "Halaman", def: article!.pages ?? '-' },
                    { term: "Jurnal", def: "CONSERVE Journal" },
                  ].map(({ term, def }) => (
                    <div key={term} className="flex justify-between gap-2">
                      <dt className="text-[var(--text-muted)]">{term}</dt>
                      <dd className="text-[var(--text-primary)] font-medium text-right">{def}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {article!.doi && (
              <div className="rounded-xl p-4 border
                              bg-[var(--bg-surface-alt)] border-[var(--border-default)]
                              dark:bg-ocean-950/50 dark:border-ocean-800">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                  Digital Object Identifier (DOI)
                </p>
                <code className="text-sm font-mono text-gold-600 dark:text-gold-400 break-all">
                  {article!.doi}
                </code>
              </div>
            )}

            <div className="h-px bg-[var(--border-default)] dark:bg-gradient-to-r dark:from-ocean-700 dark:via-ocean-600 dark:to-transparent" />

            <div>
              <h2 className="font-serif font-semibold text-[var(--text-primary)] text-xl mb-4">Abstrak</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] text-justify">
                {article!.abstract}
              </p>
            </div>

            {article!.keywords && article!.keywords.length > 0 && (
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-3">Kata Kunci</p>
                <div className="flex flex-wrap gap-2">
                  {article!.keywords.map((keyword) => (
                    <span key={keyword}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full
                                 bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                 text-[var(--text-secondary)]
                                 hover:border-ocean-400 hover:text-[var(--text-primary)]
                                 transition-all duration-200">
                      <span className="text-[var(--text-muted)]">#</span>{keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-[var(--border-default)] dark:bg-gradient-to-r dark:from-ocean-700 dark:via-ocean-600 dark:to-transparent" />

            <ArticleActions article={article!} />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/"
            className="inline-flex items-center gap-2 text-sm
                       text-[var(--text-muted)] hover:text-gold-500 dark:hover:text-gold-400
                       transition-colors duration-200">
            ← Kembali ke Daftar Artikel
          </Link>
        </div>
      </div>
    </div>
  )
}
