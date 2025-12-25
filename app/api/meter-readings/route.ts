import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (user.role === Role.customer) {
    const readings = await prisma.meterReading.findMany({
      where: { application: { customerId: user.id } },
      orderBy: { readingDate: "desc" },
    })
    return NextResponse.json(readings)
  }

  if (user.role === Role.installer) {
    const readings = await prisma.meterReading.findMany({
      where: { application: { installerId: user.id } },
      orderBy: { readingDate: "desc" },
    })
    return NextResponse.json(readings)
  }

  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden
  const readings = await prisma.meterReading.findMany({ orderBy: { readingDate: "desc" } })
  return NextResponse.json(readings)
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden

  const body = await request.json()
  const { applicationId, readingDate, kwhGenerated, kwhExported, kwhImported, notes } = body
  const reading = await prisma.meterReading.create({
    data: {
      applicationId,
      readingDate: new Date(readingDate),
      kwhGenerated,
      kwhExported,
      kwhImported,
      notes,
    },
  })
  return NextResponse.json(reading)
}
