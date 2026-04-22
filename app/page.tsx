import { getLatestIssue } from "@/lib/articles";
import JournalCover from "@/components/JournalCover";
import ArticleCard from "@/components/ArticleCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda",
  description: "CONSERVE Journal of Community Services — Publikasi ilmiah untuk pengabdian masyarakat dan konservasi lingkungan hidup Indonesia.",
};

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const latestIssue = await getLatestIssue().catch(() => null);

  if (!latestIssue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <p className="text-[var(--text-muted)]">Belum ada artikel yang dipublikasikan.</p>
      </div>
    );
  }

  return (
    <>
      <JournalCover issue={latestIssue} />

      {/* Section: Daftar Artikel */}
      <section className="relative py-16 bg-[var(--bg-base)]
                          dark:bg-gradient-to-b dark:from-ocean-950 dark:via-ocean-950 dark:to-ocean-900/80">
        {/* Subtle radial glow di tengah atas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-40
                        bg-ocean-700/10 blur-[80px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header seksi */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-ocean-400 to-ocean-600" />
                  <p className="text-xs font-mono text-ocean-500 uppercase tracking-widest">
                    Edisi Volume {latestIssue.volume} · Nomor {latestIssue.issue}
                  </p>
                </div>
                <h2 className="font-serif font-bold text-[var(--text-primary)] text-3xl">Daftar Artikel</h2>
                <p className="text-[var(--text-secondary)] mt-1.5 text-sm">
                  {latestIssue.month} {latestIssue.year} ·{" "}
                  <span className="text-gold-400 font-medium">{latestIssue.articles.length} artikel</span>
                </p>
              </div>
              <a
                href="#issue-pdf"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                           bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-alt)]
                           border border-[var(--border-default)] hover:border-ocean-400
                           dark:bg-ocean-800/80 dark:hover:bg-ocean-700/80 dark:border-ocean-700 dark:hover:border-ocean-500
                           text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                           dark:text-ocean-300 dark:hover:text-white
                           transition-all duration-200 self-start sm:self-auto"
              >
                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh Edisi Lengkap (PDF)
              </a>
            </div>
            <div className="mt-6 h-px bg-gradient-to-r from-ocean-600 via-ocean-700 to-transparent" />
          </div>

          {/* Grid artikel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestIssue.articles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Section: ISSN & Info */}
      <section className="relative overflow-hidden border-y
                          border-[var(--border-default)]
                          bg-[var(--bg-surface-alt)]
                          dark:bg-gradient-to-br dark:from-ocean-900 dark:via-ocean-800 dark:to-ocean-900">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24
                          bg-ocean-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {[
              { key: "P-ISSN", value: "0000-0001" },
              { key: "E-ISSN", value: "0000-0000" },
              { key: "Frekuensi", value: "2× setahun" },
            ].map(({ key, value }, i) => (
              <div
                key={key}
                className={`flex flex-col items-center gap-1 py-6 cursor-default
                            group transition-all duration-200 hover:bg-[var(--bg-surface)]
                            ${i > 0 ? "border-t sm:border-t-0 sm:border-l border-[var(--border-default)]" : ""}`}
              >
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest
                              group-hover:text-ocean-500 transition-colors duration-200">
                  {key}
                </p>
                <p className="font-semibold text-[var(--text-primary)] text-xl
                              group-hover:text-gold-500 dark:group-hover:text-gold-400
                              transition-colors duration-200">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
