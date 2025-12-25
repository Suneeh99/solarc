import { NextResponse } from "next/server"
import { submitBidProposal } from "@/lib/data-store"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { installerId, installerName, price, proposal, warranty, estimatedDays, packageName, contact, message } = body

  if (!installerId || !installerName || !price || !proposal || !warranty || !estimatedDays) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const bid = submitBidProposal({
      sessionId: params.id,
      installerId,
      installerName,
      price: Number(price),
      proposal,
      warranty,
      estimatedDays: Number(estimatedDays),
      packageName,
      contact,
      message,
    })
    return NextResponse.json(bid, { status: 201 })
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unable to submit proposal"
    return NextResponse.json({ error: messageText }, { status: 400 })
  }
}
