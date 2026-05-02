import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import path from 'path'
import fs from 'fs'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    if (!files || files.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 })

    const uploaded = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Try Cloudinary first
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const { v2: cloudinary } = await import('cloudinary')
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          })
          const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
          const result = await cloudinary.uploader.upload(base64, { folder: 'nexuscms', resource_type: 'auto' })
          const media = await prisma.media.create({
            data: { filename: file.name, url: result.secure_url, publicId: result.public_id, mimeType: file.type, size: result.bytes, width: result.width, height: result.height, uploadedBy: user.userId }
          })
          uploaded.push(media)
          continue
        } catch (cloudErr) {
          console.error('Cloudinary failed, falling back to local:', cloudErr)
        }
      }

      // Fallback: save to public/uploads
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      fs.writeFileSync(path.join(uploadDir, safeName), buffer)
      const media = await prisma.media.create({
        data: { filename: file.name, url: `/uploads/${safeName}`, mimeType: file.type, size: file.size, uploadedBy: user.userId }
      })
      uploaded.push(media)
    }

    return NextResponse.json({ success: true, data: uploaded })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed: ' + (e as Error).message }, { status: 500 })
  }
}
