import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@/lib/services/auth"
import { PaymentStatus } from "@/lib/prisma"
import {
  sendPaymentApprovedNotification,
  sendPaymentRejectedNotification,
} from "@/lib/notifications"

export const dynamic = "force-dynamic"

/* ------------------------------------------------------------------ */
/* GET /api/payments/[id]                                              */
/* ------------------------------------------------------------------ */

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payment = await prisma.paymentTransaction.findUnique({
    where: { id: params.id },
    include: { invoice: true },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  if (user.role === "customer" && payment.invoice?.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ payment })
}

/* ------------------------------------------------------------------ */
/* PATCH /api/payments/[id]                                            */
/* ------------------------------------------------------------------ */

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only officers can verify or reject payments
  if (user.role !== "officer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const payment = await prisma.paymentTransaction.findUnique({
    where: { id: params.id },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  const body = await req.json()
  const { status, notes } = body as {
    status?: PaymentStatus
    notes?: string
  }

  if (!status) {
    return NextResponse.json(
      { error: "status is required" },
      { status: 400 },
    )
  }

  const updated = await prisma.paymentTransaction.update({
    where: { id: params.id },
    data: {
      status,
      notes: notes ?? payment.notes,
    },
  })

  // Sync invoice state only on successful verification
  if (
    updated.invoiceId &&
    (status === "succeeded" || status === "verified")
  ) {
    await prisma.invoice.update({
      where: { id: updated.invoiceId },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    })

    await sendPaymentApprovedNotification(updated)
  }

  if (status === "rejected") {
    await sendPaymentRejectedNotification(updated)
  }

  return NextResponse.json({ payment: updated })
}
