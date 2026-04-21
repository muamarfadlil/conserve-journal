// lib/articles.ts
// Fungsi-fungsi ini sekarang mengambil data dari PostgreSQL via Prisma.
// Semua fungsi menjadi async karena operasi database bersifat asinkron.

import { prisma } from './prisma'

// ============================================================
// TIPE DATA — disesuaikan dengan struktur database
// ============================================================

export type Author = {
  id: number
  name: string
  affiliation: string | null
  email: string | null
}

export type Volume = {
  id: number
  number: number
  issue: number
  year: number
  month: string | null
}

export type Article = {
  id: number
  title: string
  abstract: string
  pages: string | null
  doi: string | null
  pdfUrl: string | null
  category: string | null
  keywords: string[]
  publishedAt: Date | null
  volumeId: number
  createdAt: Date
  volume: Volume
  authors: Author[]
}

export type LatestIssue = {
  volume: number
  issue: number
  year: number
  month: string | null
  articles: Article[]
}

// ============================================================
// FUNGSI UTILITAS
// ============================================================

/**
 * Mengambil semua artikel beserta data volume dan penulisnya.
 */
export async function getAllArticles(): Promise<Article[]> {
  return await prisma.article.findMany({
    include: { volume: true, authors: true },
    orderBy: { id: 'asc' }
  })
}

/**
 * Mencari satu artikel berdasarkan ID-nya (sekarang ID bertipe number).
 */
export async function getArticleById(id: number): Promise<Article | null> {
  return await prisma.article.findUnique({
    where: { id },
    include: { volume: true, authors: true }
  })
}

/**
 * Mengambil semua ID artikel — dibutuhkan oleh generateStaticParams.
 * Mengembalikan string[] agar kompatibel dengan parameter URL Next.js.
 */
export async function getAllArticleIds(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    select: { id: true }
  })
  return articles.map(a => String(a.id))
}

/**
 * Mengambil volume terbaru beserta semua artikelnya.
 */
export async function getLatestIssue(): Promise<LatestIssue | null> {
  const volume = await prisma.volume.findFirst({
    orderBy: { year: 'desc' },
    include: {
      articles: {
        include: { authors: true },
        orderBy: { id: 'asc' }
      }
    }
  })

  if (!volume) return null

  return {
    volume: volume.number,
    issue: volume.issue,
    year: volume.year,
    month: volume.month,
    articles: volume.articles as Article[]
  }
}

/**
 * Memformat tanggal menjadi string yang mudah dibaca.
 * Contoh output: "11 Februari 2024"
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Memformat informasi volume menjadi string.
 * Contoh output: "Februari 2024"
 */
export function formatVolumeDate(volume: Volume): string {
  return `${volume.month ?? ''} ${volume.year}`.trim()
}