import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

const updateSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  bio:         z.string().max(500).optional(),
  affiliation: z.string().max(200).optional(),
  orcidId:     z.string().max(50).optional(),
  avatarUrl:   z.string().url().optional().or(z.literal("")),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        avatarUrl: true, bio: true, affiliation: true, orcidId: true, createdAt: true,
      },
    })
    return NextResponse.json(user)
  } catch (err) {
    console.error("[profile GET]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Rate limit: 20 profile saves per user per minute
    const rl = rateLimit(`profile:${session.user.id}`, 20, 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Tunggu sebentar." },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const data = parsed.data
    const cleanData = {
      ...(data.name        ? { name: data.name }                              : {}),
      ...(data.bio         !== undefined ? { bio: data.bio || null }          : {}),
      ...(data.affiliation !== undefined ? { affiliation: data.affiliation || null } : {}),
      ...(data.orcidId     !== undefined ? { orcidId: data.orcidId || null } : {}),
      ...(data.avatarUrl   !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: cleanData,
      select: {
        id: true, name: true, email: true, role: true,
        avatarUrl: true, bio: true, affiliation: true, orcidId: true,
      },
    })

    return NextResponse.json(user)
  } catch (err) {
    console.error("[profile PATCH]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
