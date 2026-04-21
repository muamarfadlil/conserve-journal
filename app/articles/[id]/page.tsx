// ============================================================
// app/articles/[id]/page.tsx — Server Component
// Semua onClick dipindah ke ArticleActions (Client Component)
// ============================================================

import { getArticleById, getAllArticleIds, formatDate } from "@/lib/articles";
import ArticleActions from "@/components/ArticleActions";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  return getAllArticleIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = getArticleById(params.id);
  if (!article) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: article.title,
    description: article.abstract.slice(0, 160) + "...",
    openGraph: { title: article.title, description: article.abstract.slice(0, 160) },
  };
}

export default function ArticleDetailPage({ params }: ArticlePageProps) {
  const article = getArticleById(params.id);
  if (!article) notFound();

  return (
    <div className="bg-ocean-950 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/"
          className="inline-flex items-center gap-2 text-sm text-ocean-400 hover:text-gold-400
                     transition-colors duration-200 mb-8 group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Beranda
        </Link>

        <div className="bg-ocean-900 border border-ocean-800 rounded-2xl overflow-hidden shadow-xl shadow-ocean-950/50">

          {/* Header kartu */}
          <div className="bg-gradient-to-r from-ocean-800 to-ocean-900 px-8 py-5 border-b border-ocean-700">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono text-ocean-400 bg-ocean-950/50 px-3 py-1 rounded-full border border-ocean-700">
                Vol. {article!.volume} · No. {article!.number}
              </span>
              <span className="text-xs font-semibold text-ocean-300 bg-ocean-800 px-3 py-1 rounded-full border border-ocean-600">
                {article!.category}
              </span>
              <span className="text-xs text-ocean-500">Hlm. {article!.pages}</span>
            </div>
          </div>

          <div className="px-6 sm:px-10 py-8 space-y-8">

            {/* JUDUL */}
            <h1 className="font-serif font-bold text-white text-2xl sm:text-3xl leading-snug">
              {article!.title}
            </h1>

            {/* GRID METADATA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-ocean-950/50 rounded-xl p-4 border border-ocean-800">
                <p className="text-[10px] text-ocean-500 uppercase tracking-widest mb-2">Penulis</p>
                <ul className="space-y-1.5">
                  {article!.authors.map((author) => (
                    <li key={author} className="flex items-center gap-2 text-sm text-ocean-200">
                      <svg className="w-3.5 h-3.5 text-ocean-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                      {author}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-ocean-950/50 rounded-xl p-4 border border-ocean-800">
                <p className="text-[10px] text-ocean-500 uppercase tracking-widest mb-2">Informasi Publikasi</p>
                <dl className="space-y-2 text-sm">
                  {[
                    { term: "Terbit", def: formatDate(article!.publishedDate) },
                    { term: "Halaman", def: article!.pages },
                    { term: "Jurnal", def: "CONSERVE Journal" },
                  ].map(({ term, def }) => (
                    <div key={term} className="flex justify-between gap-2">
                      <dt className="text-ocean-500">{term}</dt>
                      <dd className="text-ocean-200 font-medium text-right">{def}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* DOI */}
            <div className="bg-ocean-950/50 rounded-xl p-4 border border-ocean-800">
              <p className="text-[10px] text-ocean-500 uppercase tracking-widest mb-1.5">
                Digital Object Identifier (DOI)
              </p>
              <code className="text-sm font-mono text-gold-400 break-all">{article!.doi}</code>
            </div>

            <div className="h-px bg-gradient-to-r from-ocean-700 via-ocean-600 to-transparent" />

            {/* ABSTRAK */}
            <div>
              <h2 className="font-serif font-semibold text-white text-xl mb-4">Abstrak</h2>
              <p className="text-ocean-300 leading-relaxed text-[15px] text-justify">
                {article!.abstract}
              </p>
            </div>

            {/* KATA KUNCI */}
            <div>
              <p className="text-[10px] text-ocean-500 uppercase tracking-widest mb-3">Kata Kunci</p>
              <div className="flex flex-wrap gap-2">
                {article!.keywords.map((keyword) => (
                  <span key={keyword}
                    className="px-3 py-1 text-xs rounded-full bg-ocean-800 border border-ocean-700
                               text-ocean-300 hover:border-ocean-500 transition-colors">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-ocean-700 via-ocean-600 to-transparent" />

            {/* TOMBOL AKSI — Client Component */}
            <ArticleActions article={article!} />

          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/"
            className="inline-flex items-center gap-2 text-sm text-ocean-400 hover:text-gold-400 transition-colors duration-200">
            ← Kembali ke Daftar Artikel
          </Link>
        </div>

      </div>
    </div>
  );
}
