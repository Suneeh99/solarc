import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (user.role === Role.customer) {
    const apps = await prisma.application.findMany({
      where: { customerId: user.id },
      include: { bids: true, invoices: true, payments: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(apps)
  }

  if (user.role === Role.installer) {
    const apps = await prisma.application.findMany({
      where: { installerId: user.id },
      include: { bids: true, invoices: true, payments: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(apps)
  }

  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden

  const apps = await prisma.application.findMany({
    include: { bids: true, invoices: true, payments: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(apps)
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const { description, location, capacityRequested, documents, technicalDetails } = body

  const reference = `APP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const application = await prisma.application.create({
    data: {
      reference,
      customerId: user.id,
      status: "pending",
      description,
      location,
      capacityRequested,
      documents,
      technicalDetails,
    },
  })

  return NextResponse.json(application)
}
