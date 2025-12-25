import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@/lib/services/auth"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { application: { select: { reference: true, customerId: true } } },
  })

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (user.role === "customer" && invoice.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      status: body.status || invoice.status,
      paidAt: body.status === "paid" ? new Date() : invoice.paidAt,
    },
    include: { application: { select: { reference: true, customerId: true } } },
  })

  return NextResponse.json({
    invoice: {
      id: updated.id,
      applicationId: updated.application.reference,
      customerId: updated.customerId,
      amount: updated.amount,
      status: updated.status,
      type: updated.type,
      description: updated.description,
      createdAt: updated.createdAt,
      dueDate: updated.dueDate,
      paidAt: updated.paidAt,
    },
  })
}
