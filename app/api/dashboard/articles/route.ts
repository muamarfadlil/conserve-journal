// app/api/dashboard/articles/route.ts
// CRUD artikel — butuh role ADMIN atau SUPER_ADMIN
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession, isAdmin } from "@/lib/auth"
import { z } from "zod"

async function requireAdmin() {
  const session = await getSession()
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 })
  }
  return null
}

// GET /api/dashboard/articles — list artikel dengan pagination
export async function GET(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"))
  const skip = (page - 1) * limit

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      skip,
      take: limit,
      include: { volume: true, authors: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.count(),
  ])

  return NextResponse.json({ articles, total, page, limit })
}

const articleSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  abstract: z.string().min(20, "Abstrak minimal 20 karakter"),
  doi: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  pages: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional().default([]),
  publishedAt: z.string().optional().nullable(),
  volumeId: z.number().int().positive("Volume ID tidak valid"),
  authors: z.array(z.object({
    name: z.string().min(2),
    affiliation: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
  })).min(1, "Minimal satu penulis"),
})

// POST /api/dashboard/articles — buat artikel baru
export async function POST(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await req.json()
  const parsed = articleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { authors, publishedAt, ...articleData } = parsed.data

  const article = await prisma.article.create({
    data: {
      ...articleData,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      authors: { create: authors },
    },
    include: { volume: true, authors: true },
  })

  return NextResponse.json(article, { status: 201 })
}

// PATCH /api/dashboard/articles?id=... — update artikel
export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get("id") ?? "0")
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })

  const body = await req.json()
  const parsed = articleSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { authors, publishedAt, ...articleData } = parsed.data

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...articleData,
      ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
      ...(authors ? {
        authors: {
          deleteMany: {},
          create: authors,
        }
      } : {}),
    },
    include: { volume: true, authors: true },
  })

  return NextResponse.json(article)
}

// DELETE /api/dashboard/articles?id=... — hapus artikel
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get("id") ?? "0")
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })

  await prisma.article.delete({ where: { id } })
  return NextResponse.json({ message: "Artikel berhasil dihapus" })
}
