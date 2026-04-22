import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
}

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  if (!ALLOWED_MIME[file.type]) {
    return NextResponse.json(
      { error: "Tipe file tidak diizinkan. Gunakan JPG, PNG, WebP, atau PDF." },
      { status: 415 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ukuran file melebihi batas maksimum 10 MB." },
      { status: 413 }
    )
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Validate magic bytes for images
  const mime = file.type
  if (mime === "image/jpeg" && buffer[0] !== 0xff) {
    return NextResponse.json({ error: "File tidak valid." }, { status: 415 })
  }
  if (mime === "image/png" && buffer.toString("hex", 0, 4) !== "89504e47") {
    return NextResponse.json({ error: "File tidak valid." }, { status: 415 })
  }

  const ext = ALLOWED_MIME[file.type]
  const name = `${randomUUID()}${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, name), buffer)

  return NextResponse.json({ url: `/uploads/${name}` })
}
