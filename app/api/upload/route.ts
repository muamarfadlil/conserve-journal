import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const name = `${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`
  const dest = path.join(process.cwd(), "public", "uploads", name)
  await writeFile(dest, buffer)

  return NextResponse.json({ url: `/uploads/${name}` })
}
