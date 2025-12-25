import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@/lib/services/auth"

function mapApplication(application: any) {
  return {
    id: application.reference,
    reference: application.reference,
    status: application.status,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    customerId: application.customerId,
    customerName: application.customer.name,
    documents: application.documents,
    technicalDetails: application.technicalDetails,
    siteVisitDate: application.siteVisitDate,
    rejectionReason: application.rejectionReason,
    selectedInstaller: application.installerOrganization
      ? {
        id: application.installerOrganization.id,
        name: application.installerOrganization.name,
        packageName: application.selectedPackage?.name,
        price: application.selectedPackage?.price,
      }
      : undefined,
    bidId: application.bids[0]?.id,
    invoices: application.invoices,
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const application = await prisma.application.findFirst({
    where: { reference: params.id },
    include: {
      customer: true,
      installerOrganization: true,
      selectedPackage: true,
      bids: true,
      invoices: true,
    },
  })

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (user.role === "customer" && application.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ application: mapApplication(application) })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const application = await prisma.application.findFirst({
    where: { reference: params.id },
    include: { customer: true, installerOrganization: true, selectedPackage: true, bids: true, invoices: true },
  })

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (user.role === "customer" && application.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: {
      status: body.status || application.status,
      siteVisitDate: body.siteVisitDate ? new Date(body.siteVisitDate) : application.siteVisitDate,
      rejectionReason: body.rejectionReason ?? application.rejectionReason,
      installerOrganizationId: body.installerOrganizationId ?? application.installerOrganizationId,
      selectedPackageId: body.selectedPackageId ?? application.selectedPackageId,
    },
    include: { customer: true, installerOrganization: true, selectedPackage: true, bids: true, invoices: true },
  })

  return NextResponse.json({ application: mapApplication(updated) })
}
