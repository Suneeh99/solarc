import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } })
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  const payments = await prisma.paymentTransaction.findMany({ where: { invoiceId: params.id } })
  const monthlyBill = (await prisma.monthlyBill.findMany({ where: { invoiceId: params.id } }))[0] ?? null

  return NextResponse.json({ invoice, payments, monthlyBill })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } })
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  const body = await req.json()
  const { status, paidAt } = body as { status?: string; paidAt?: string }

  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      status: status ?? invoice.status,
      paidAt: paidAt ?? invoice.paidAt,
    },
  })

  return NextResponse.json({ invoice: updated })
}
