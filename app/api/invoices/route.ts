import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { InvoiceType } from "@/lib/prisma-types"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get("customerId")
  const includeMonthly = searchParams.get("includeMonthly") === "true"

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
    },
  })

  let monthlyBills = []
  if (includeMonthly) {
    const bills = await prisma.monthlyBill.findMany({
      where: customerId ? { customerId } : undefined,
    })
    monthlyBills = bills.map((bill) => ({
      ...bill,
      invoice: invoices.find((inv) => inv.id === bill.invoiceId) ?? null,
    }))
  }

  return NextResponse.json({ invoices, monthlyBills })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, amount, type, description, dueDate, applicationId, lineItems } = body as {
    customerId?: string
    amount?: number
    type?: InvoiceType
    description?: string
    dueDate?: string
    applicationId?: string | null
    lineItems?: unknown
  }

  if (!customerId || !amount || !type || !description || !dueDate) {
    return NextResponse.json({ error: "customerId, amount, type, description and dueDate are required" }, { status: 400 })
  }

  const invoice = await prisma.invoice.create({
    data: {
      customerId,
      applicationId: applicationId ?? null,
      amount,
      type,
      description,
      status: "pending",
      dueDate,
      paidAt: null,
      lineItems: Array.isArray(lineItems) ? lineItems : null,
    },
  })

  return NextResponse.json({ invoice })
}
