// ============================================================
// lib/articles.ts
// Tipe data dan fungsi utilitas untuk mengelola data artikel jurnal.
// Dengan pendekatan ini, jika suatu saat data dipindah ke database,
// kita hanya perlu mengubah file ini saja tanpa menyentuh halaman-halaman.
// ============================================================

import articlesData from "@/data/articles.json";

// === TIPE DATA UTAMA ===
// Mendefinisikan "bentuk" dari setiap objek artikel
export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  pages: string;
  publishedDate: string;         // Format: "YYYY-MM-DD"
  volume: string;
  number: string;
  doi: string;
  keywords: string[];
  pdfUrl: string;
  category: string;
}

// Tipe untuk informasi edisi/volume jurnal
export interface JournalIssue {
  volume: string;
  number: string;
  publishedDate: string;
  articles: Article[];
}

// === CAST DATA JSON KE TIPE TYPESCRIPT ===
// TypeScript membutuhkan ini agar menjamin tipe data yang benar
const articles: Article[] = articlesData as Article[];

// === FUNGSI UTILITAS ===

/**
 * Mengambil semua artikel dari data.
 * Di masa depan, ini bisa diganti dengan fetch() ke API atau database.
 */
export function getAllArticles(): Article[] {
  return articles;
}

/**
 * Mencari satu artikel berdasarkan ID-nya.
 * Mengembalikan `undefined` jika artikel tidak ditemukan.
 */
export function getArticleById(id: string): Article | undefined {
  return articles.find((article) => article.id === id);
}

/**
 * Mengambil artikel-artikel untuk edisi (volume + nomor) tertentu.
 */
export function getArticlesByIssue(volume: string, number: string): Article[] {
  return articles.filter(
    (article) => article.volume === volume && article.number === number
  );
}

/**
 * Mengambil informasi edisi terbaru (berdasarkan tanggal terbit terkini).
 * Fungsi ini secara otomatis menentukan edisi mana yang terbaru dari data.
 */
export function getLatestIssue(): JournalIssue {
  // Urutkan artikel berdasarkan tanggal terbit (terbaru di depan)
  const sorted = [...articles].sort(
    (a, b) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );

  // Ambil volume dan nomor dari artikel paling baru
  const latest = sorted[0];
  const issueArticles = getArticlesByIssue(latest.volume, latest.number);

  return {
    volume: latest.volume,
    number: latest.number,
    publishedDate: latest.publishedDate,
    articles: issueArticles,
  };
}

/**
 * Memformat tanggal dari "YYYY-MM-DD" menjadi format yang mudah dibaca,
 * misalnya: "11 February 2024"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Mengambil semua ID artikel — dibutuhkan oleh generateStaticParams
 * pada halaman dinamis [id] agar Next.js bisa melakukan pre-rendering.
 */
export function getAllArticleIds(): string[] {
  return articles.map((article) => article.id);
}
