import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (user.role === Role.customer) {
    const invoices = await prisma.invoice.findMany({
      where: { customerId: user.id },
      include: { payments: true, application: true },
    })
    return NextResponse.json(invoices)
  }

  if (user.role === Role.installer) {
    const invoices = await prisma.invoice.findMany({
      where: { installerId: user.id },
      include: { payments: true, application: true },
    })
    return NextResponse.json(invoices)
  }

  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden
  const invoices = await prisma.invoice.findMany({ include: { payments: true, application: true } })
  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden

  const body = await request.json()
  const { applicationId, customerId, installerId, type, amount, dueDate, description } = body
  const invoice = await prisma.invoice.create({
    data: {
      applicationId,
      customerId,
      installerId,
      type,
      amount,
      dueDate: new Date(dueDate),
      description,
    },
  })
  return NextResponse.json(invoice)
}
