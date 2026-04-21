// ============================================================
// app/layout.tsx
// Layout "akar" (root layout) yang membungkus SEMUA halaman.
// Di sinilah kita mendefinisikan metadata SEO, font global,
// dan komponen yang selalu ada di setiap halaman (Header & Footer).
// ============================================================

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// === METADATA SEO ===
// Next.js secara otomatis menghasilkan tag <title> dan <meta> dari objek ini.
// Ini penting untuk mesin pencari (Google Scholar, dll.) dan media sosial.
export const metadata: Metadata = {
  title: {
    // Template: "Nama Halaman | Nama Jurnal"
    // %s akan diisi oleh metadata dari halaman masing-masing
    template: "%s | CONSERVE Journal",
    // Judul default (untuk halaman beranda)
    default: "CONSERVE Journal of Community Services",
  },
  description:
    "Jurnal ilmiah pengabdian kepada masyarakat dengan fokus pada pelestarian " +
    "lingkungan, konservasi kelautan, dan pemberdayaan komunitas pesisir Indonesia.",
  keywords: [
    "jurnal pengabdian masyarakat",
    "community services",
    "konservasi laut",
    "pemberdayaan masyarakat",
    "jurnal ilmiah Indonesia",
  ],
  // OpenGraph: tampilan preview ketika tautan dibagikan di media sosial
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "CONSERVE Journal of Community Services",
  },
};

// Komponen layout root menerima `children` — yaitu konten halaman aktif saat ini
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/*
        Kelas "flex flex-col min-h-screen" memastikan:
        - Layout menggunakan Flexbox column (Header → Konten → Footer)
        - min-h-screen: footer selalu di bawah meski konten sedikit
      */}
      <body className="flex flex-col min-h-screen bg-ocean-950">

        {/* Header navigasi — tampil di semua halaman */}
        <Header />

        {/* Konten utama halaman — flex-1 agar mengisi ruang yang tersisa */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer — tampil di semua halaman */}
        <Footer />

      </body>
    </html>
  );
}
