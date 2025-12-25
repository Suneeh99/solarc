import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPaymentApprovedNotification } from "@/lib/notifications"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { providerIntentId, status } = body as { providerIntentId?: string; status?: string }

  if (!providerIntentId) {
    return NextResponse.json({ error: "providerIntentId is required" }, { status: 400 })
  }

  const payment = (await prisma.paymentTransaction.findMany({ where: { providerIntentId } }))[0]
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  let invoiceId = payment.invoiceId
  if (!invoiceId) {
    const invoiceType =
      payment.type === "installation"
        ? "installation"
        : payment.type === "monthly_bill"
          ? "monthly_bill"
          : "authority_fee"
    const invoice = await prisma.invoice.create({
      data: {
        customerId: payment.customerId,
        applicationId: payment.applicationId ?? null,
        amount: payment.amount,
        type: invoiceType,
        description: `Auto-created for ${payment.type} payment ${payment.id}`,
        status: "pending",
        dueDate: new Date().toISOString(),
        paidAt: null,
        lineItems: [
          {
            description: `Auto generated from payment ${payment.id}`,
            quantity: 1,
            unitPrice: payment.amount,
            total: payment.amount,
          },
        ],
      },
    })
    invoiceId = invoice.id
  }

  const nextStatus = status === "verified" ? "verified" : "succeeded"
  const updated = await prisma.paymentTransaction.update({
    where: { id: payment.id },
    data: { status: nextStatus, invoiceId },
  })

  if (updated?.invoiceId) {
    await prisma.invoice.update({
      where: { id: updated.invoiceId },
      data: { status: "paid", paidAt: new Date().toISOString() },
    })
  }

  if (updated) {
    await sendPaymentApprovedNotification(updated)
  }

  return NextResponse.json({ payment: updated })
}
