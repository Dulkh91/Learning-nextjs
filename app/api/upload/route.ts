import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // បង្កើតឈ្មោះថ្មីកុំអោយជាន់គ្នា
  const fileName = `${Date.now()}-${file.name}`
  const filePath = path.join(process.cwd(), 'public/uploads', fileName)

  await writeFile(filePath, buffer)

  return NextResponse.json({ url: `/uploads/${fileName}` })
}