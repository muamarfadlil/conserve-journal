import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession, isSuperAdmin } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"

async function requireSuperAdmin() {
  const session = await getSession().catch(() => null)
  if (!session || !isSuperAdmin(session.user.role)) {
    return { denied: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }), session: null }
  }
  return { denied: null, session }
}

export async function GET() {
  const { denied } = await requireSuperAdmin()
  if (denied) return denied

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(users)
}

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

export async function PATCH(req: NextRequest) {
  const { denied, session } = await requireSuperAdmin()
  if (denied) return denied

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })

  // Tidak boleh downgrade diri sendiri dari SUPER_ADMIN
  if (session?.user.id === id) {
    const body = await req.json()
    if (body.role && body.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Tidak dapat mengubah role akun Anda sendiri" }, { status: 400 })
    }
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { password, ...rest } = parsed.data
  const data: Record<string, unknown> = { ...rest }
  if (password) data.password = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })
  return NextResponse.json(user)
}

export async function DELETE(req: NextRequest) {
  const { denied, session } = await requireSuperAdmin()
  if (denied) return denied

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })
  if (session?.user.id === id) return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ message: "Pengguna berhasil dihapus" })
}
