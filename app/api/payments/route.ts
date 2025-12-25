import { NextRequest, NextResponse } from "next/server"
import { prisma, PaymentStatus, PaymentType } from "@/lib/prisma"
import { createSandboxPaymentIntent } from "@/lib/payment-gateway"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") as PaymentStatus | null
  const customerId = searchParams.get("customerId")

  const transactions = await prisma.paymentTransaction.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
    },
  })

  return NextResponse.json({ transactions })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { amount, currency = "lkr", customerId, applicationId, invoiceId, type, description, paymentMethod, reference } =
    body

  if (!amount || !customerId || !type) {
    return NextResponse.json({ error: "amount, customerId and type are required" }, { status: 400 })
  }

  const paymentType = type as PaymentType
  const intent = createSandboxPaymentIntent({
    amount,
    currency,
    description,
    metadata: { customerId, applicationId, invoiceId, type },
  })

  const transaction = await prisma.paymentTransaction.create({
    data: {
      applicationId: applicationId ?? null,
      customerId,
      invoiceId: invoiceId ?? null,
      type: paymentType,
      amount,
      currency,
      status: "requires_action",
      provider: "stripe",
      providerIntentId: intent.id,
      clientSecret: intent.clientSecret,
      paymentMethod: paymentMethod ?? null,
      reference: reference ?? null,
      notes: null,
      receiptUrl: null,
      metadata: { description },
    },
  })

  return NextResponse.json({ transaction, clientSecret: intent.clientSecret })
}
