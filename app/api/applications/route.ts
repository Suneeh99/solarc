import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function mapApplication(application: any) {
  return {
    id: application.reference,
    reference: application.reference,
    status: application.status,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    customerId: application.customerId,
    customerName: application.customer?.name,
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
    bidId: application.bids?.[0]?.id,
    invoices: application.invoices,
  }
}

/* ------------------------------------------------------------------ */
/* GET /api/applications                                               */
/* ------------------------------------------------------------------ */

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let where: Record<string, unknown> = {}

  if (user.role === Role.customer) {
    where.customerId = user.id
  }

  if (user.role === Role.installer && user.organizationId) {
    where.installerOrganizationId = user.organizationId
  }

  if (user.role === Role.officer) {
    // officers see everything
    where = {}
  }

  const forbidden = requireRole(user.role, [
    Role.customer,
    Role.installer,
    Role.officer,
  ])
  if (forbidden) return forbidden

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

  return NextResponse.json({
    applications: applications.map(mapApplication),
  })
}

/* ------------------------------------------------------------------ */
/* POST /api/applications                                              */
/* ------------------------------------------------------------------ */

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.role !== Role.customer) {
    return NextResponse.json(
      { error: "Only customers can create applications" },
      { status: 403 },
    )
  }

  const body = await request.json()

  const reference =
    body.reference ||
    `APP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

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

    return NextResponse.json(
      { application: mapApplication(application) },
      { status: 201 },
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create application"

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
