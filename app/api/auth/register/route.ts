// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { getSession, isAdmin } from "@/lib/auth"

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"]).optional().default("USER"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role } = parsed.data

    // Hanya ADMIN/SUPER_ADMIN yang bisa membuat akun ADMIN/SUPER_ADMIN
    if (role !== "USER") {
      const session = await getSession().catch(() => null)
      if (!session || !isAdmin(session.user.role)) {
        return NextResponse.json(
          { error: "Tidak memiliki izin untuk membuat akun dengan peran ini" },
          { status: 403 }
        )
      }
      // Hanya SUPER_ADMIN yang bisa membuat SUPER_ADMIN
      if (role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Hanya Super Admin yang dapat membuat akun Super Admin" },
          { status: 403 }
        )
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return NextResponse.json({ message: "Akun berhasil dibuat", user }, { status: 201 })
  } catch (err) {
    console.error("[register] error:", err)
    return NextResponse.json({
      error: "Terjadi kesalahan server",
      detail: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
}
