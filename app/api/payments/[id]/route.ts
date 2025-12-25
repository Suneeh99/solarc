import { NextRequest, NextResponse } from "next/server"
import { prisma, PaymentStatus } from "@/lib/prisma"
import { sendPaymentApprovedNotification, sendPaymentRejectedNotification } from "@/lib/notifications"

export const dynamic = "force-dynamic"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const payment = await prisma.paymentTransaction.findUnique({ where: { id: params.id } })
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }
  return NextResponse.json({ payment })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payment = await prisma.paymentTransaction.findUnique({ where: { id: params.id } })
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  const body = await req.json()
  const { status, notes } = body as { status?: PaymentStatus; notes?: string }

  if (!status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 })
  }

  const updated = await prisma.paymentTransaction.update({
    where: { id: params.id },
    data: {
      status,
      notes: notes ?? payment.notes,
    },
  })

  if (updated?.invoiceId && (status === "succeeded" || status === "verified")) {
    await prisma.invoice.update({
      where: { id: updated.invoiceId },
      data: { status: "paid", paidAt: new Date().toISOString() },
    })
    await sendPaymentApprovedNotification(updated)
  }

  if (status === "rejected") {
    await sendPaymentRejectedNotification(updated!)
  }

  return NextResponse.json({ payment: updated })
}
