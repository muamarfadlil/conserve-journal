import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Ukuran maks 2MB" }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Format tidak didukung" }, { status: 400 })

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const filename = `${randomUUID()}.${ext}`

  const uploadDir = join(process.cwd(), "public", "avatars")
  await mkdir(uploadDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(join(uploadDir, filename), Buffer.from(bytes))

  const url = `/avatars/${filename}`

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: url },
  })

  return NextResponse.json({ url })
}
