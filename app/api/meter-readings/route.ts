import { NextRequest, NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

export const dynamic = "force-dynamic"

/* ------------------------------------------------------------------ */
/* GET /api/meter-readings                                             */
/* ------------------------------------------------------------------ */

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.role === Role.customer) {
    const readings = await prisma.meterReading.findMany({
      where: { application: { customerId: user.id } },
      orderBy: { readingDate: "desc" },
    })
    return NextResponse.json({ readings })
  }

  if (user.role === Role.installer) {
    const readings = await prisma.meterReading.findMany({
      where: { application: { installerId: user.id } },
      orderBy: { readingDate: "desc" },
    })
    return NextResponse.json({ readings })
  }

  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden

  const readings = await prisma.meterReading.findMany({
    orderBy: { readingDate: "desc" },
  })

  return NextResponse.json({ readings })
}

/* ------------------------------------------------------------------ */
/* POST /api/meter-readings                                            */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const forbidden = requireRole(user.role, [Role.officer])
  if (forbidden) return forbidden

  const body = await req.json()
  const {
    applicationId,
    readingDate,
    kwhGenerated,
    kwhExported,
    kwhImported,
    notes,
  } = body as {
    applicationId?: string
    readingDate?: string
    kwhGenerated?: number
    kwhExported?: number
    kwhImported?: number
    notes?: string
  }

  if (
    !applicationId ||
    !readingDate ||
    kwhGenerated === undefined ||
    kwhExported === undefined ||
    kwhImported === undefined
  ) {
    return NextResponse.json(
      {
        error:
          "applicationId, readingDate, kwhGenerated, kwhExported, and kwhImported are required",
      },
      { status: 400 },
    )
  }

  const netUnits = Number(kwhImported) - Number(kwhExported)

  const reading = await prisma.meterReading.create({
    data: {
      applicationId,
      readingDate: new Date(readingDate),
      kwhGenerated,
      kwhExported,
      kwhImported,
      netUnits,
      notes: notes ?? null,
      status: "pending",
    },
  })

  return NextResponse.json({ reading }, { status: 201 })
}
