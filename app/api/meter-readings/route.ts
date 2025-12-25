import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get("customerId")
  const readings = await prisma.meterReading.findMany({
    where: customerId ? { customerId } : undefined,
  })
  return NextResponse.json({ readings })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, applicationId, month, year, readingDate, unitsConsumed, unitsGenerated, status, notes } = body

  if (!customerId || !month || !year || !readingDate || unitsConsumed === undefined || unitsGenerated === undefined) {
    return NextResponse.json({ error: "customerId, month, year, readingDate, unitsConsumed and unitsGenerated are required" }, { status: 400 })
  }

  const netUnits = Number(unitsConsumed) - Number(unitsGenerated)

  const reading = await prisma.meterReading.create({
    data: {
      customerId,
      applicationId: applicationId ?? null,
      month,
      year,
      readingDate,
      unitsConsumed,
      unitsGenerated,
      netUnits,
      status: status ?? "pending",
      notes: notes ?? null,
    },
  })

  return NextResponse.json({ reading })
}
