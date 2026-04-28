import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Jurnal",
  description:
    "Informasi mengenai fokus, ruang lingkup, kebijakan, dan tim editor " +
    "CONSERVE Journal of Community Services.",
};

const editors = [
  { name: "Prof. Dr. Hendra Kusuma, M.Sc.", role: "Editor in Chief", affiliation: "Universitas Bahari Nusantara, Indonesia", expertise: "Ekologi Pesisir & Konservasi Kelautan", initial: "HK" },
  { name: "Dr. Siti Aminah Rahayu, M.Pd.", role: "Associate Editor", affiliation: "Institut Teknologi Kelautan, Indonesia", expertise: "Pendidikan Lingkungan & Pengabdian Masyarakat", initial: "SA" },
  { name: "Dr. Ahmad Faisal Harahap, M.T.", role: "Associate Editor", affiliation: "Universitas Hasanuddin, Indonesia", expertise: "Pemberdayaan Komunitas Pesisir", initial: "AF" },
  { name: "Assoc. Prof. Maria Santos, Ph.D.", role: "International Reviewer", affiliation: "University of the Philippines Visayas", expertise: "Marine Conservation & Community Ecology", initial: "MS" },
  { name: "Dr. Bambang Nugroho, M.Kes.", role: "Section Editor", affiliation: "Universitas Airlangga, Indonesia", expertise: "Kesehatan Masyarakat Pesisir", initial: "BN" },
  { name: "Nur Wahidah, S.T., M.T.", role: "Managing Editor", affiliation: "Universitas Bahari Nusantara, Indonesia", expertise: "Sistem Informasi & Manajemen Jurnal", initial: "NW" },
];

const scopeTopics = [
  { icon: "🌊", title: "Konservasi Kelautan & Pesisir", desc: "Penelitian dan program aksi pelestarian ekosistem laut, terumbu karang, mangrove, dan biota pesisir." },
  { icon: "👥", title: "Pemberdayaan Masyarakat", desc: "Inisiatif penguatan kapasitas komunitas nelayan, petani, dan kelompok rentan di wilayah pesisir." },
  { icon: "📚", title: "Pendidikan & Pelatihan", desc: "Program pendidikan non-formal, pelatihan vokasional, dan pengembangan sumber daya manusia berbasis kebutuhan lokal." },
  { icon: "♻️", title: "Lingkungan Hidup", desc: "Pengelolaan sampah, energi terbarukan, pertanian ramah lingkungan, dan mitigasi perubahan iklim di level komunitas." },
  { icon: "🏥", title: "Kesehatan Masyarakat", desc: "Program gizi, sanitasi, kesehatan ibu dan anak, serta pemberdayaan kader kesehatan di daerah pesisir dan kepulauan." },
  { icon: "💼", title: "Ekonomi Kreatif & UMKM", desc: "Pendampingan usaha berbasis produk laut, pemasaran digital, akses permodalan, dan rantai nilai lokal." },
];

const sidebarLinks = [
  { label: "Focus and Scope", href: "#scope" },
  { label: "Publication Ethics", href: "#ethics" },
  { label: "Article Processing Fee", href: "#apf" },
  { label: "Peer Reviewers Process", href: "#review-process" },
  { label: "Peer Reviewers", href: "#editors" },
  { label: "Open Access Statement", href: "#open-access" },
  { label: "Plagiarism", href: "#plagiarism" },
  { label: "Copyright Notice", href: "#copyright" },
  { label: "Contact", href: "#contact" },
  { label: "Article Withdrawal", href: "#withdrawal" },
];

