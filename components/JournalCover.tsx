// components/JournalCover.tsx
import type { LatestIssue } from "@/lib/articles";

interface JournalCoverProps {
  issue: LatestIssue;
}

export default function JournalCover({ issue }: JournalCoverProps) {
  const formattedDate = `${issue.month ?? ''} ${issue.year}`.trim()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800">

      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full
                        bg-ocean-600/15 blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full
                        bg-teal-500/10 blur-[60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[300px] rounded-full bg-ocean-700/10 blur-[100px]" />
        {/* Dot grid */}
        <div className="absolute inset-0"
             style={{
               backgroundImage: `radial-gradient(circle, rgba(20,184,166,0.07) 1px, transparent 1px)`,
               backgroundSize: "32px 32px",
             }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

          {/* Kolom kiri */}
          <div className="lg:col-span-3 space-y-6 animate-fade-up">

            <div className="inline-flex items-center gap-2 px-3 py-1.5
                            bg-gradient-to-r from-ocean-800/80 to-ocean-700/60
                            border border-ocean-600/60 rounded-full text-xs text-ocean-200
                            backdrop-blur-sm shadow-sm shadow-ocean-950/40">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              Edisi Terkini
              <span className="text-ocean-500">·</span>
              <span className="text-ocean-400 font-mono">{formattedDate}</span>
            </div>

            <div>
              <h1 className="font-serif font-bold text-white leading-tight">
                <span className="block text-5xl sm:text-6xl lg:text-7xl tracking-tight
                                 bg-gradient-to-br from-white via-ocean-100 to-ocean-300
                                 bg-clip-text text-transparent">
                  CONSERVE
                </span>
                <span className="block text-lg sm:text-xl font-normal text-ocean-400 mt-1
                                 tracking-widest uppercase">
                  Journal of Community Services
                </span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { label: "Volume", value: String(issue.volume) },
                { label: "Nomor",  value: String(issue.issue) },
                { label: "Terbit", value: formattedDate },
              ].map(({ label, value }) => (
                <div key={label}
                     className="bg-ocean-800/40 hover:bg-ocean-800/70 backdrop-blur-sm
                                border border-ocean-700/60 hover:border-ocean-500
                                rounded-lg px-4 py-2.5 transition-all duration-200 cursor-default">
                  <p className="text-[10px] text-ocean-500 uppercase tracking-widest">{label}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <p className="text-ocean-300 text-sm leading-relaxed max-w-lg">
              Edisi ini memuat{" "}
              <span className="text-gold-400 font-semibold">{issue.articles.length} artikel</span>
              {" "}dari berbagai bidang pengabdian masyarakat dan konservasi lingkungan.
            </p>

            <div className="flex items-center gap-3 text-ocean-500 text-sm">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-ocean-600 to-ocean-500" />
                <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="text-ocean-500 text-xs">Gulir untuk melihat daftar artikel</span>
            </div>
          </div>

          {/* Kolom kanan: visual sampul */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end animate-fade-up"
               style={{ animationDelay: "0.2s" }}>
            <div className="relative w-56 sm:w-64 group">
              {/* Glow ambient di belakang buku */}
              <div className="absolute inset-0 translate-x-2 translate-y-2
                              bg-ocean-500/20 blur-2xl rounded-lg
                              group-hover:bg-ocean-400/30 transition-all duration-500" />
              {/* Shadow card */}
              <div className="absolute inset-0 translate-x-3 translate-y-3
                              bg-ocean-900 rounded-lg border border-ocean-700/50" />
              {/* Cover card */}
              <div className="relative bg-gradient-to-b from-ocean-800 to-ocean-900
                              rounded-lg border border-ocean-600/80 overflow-hidden
                              shadow-2xl shadow-ocean-950/70 aspect-[3/4]
                              group-hover:border-ocean-500 transition-all duration-300">

                <div className="h-2/3 bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-900
                                relative overflow-hidden">
                  {/* Shimmer overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent
                                  -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
                  <p className="font-serif font-bold text-white text-sm leading-tight">CONSERVE</p>
                  <p className="text-[9px] text-ocean-400 leading-tight mt-0.5">
                    Journal of Community Services
                  </p>
                  <div className="mt-2 h-px bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
                  <p className="text-[8px] text-ocean-500 mt-1.5">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom fade ke section berikutnya */}
      <div className="absolute bottom-0 left-0 right-0 h-20
                      bg-gradient-to-b from-transparent to-ocean-950" />
    </section>
  )
}
