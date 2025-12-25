import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@/lib/services/auth"
import { PaymentType, PaymentStatus } from "@prisma/client"
import { createSandboxPaymentIntent } from "@/lib/payment-gateway"

export const dynamic = "force-dynamic"

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function mapInvoice(invoice: any) {
  return {
    id: invoice.id,
    applicationId: invoice.application.reference,
    customerId: invoice.customerId,
    customerName: invoice.customer?.name,
    amount: invoice.amount,
    status: invoice.status,
    type: invoice.type,
    description: invoice.description,
    createdAt: invoice.createdAt,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/payments                                                   */
/* ------------------------------------------------------------------ */

export async function GET() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const where =
    user.role === "customer"
      ? { customerId: user.id }
      : user.role === "installer" && user.organization
      ? { application: { installerOrganizationId: user.organization.id } }
      : {}

  const [invoices, meterReadings] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        application: { select: { reference: true, customerId: true } },
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.meterReading.findMany({
      where: user.role === "officer" ? undefined : { application: { customerId: user.id } },
    }),
  ])

  const invoiceList = invoices
    .filter((inv) => inv.type !== "monthly_bill")
    .map(mapInvoice)

  const monthlyBills = invoices
    .filter((inv) => inv.type === "monthly_bill")
    .map((inv) => {
      const reading = meterReadings.find(
        (r) =>
          r.applicationId === inv.applicationId &&
          r.year === inv.dueDate.getFullYear() &&
          r.month === inv.dueDate.getMonth() + 1,
      )

      return {
        id: inv.id,
        customerId: inv.customerId,
        applicationId: inv.application.reference,
        month: inv.dueDate.getMonth() + 1,
        year: inv.dueDate.getFullYear(),
        kwhGenerated: reading?.kwhGenerated ?? 0,
        kwhExported: reading?.kwhExported ?? 0,
        kwhImported: reading?.kwhImported ?? 0,
        amount: inv.amount,
        status: inv.status,
        createdAt: inv.createdAt,
      }
    })

  return NextResponse.json({ invoices: invoiceList, monthlyBills })
}

/* ------------------------------------------------------------------ */
/* POST /api/payments                                                  */
/* Create payment transaction + gateway intent                         */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const {
    invoiceId,
    amount,
    currency = "lkr",
    type,
    description,
    paymentMethod,
    reference,
  }: {
    invoiceId?: string
    amount?: number
    currency?: string
    type?: PaymentType
    description?: string
    paymentMethod?: string
    reference?: string
  } = body

  if (!invoiceId || !amount || !type) {
    return NextResponse.json(
      { error: "invoiceId, amount, and type are required" },
      { status: 400 },
    )
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  if (user.role === "customer" && invoice.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const intent = createSandboxPaymentIntent({
    amount,
    currency,
    description,
    metadata: {
      invoiceId,
      customerId: invoice.customerId,
      applicationId: invoice.applicationId,
      type,
    },
  })

  const transaction = await prisma.paymentTransaction.create({
    data: {
      invoiceId,
      applicationId: invoice.applicationId,
      customerId: invoice.customerId,
      type,
      amount,
      currency,
      status: PaymentStatus.requires_action,
      provider: "sandbox",
      providerIntentId: intent.id,
      clientSecret: intent.clientSecret,
      paymentMethod: paymentMethod ?? null,
      reference: reference ?? null,
      notes: null,
      receiptUrl: null,
      metadata: { description },
    },
  })

  return NextResponse.json(
    { transaction, clientSecret: intent.clientSecret },
    { status: 201 },
  )
}