function JournalSidebar() {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-24 rounded-xl overflow-hidden border border-[var(--border-default)]
                      bg-[var(--bg-surface)]">
        {sidebarLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            className={`block px-4 py-3 text-sm text-[var(--text-secondary)]
                        hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]
                        transition-colors duration-150
                        ${i > 0 ? "border-t border-[var(--border-default)]" : ""}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </aside>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border-default)] py-16
                          bg-gradient-to-b from-[var(--bg-surface-alt)] to-[var(--bg-base)]
                          dark:bg-gradient-to-b dark:from-ocean-900 dark:to-ocean-950
                          dark:border-ocean-800">
        <div className="absolute top-0 right-0 w-96 h-96
                        bg-ocean-400/10 dark:bg-ocean-700/10 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Tentang Kami
          </p>
          <h1 className="font-serif font-bold text-[var(--text-primary)] text-4xl sm:text-5xl mb-4">
            CONSERVE Journal
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-2xl mx-auto">
            Wadah publikasi ilmiah yang menghubungkan dunia akademik dengan
            aksi nyata pelestarian lingkungan dan pemberdayaan masyarakat.
          </p>
        </div>
      </section>

      {/* Main layout: content + sidebar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left: main content */}
          <div className="flex-1 min-w-0 space-y-14">

            {/* Profil Jurnal */}
            <section>
              <div className="rounded-2xl p-8 sm:p-10 space-y-6
                              bg-[var(--bg-surface)] border border-[var(--border-default)]">
                <div>
                  <h2 className="font-serif font-bold text-[var(--text-primary)] text-2xl mb-4">Profil Jurnal</h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)]">CONSERVE — Journal of Community Services</strong> adalah
                    jurnal ilmiah peer-reviewed yang diterbitkan dua kali setahun oleh Lembaga Penelitian
                    dan Pengabdian kepada Masyarakat (LPPM) Universitas Bahari Nusantara. Jurnal ini
                    berkomitmen untuk menjadi jembatan antara temuan akademik dan praktik pengabdian
                    yang berdampak nyata bagi masyarakat, khususnya komunitas pesisir dan kepulauan Indonesia.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-default)]">
                  {[
                    { label: "P-ISSN", value: "0000-0001" },
                    { label: "E-ISSN", value: "0000-0000" },
                    { label: "Frekuensi", value: "2x / Tahun" },
                    { label: "Bahasa", value: "Indonesia & Inggris" },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-3 rounded-lg
                                               bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Ruang Lingkup */}
            <section id="scope">
              <div className="mb-8">
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Fokus & Ruang Lingkup
                </p>
                <h2 className="font-serif font-bold text-[var(--text-primary)] text-2xl">Topik yang Dicakup</h2>
                <p className="text-[var(--text-secondary)] mt-2 text-sm">
                  Jurnal menerima manuskrip dari berbagai bidang pengabdian masyarakat
                  yang relevan dengan tema besar pelestarian dan pemberdayaan.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scopeTopics.map((topic) => (
                  <div key={topic.title}
                       className="rounded-xl p-5 transition-colors duration-200
                                  bg-[var(--bg-surface)] border border-[var(--border-default)]
                                  hover:border-ocean-400 dark:hover:border-ocean-600">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl leading-none mt-0.5">{topic.icon}</span>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1">{topic.title}</h3>
                        <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{topic.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Kebijakan Editorial */}
            <section id="review-process" className="rounded-2xl p-8 sm:p-10
                        bg-[var(--bg-surface-alt)] dark:bg-ocean-900
                        border border-[var(--border-default)]">
              <div className="mb-8">
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Proses Peer Review
                </p>
                <h2 className="font-serif font-bold text-[var(--text-primary)] text-2xl">Kebijakan Editorial</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { step: "01", title: "Pengiriman Naskah", desc: "Penulis mengirimkan naskah melalui sistem OJS kami. Tim editor akan melakukan pengecekan awal kesesuaian topik dan format dalam 3–5 hari kerja." },
                  { step: "02", title: "Double-Blind Review", desc: "Naskah yang lolos seleksi awal akan dikirim ke minimal dua reviewer yang kompeten. Identitas penulis dan reviewer dirahasiakan satu sama lain." },
                  { step: "03", title: "Keputusan & Revisi", desc: "Penulis menerima keputusan: diterima, perlu revisi mayor/minor, atau ditolak. Proses rata-rata memakan waktu 6–8 minggu." },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="relative pl-5 border-l-2 border-[var(--border-default)]">
                    <span className="absolute -left-px top-0 block w-4 h-4 rounded-full -translate-x-1/2
                                     bg-[var(--border-default)] border-2 border-[var(--bg-surface-alt)]
                                     dark:border-ocean-900" />
                    <p className="font-mono text-xs text-[var(--text-muted)] mb-1">LANGKAH {step}</p>
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-2">{title}</h3>
                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tim Editor */}
            <section id="editors">
              <div className="mb-8">
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Dewan Redaksi
                </p>
                <h2 className="font-serif font-bold text-[var(--text-primary)] text-2xl">Tim Editor</h2>
                <p className="text-[var(--text-secondary)] mt-2 text-sm">
                  Jurnal dikelola oleh akademisi dan praktisi berpengalaman di bidangnya.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {editors.map((editor) => (
                  <div key={editor.name}
                       className="rounded-xl p-5 transition-colors duration-200 group
                                  bg-[var(--bg-surface)] border border-[var(--border-default)]
                                  hover:border-ocean-400 dark:hover:border-ocean-600">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full flex-shrink-0
                                      flex items-center justify-center text-white font-bold text-sm
                                      bg-gradient-to-br from-ocean-500 to-ocean-700
                                      ring-2 ring-[var(--border-default)]
                                      group-hover:ring-gold-400 dark:group-hover:ring-gold-500
                                      transition-all duration-200">
                        {editor.initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-tight truncate">
                          {editor.name}
                        </h3>
                        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full
                                         bg-[var(--bg-surface-alt)] text-[var(--text-muted)]
                                         border border-[var(--border-default)]">
                          {editor.role}
                        </span>
                        <p className="mt-2 text-[11px] text-[var(--text-secondary)] leading-tight">{editor.affiliation}</p>
                        <p className="mt-1 text-[11px] text-[var(--text-muted)] italic">{editor.expertise}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA / Contact */}
            <section id="contact">
              <div className="rounded-2xl p-8 text-center border
                              bg-gradient-to-r from-[var(--bg-surface-alt)] to-[var(--bg-surface)]
                              dark:from-ocean-800 dark:to-ocean-900
                              border-[var(--border-default)] dark:border-ocean-700">
                <h2 className="font-serif font-bold text-[var(--text-primary)] text-2xl mb-3">
                  Tertarik Berkontribusi?
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-lg mx-auto">
                  Kami menerima naskah dari dosen, peneliti, dan praktisi pengabdian masyarakat.
                  Lihat panduan penulisan kami dan kirimkan naskah terbaik Anda.
                </p>
                <a
                  href="mailto:editor@conservejournal.ac.id"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                             bg-gold-500 hover:bg-gold-400 text-ocean-950 font-semibold text-sm
                             transition-all duration-200 hover:shadow-lg hover:shadow-gold-500/25"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Hubungi Tim Editor
                </a>
              </div>
            </section>

          </div>{/* end left content */}

          {/* Right: sidebar */}
          <JournalSidebar />

        </div>
      </div>
    </div>
  );
}
