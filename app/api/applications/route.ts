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

export async function GET() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const where =
    user.role === "customer"
      ? { customerId: user.id }
      : user.role === "installer" && user.organization
        ? { installerOrganizationId: user.organization.id }
        : {}

  const applications = await prisma.application.findMany({
    where,
    include: {
      customer: true,
      installerOrganization: true,
      selectedPackage: true,
      bids: true,
      invoices: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ applications: applications.map(mapApplication) })
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const reference = body.reference || `APP-${Math.floor(Math.random() * 900 + 100)}`

  try {
    const application = await prisma.application.create({
      data: {
        reference,
        customerId: user.id,
        installerOrganizationId: body.installerOrganizationId,
        selectedPackageId: body.selectedPackageId,
        status: "pending",
        documents: body.documents || {},
        technicalDetails: body.technicalDetails || {},
      },
      include: {
        customer: true,
        installerOrganization: true,
        selectedPackage: true,
        bids: true,
        invoices: true,
      },
    })

    return NextResponse.json({ application: mapApplication(application) }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create application"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
