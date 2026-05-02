import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })

  const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Date']
  const rows = leads.map(l => [
    `"${l.name}"`, `"${l.email}"`, `"${l.phone || ''}"`,
    `"${l.subject || ''}"`, `"${l.message.replace(/"/g, '""')}"`,
    l.status, new Date(l.createdAt).toISOString()
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
