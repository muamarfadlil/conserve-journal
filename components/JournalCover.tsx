// components/JournalCover.tsx
import type { LatestIssue } from "@/lib/articles";

interface JournalCoverProps {
  issue: LatestIssue;
}

export default function JournalCover({ issue }: JournalCoverProps) {
  // Gabungkan bulan dan tahun dari data volume
  // Contoh output: "Februari 2024"
  const formattedDate = `${issue.month ?? ''} ${issue.year}`.trim()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800">

      {/* === ORNAMEN LATAR BELAKANG (dekoratif) === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full
                        bg-ocean-700/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full
                        bg-ocean-600/15 blur-3xl" />
        <div className="absolute inset-0"
             style={{
               backgroundImage: `radial-gradient(circle, rgba(20,184,166,0.06) 1px, transparent 1px)`,
               backgroundSize: "32px 32px",
             }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

          {/* === KOLOM KIRI === */}
          <div className="lg:col-span-3 space-y-6 animate-fade-up">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ocean-800/60
                            border border-ocean-700 rounded-full text-xs text-ocean-300
                            backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              Edisi Terkini
            </div>

            <div>
              <h1 className="font-serif font-bold text-white leading-tight">
                <span className="block text-5xl sm:text-6xl lg:text-7xl tracking-tight">
                  CONSERVE
                </span>
                <span className="block text-lg sm:text-xl font-normal text-ocean-300 mt-1
                                 tracking-widest uppercase">
                  Journal of Community Services
                </span>
              </h1>
            </div>

            {/* Informasi volume — sekarang menggunakan issue.volume dan issue.issue
                bukan issue.volume dan issue.number seperti sebelumnya */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Volume", value: String(issue.volume) },
                { label: "Nomor",  value: String(issue.issue) },
                { label: "Terbit", value: formattedDate },
              ].map(({ label, value }) => (
                <div key={label}
                     className="bg-ocean-800/50 backdrop-blur-sm border border-ocean-700
                                rounded-lg px-4 py-2.5">
                  <p className="text-[10px] text-ocean-500 uppercase tracking-widest">{label}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <p className="text-ocean-300 text-sm">
              Edisi ini memuat{" "}
              <span className="text-gold-400 font-semibold">{issue.articles.length} artikel</span>
              {" "}dari berbagai bidang pengabdian masyarakat dan konservasi lingkungan.
            </p>

            <div className="flex items-center gap-3 text-ocean-500 text-sm">
              <div className="flex flex-col gap-1 items-center">
                <div className="w-px h-8 bg-gradient-to-b from-transparent to-ocean-600" />
                <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span>Gulir untuk melihat daftar artikel</span>
            </div>
          </div>

          {/* === KOLOM KANAN: Visual sampul === */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end animate-fade-up"
               style={{ animationDelay: "0.2s" }}>
            <div className="relative w-56 sm:w-64">
              <div className="absolute inset-0 translate-x-3 translate-y-3 bg-ocean-900
                              rounded-lg border border-ocean-700" />
              <div className="relative bg-gradient-to-b from-ocean-800 to-ocean-900
                              rounded-lg border border-ocean-600 overflow-hidden shadow-2xl
                              aspect-[3/4]">

                <div className="h-2/3 bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-900
                                relative overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 200"
                       preserveAspectRatio="xMidYMid slice">
                    <path d="M0 100 Q50 50 100 100 T200 100 V200 H0Z"
                          fill="rgba(255,255,255,0.1)" />
                    <path d="M0 120 Q50 70 100 120 T200 120 V200 H0Z"
                          fill="rgba(255,255,255,0.08)" />
                    <path d="M0 140 Q50 90 100 140 T200 140 V200 H0Z"
                          fill="rgba(255,255,255,0.06)" />
                    <ellipse cx="100" cy="80" rx="50" ry="25" fill="rgba(255,255,255,0.06)" />
                    <path d="M60 80 Q100 55 140 80" stroke="rgba(255,255,255,0.12)"
                          strokeWidth="2" fill="none" />
                  </svg>

                  <div className="absolute top-3 left-3 right-3">
                    <p className="text-[8px] font-mono text-ocean-300 tracking-widest uppercase">
                      Volume {issue.volume} · Number {issue.issue}
                    </p>
                  </div>
                </div>

                <div className="h-1/3 p-3 bg-ocean-950 flex flex-col justify-center">
                  <p className="font-serif font-bold text-white text-sm leading-tight">
                    CONSERVE
                  </p>
                  <p className="text-[9px] text-ocean-400 leading-tight mt-0.5">
                    Journal of Community Services
                  </p>
                  <div className="mt-2 h-px bg-gradient-to-r from-gold-500 to-transparent" />
                  <p className="text-[8px] text-ocean-500 mt-1.5">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16
                      bg-gradient-to-b from-transparent to-ocean-950/30" />
    </section>
  )
}