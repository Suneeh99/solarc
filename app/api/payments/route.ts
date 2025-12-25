import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (user.role === Role.customer) {
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      include: { invoice: true, application: true },
    })
    return NextResponse.json(payments)
  }

  if (user.role === Role.installer) {
    const payments = await prisma.payment.findMany({
      where: { invoice: { installerId: user.id } },
      include: { invoice: true, application: true },
    })
    return NextResponse.json(payments)
  }

  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden
  const payments = await prisma.payment.findMany({ include: { invoice: true, application: true, user: true } })
  return NextResponse.json(payments)
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const { invoiceId, applicationId, amount, method, status } = body
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      applicationId,
      userId: user.id,
      amount,
      method,
      status,
    },
  })
  return NextResponse.json(payment)
}
