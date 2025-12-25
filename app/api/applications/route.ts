import { NextResponse } from "next/server"

import { getApplications, updateApplicationStatus } from "@/lib/data"

export async function GET() {
  return NextResponse.json({ applications: getApplications() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { applicationId, action, reason, siteVisitDate } = body

    if (!applicationId || !action) {
      return NextResponse.json({ error: "applicationId and action are required" }, { status: 400 })
    }

    if (!["approve", "reject", "schedule_visit"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const application = updateApplicationStatus(applicationId, action, { reason, siteVisitDate })

    return NextResponse.json({ application })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
