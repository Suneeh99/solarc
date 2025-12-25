import { NextResponse } from "next/server"

import { getDemoApplications, updateApplicationStatus } from "@/lib/auth"

export async function GET() {
  const applications = getDemoApplications()
  return NextResponse.json({ applications })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { applicationId, status, rejectionReason, siteVisitDate } = body || {}

  if (!applicationId || !status) {
    return NextResponse.json({ error: "applicationId and status are required" }, { status: 400 })
  }

  const updated = updateApplicationStatus(applicationId, status, { rejectionReason, siteVisitDate })
  if (!updated) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  return NextResponse.json({ application: updated })
}
