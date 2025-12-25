import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (user.role === Role.customer) {
    const bids = await prisma.bid.findMany({
      where: { application: { customerId: user.id } },
      include: { application: true },
    })
    return NextResponse.json(bids)
  }

  if (user.role === Role.installer) {
    const bids = await prisma.bid.findMany({
      where: { installerId: user.id },
      include: { application: true },
    })
    return NextResponse.json(bids)
  }

  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden

  const bids = await prisma.bid.findMany({ include: { application: true } })
  return NextResponse.json(bids)
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const forbidden = requireRole(user.role, [Role.installer])
  if (forbidden) return forbidden

  const body = await request.json()
  const { applicationId, price, proposal, warranty, estimatedDays } = body
  const bid = await prisma.bid.create({
    data: {
      applicationId,
      installerId: user.id,
      price,
      proposal,
      warranty,
      estimatedDays,
    },
  })
  return NextResponse.json(bid)
}
