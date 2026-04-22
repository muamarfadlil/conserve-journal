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
      <div className="bg-ocean-950 min-h-screen flex items-center justify-center">
        <p className="text-ocean-400">Belum ada artikel yang dipublikasikan.</p>
      </div>
    );
  }

  return (
    <>
      <JournalCover issue={latestIssue} />

      <section className="bg-ocean-950 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-ocean-500 uppercase tracking-widest mb-1">
                  Edisi Volume {latestIssue.volume} · Nomor {latestIssue.issue}
                </p>
                <h2 className="font-serif font-bold text-white text-3xl">Daftar Artikel</h2>
                <p className="text-ocean-400 mt-1.5 text-sm">
                  {latestIssue.month} {latestIssue.year} ·{" "}
                  <span className="text-gold-400">{latestIssue.articles.length} artikel</span>
                </p>
              </div>
              <a
                href="#issue-pdf"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 border border-ocean-700 text-sm text-ocean-300 hover:text-white transition-all duration-200 self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh Edisi Lengkap (PDF)
              </a>
            </div>
            <div className="mt-6 h-px bg-gradient-to-r from-ocean-700 via-ocean-600 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestIssue.articles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-ocean-900 to-ocean-800 border-y border-ocean-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-ocean-700/50">
            {[
              { value: "P-ISSN", label: "0000-0001" },
              { value: "E-ISSN", label: "0000-0000" },
              { value: "Frekuensi", label: "2 kali setahun" },
            ].map(({ value, label }) => (
              <div key={value} className="flex flex-col items-center gap-1 text-ocean-300 py-4 sm:py-0">
                <p className="text-[10px] text-ocean-500 uppercase tracking-widest font-mono">{value}</p>
                <p className="font-semibold text-white text-lg">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}