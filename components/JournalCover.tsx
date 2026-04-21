// ============================================================
// components/JournalCover.tsx
// Komponen "hero" halaman beranda yang menampilkan sampul edisi terkini.
// Ini adalah elemen pertama yang dilihat pengunjung, jadi dibuat impresif.
// ============================================================

import { formatDate } from "@/lib/articles";
import type { JournalIssue } from "@/lib/articles";

interface JournalCoverProps {
  issue: JournalIssue;
}

export default function JournalCover({ issue }: JournalCoverProps) {
  const formattedDate = formatDate(issue.publishedDate);

  return (
    // Section hero dengan latar gradien kelautan yang dalam
    <section className="relative overflow-hidden bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800">

      {/* === ORNAMEN LATAR BELAKANG (dekoratif) ===
          Lingkaran-lingkaran besar semi-transparan memberi kedalaman visual
          tanpa membutuhkan gambar eksternal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full
                        bg-ocean-700/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full
                        bg-ocean-600/15 blur-3xl" />
        {/* Pola grid halus — memberikan tekstur seperti kertas akademik */}
        <div className="absolute inset-0"
             style={{
               backgroundImage: `radial-gradient(circle, rgba(20,184,166,0.06) 1px, transparent 1px)`,
               backgroundSize: "32px 32px",
             }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

          {/* === KOLOM KIRI: Teks informasi jurnal (3/5 lebar di desktop) === */}
          <div className="lg:col-span-3 space-y-6 animate-fade-up">

            {/* Label "edisi terbaru" */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ocean-800/60
                            border border-ocean-700 rounded-full text-xs text-ocean-300
                            backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              Edisi Terkini
            </div>

            {/* Nama jurnal besar — menggunakan font serif */}
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

            {/* Informasi volume & nomor */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Volume", value: issue.volume },
                { label: "Nomor",  value: issue.number },
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

            {/* Statistik ringkas edisi */}
            <p className="text-ocean-300 text-sm">
              Edisi ini memuat{" "}
              <span className="text-gold-400 font-semibold">{issue.articles.length} artikel</span>
              {" "}dari berbagai bidang pengabdian masyarakat dan konservasi lingkungan.
            </p>

            {/* CTA scroll ke bawah */}
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

          {/* === KOLOM KANAN: Representasi visual "sampul" (2/5 lebar di desktop) === */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end animate-fade-up"
               style={{ animationDelay: "0.2s" }}>
            {/* Sampul jurnal bergaya buku — dibuat dengan CSS murni */}
            <div className="relative w-56 sm:w-64">
              {/* Bayangan buku di belakang */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 bg-ocean-900
                              rounded-lg border border-ocean-700" />
              {/* Sampul utama */}
              <div className="relative bg-gradient-to-b from-ocean-800 to-ocean-900
                              rounded-lg border border-ocean-600 overflow-hidden shadow-2xl
                              aspect-[3/4]">

                {/* Area gambar sampul — menggunakan placeholder bergradien */}
                <div className="h-2/3 bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-900
                                relative overflow-hidden">
                  {/* Ornamen gelombang laut bergaya abstrak */}
                  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 200"
                       preserveAspectRatio="xMidYMid slice">
                    <path d="M0 100 Q50 50 100 100 T200 100 V200 H0Z"
                          fill="rgba(255,255,255,0.1)" />
                    <path d="M0 120 Q50 70 100 120 T200 120 V200 H0Z"
                          fill="rgba(255,255,255,0.08)" />
                    <path d="M0 140 Q50 90 100 140 T200 140 V200 H0Z"
                          fill="rgba(255,255,255,0.06)" />
                    {/* Siluet paus hiu — terinspirasi dari elemen desain asli */}
                    <ellipse cx="100" cy="80" rx="50" ry="25" fill="rgba(255,255,255,0.06)" />
                    <path d="M60 80 Q100 55 140 80" stroke="rgba(255,255,255,0.12)"
                          strokeWidth="2" fill="none" />
                  </svg>

                  {/* Label di atas gambar */}
                  <div className="absolute top-3 left-3 right-3">
                    <p className="text-[8px] font-mono text-ocean-300 tracking-widest uppercase">
                      Volume {issue.volume} · Number {issue.number}
                    </p>
                  </div>
                </div>

                {/* Area teks di bagian bawah sampul */}
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

      {/* Garis bawah gradien — transisi halus ke konten di bawahnya */}
      <div className="absolute bottom-0 left-0 right-0 h-16
                      bg-gradient-to-b from-transparent to-ocean-950/30" />
    </section>
  );
}
