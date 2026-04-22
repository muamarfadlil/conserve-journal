import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isSuperAdmin } from "@/lib/roles"
import bcrypt from "bcryptjs"
import { z } from "zod"

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !isSuperAdmin(session.user.role)) {
    return { denied: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }), session: null }
  }
  return { denied: null, session }
}

export async function GET() {
  try {
    const { denied } = await requireSuperAdmin()
    if (denied) return denied

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(users)
  } catch (err) {
    console.error("[users GET]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

const createSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email().max(255),
  password: z.string().min(8).max(128),
  role:     z.enum(["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"]).default("USER"),
})

export async function POST(req: NextRequest) {
  try {
    const { denied } = await requireSuperAdmin()
    if (denied) return denied

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, password, role } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    })
    return NextResponse.json({ message: "Pengguna berhasil dibuat", user }, { status: 201 })
  } catch (err) {
    console.error("[users POST]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

const updateSchema = z.object({
  name:     z.string().min(2).max(100).optional(),
  role:     z.enum(["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(128).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const { denied, session } = await requireSuperAdmin()
    if (denied) return denied

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })

    // Read body once — avoid double-consume bug
    const rawBody = await req.json()

    // Guard: cannot downgrade own account from SUPER_ADMIN
    if (session?.user.id === id && rawBody.role && rawBody.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Tidak dapat mengubah role akun Anda sendiri" },
        { status: 400 }
      )
    }

    const parsed = updateSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { password, ...rest } = parsed.data
    const data: Record<string, unknown> = { ...rest }
    if (password) data.password = await bcrypt.hash(password, 12)

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })
    return NextResponse.json(user)
  } catch (err) {
    console.error("[users PATCH]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { denied, session } = await requireSuperAdmin()
    if (denied) return denied

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })
    if (session?.user.id === id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: "Pengguna berhasil dihapus" })
  } catch (err) {
    console.error("[users DELETE]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
