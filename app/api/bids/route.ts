import { NextResponse } from "next/server"
import { createBidSession, listBidSessions } from "@/lib/data-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId") ?? undefined
  const sessions = listBidSessions({ customerId })
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { applicationId, customerId, durationHours, requirements, maxBudget, bidType } = body

  if (!applicationId || !customerId) {
    return NextResponse.json({ error: "applicationId and customerId are required" }, { status: 400 })
  }

  try {
    const session = createBidSession({
      applicationId,
      customerId,
      durationHours: durationHours ? Number(durationHours) : undefined,
      requirements,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      bidType,
    })
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create bid session"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
