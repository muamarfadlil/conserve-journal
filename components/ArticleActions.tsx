"use client";

import type { Article } from "@/lib/articles";
import { useToast } from "@/components/ui/Toast";

interface ArticleActionsProps {
  article: Article;
}

export default function ArticleActions({ article }: ArticleActionsProps) {
  const { showToast } = useToast();

  const handleCopyCitation = () => {
    const authorNames = article.authors.map(a => a.name);
    const year = article.publishedAt
      ? new Date(article.publishedAt).getFullYear()
      : new Date().getFullYear();

    const citation =
      `${authorNames.join(", ")} (${year}). ` +
      `${article.title}. ` +
      `CONSERVE Journal of Community Services, ` +
      `${article.volume.number}(${article.volume.issue}), ` +
      `${article.pages ?? "-"}. https://doi.org/${article.doi ?? ""}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(citation).then(() => {
        showToast("Kutipan APA berhasil disalin ke clipboard!", "success");
      });
    } else {
      showToast("Browser Anda tidak mendukung salin otomatis.", "error");
    }
  };

  const handleCopyDOI = () => {
    if (!article.doi) {
      showToast("Artikel ini belum memiliki DOI.", "info");
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(article.doi).then(() => {
        showToast("DOI berhasil disalin!", "success");
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {article.pdfUrl ? (
          <a
            href={article.pdfUrl}
            download
            className="flex-1 flex items-center justify-center gap-3 py-3 px-6 bg-gold-500 hover:bg-gold-400 text-ocean-950 font-semibold text-sm rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-gold-500/25"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586 a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Unduh PDF Artikel
          </a>
        ) : (
          <span className="flex-1 flex items-center justify-center py-3 px-6 bg-ocean-800 text-ocean-500 text-sm rounded-xl cursor-not-allowed">
            PDF Belum Tersedia
          </span>
        )}

        <button
          onClick={handleCopyCitation}
          className="flex items-center justify-center gap-2 py-3 px-5 bg-ocean-800 hover:bg-ocean-700 border border-ocean-700 text-ocean-300 hover:text-white text-sm rounded-xl transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8 a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Salin Kutipan (APA)
        </button>
      </div>

      {article.doi && (
        <button
          onClick={handleCopyDOI}
          className="inline-flex items-center gap-2 text-xs text-ocean-500 hover:text-gold-400 transition-colors duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8 a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Salin DOI
        </button>
      )}

      <p className="text-[11px] text-ocean-600 text-center pt-1">
        * Tautan unduhan PDF ini bersifat simulasi untuk keperluan demonstrasi.
      </p>
    </div>
  );
}