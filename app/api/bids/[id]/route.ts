import { NextResponse } from "next/server"
import { getBidSessionById, updateBidDecision } from "@/lib/data-store"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = getBidSessionById(params.id)
  if (!session) {
    return NextResponse.json({ error: "Bid session not found" }, { status: 404 })
  }
  return NextResponse.json(session)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { action, bidId } = body

  if (!action || !bidId) {
    return NextResponse.json({ error: "action and bidId are required" }, { status: 400 })
  }
  if (!["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  try {
    const session = updateBidDecision(params.id, bidId, action)
    return NextResponse.json(session)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update bid decision"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
