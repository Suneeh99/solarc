import { NextRequest, NextResponse } from "next/server"
import { Role, InvoiceType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

export const dynamic = "force-dynamic"

/* ------------------------------------------------------------------ */
/* GET /api/payments                                                   */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const includeMonthly = searchParams.get("includeMonthly") === "true"

  let invoices = []

  if (user.role === Role.customer) {
    invoices = await prisma.invoice.findMany({
      where: { customerId: user.id },
      include: { payments: true, application: true },
    })
  } else if (user.role === Role.installer) {
    invoices = await prisma.invoice.findMany({
      where: { installerId: user.id },
      include: { payments: true, application: true },
    })
  } else {
    const forbidden = requireRole(user.role, [Role.officer])
    if (forbidden) return forbidden

    invoices = await prisma.invoice.findMany({
      include: { payments: true, application: true },
    })
  }

  let monthlyBills: any[] = []

  if (includeMonthly) {
    if (user.role === Role.customer) {
      monthlyBills = await prisma.monthlyBill.findMany({
        where: { customerId: user.id },
      })
    } else if (user.role === Role.officer) {
      monthlyBills = await prisma.monthlyBill.findMany()
    }
  }

  return NextResponse.json({ invoices, monthlyBills })
}

/* ------------------------------------------------------------------ */
/* POST /api/payments                                                  */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden

  const body = await req.json()
  const {
    applicationId,
    customerId,
    installerId,
    type,
    amount,
    dueDate,
    description,
    lineItems,
  }: {
    applicationId?: string | null
    customerId?: string
    installerId?: string
    type?: InvoiceType
    amount?: number
    dueDate?: string
    description?: string
    lineItems?: unknown
  } = body

  if (!customerId || !type || !amount || !dueDate || !description) {
    return NextResponse.json(
      { error: "customerId, type, amount, dueDate, and description are required" },
      { status: 400 },
    )
  }

  const invoice = await prisma.invoice.create({
    data: {
      applicationId: applicationId ?? null,
      customerId,
      installerId,
      type,
      amount,
      description,
      status: "pending",
      dueDate: new Date(dueDate),
      paidAt: null,
      lineItems: Array.isArray(lineItems) ? lineItems : null,
    },
  })

  return NextResponse.json({ invoice }, { status: 201 })
}
