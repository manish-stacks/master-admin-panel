import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ success: true, data: cats })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  try {
    const cat = await prisma.category.create({ data: { name, slug } })
    return NextResponse.json({ success: true, data: cat }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Category already exists' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
