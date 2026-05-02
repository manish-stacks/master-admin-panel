import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1),
  source: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const where: any = {}
  if (status) where.status = status
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) { const d = new Date(to); d.setHours(23,59,59,999); where.createdAt.lte = d }
  }

  const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } })
  const total = await prisma.lead.count({ where })
  return NextResponse.json({ success: true, data: leads, total })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = leadSchema.parse(body)
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const lead = await prisma.lead.create({ data: { ...data, ipAddress: ip } })

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT||'587'), auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
        await transporter.sendMail({ from: process.env.SMTP_FROM, to: process.env.ADMIN_EMAIL, subject: `New Lead: ${data.name}`, html: `<h2>New Lead</h2><p><b>Name:</b> ${data.name}</p><p><b>Email:</b> ${data.email}</p><p><b>Message:</b> ${data.message}</p>` })
      } catch (e) { console.error('Email failed:', e) }
    }
    return NextResponse.json({ success: true, data: lead }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
