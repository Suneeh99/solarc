import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@/lib/services/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const bid = await prisma.bid.findUnique({
    where: { id: params.id },
    include: {
      application: true,
      installer: true,
      organization: true,
      package: true,
    },
  })

  if (!bid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (user.role === "customer" && bid.application.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await prisma.bid.update({
    where: { id: params.id },
    data: {
      status: body.status ?? bid.status,
    },
    include: {
      application: true,
      installer: true,
      organization: true,
      package: true,
    },
  })

  return NextResponse.json({
    bid: {
      id: updated.id,
      applicationId: updated.application.reference,
      installerId:
        updated.organizationId || updated.installerId || "",
      installerName:
        updated.organization?.name ||
        updated.installer?.name ||
        "Installer",
      price: updated.price,
      proposal: updated.proposal,
      warranty: updated.warranty,
      estimatedDays: updated.estimatedDays,
      createdAt: updated.createdAt,
      status: updated.status,
    },
  })
}
