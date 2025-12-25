import { addHours } from "date-fns"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@/lib/services/auth"

function mapBid(bid: any, applicationReference: string) {
  return {
    id: bid.id,
    applicationId: applicationReference,
    installerId: bid.organizationId,
    installerName: bid.organization?.name || "Installer",
    price: bid.price,
    proposal: bid.proposal,
    warranty: bid.warranty,
    estimatedDays: bid.estimatedDays,
    createdAt: bid.createdAt,
    status: bid.status,
  }
}

function mapSession(session: any) {
  return {
    id: session.id,
    applicationId: session.application.reference,
    customerId: session.customerId,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
    status: session.status,
    bids: session.bids.map((bid: any) =>
      mapBid(bid, session.application.reference),
    ),
  }
}

export async function GET() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sessions = await prisma.bidSession.findMany({
    where:
      user.role === "customer"
        ? { customerId: user.id }
        : user.role === "installer" && user.organization
        ? { bids: { some: { organizationId: user.organization.id } } }
        : undefined,
    include: {
      application: true,
      bids: {
        include: {
          installer: true,
          organization: true,
          package: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  })

  return NextResponse.json({
    bidSessions: sessions.map(mapSession),
  })
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const application = await prisma.application.findFirst({
    where: { reference: body.applicationId },
  })

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    )
  }

  // Customer opens or extends a bid session
  if (user.role === "customer") {
    const session = await prisma.bidSession.upsert({
      where: { applicationId: application.id },
      update: {
        status: "open",
        expiresAt: addHours(
          new Date(),
          Number(body.expiresInDays || 2) * 24,
        ),
      },
      create: {
        applicationId: application.id,
        customerId: application.customerId,
        status: "open",
        startedAt: new Date(),
        expiresAt: addHours(
          new Date(),
          Number(body.expiresInDays || 2) * 24,
        ),
      },
      include: {
        application: true,
        bids: {
          include: {
            installer: true,
            organization: true,
            package: true,
          },
        },
      },
    })

    return NextResponse.json(
      { bidSession: mapSession(session) },
      { status: 201 },
    )
  }

  // Installer submits a bid
  if (user.role !== "installer" || !user.organization) {
    return NextResponse.json(
      { error: "Only installers can submit bids" },
      { status: 403 },
    )
  }

  const session =
    (body.bidSessionId &&
      (await prisma.bidSession.findUnique({
        where: { id: body.bidSessionId },
        include: { application: true },
      }))) ||
    (await prisma.bidSession.upsert({
      where: { applicationId: application.id },
      update: {},
      create: {
        applicationId: application.id,
        customerId: application.customerId,
        status: "open",
        startedAt: new Date(),
        expiresAt: addHours(new Date(), 48),
      },
      include: { application: true },
    }))

  const bid = await prisma.bid.create({
    data: {
      applicationId: application.id,
      bidSessionId: session.id,
      installerId: user.id,
      organizationId: user.organization.id,
      packageId: body.packageId,
      price: body.price,
      proposal: body.proposal || "Installer proposal",
      warranty: body.warranty || "Standard warranty",
      estimatedDays: body.estimatedDays || 7,
      status: "pending",
    },
    include: {
      installer: true,
      organization: true,
      package: true,
    },
  })

  return NextResponse.json(
    { bid: mapBid(bid, application.reference) },
    { status: 201 },
  )
}
