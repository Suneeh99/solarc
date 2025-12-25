import { NextResponse } from "next/server"

import { getApprovedApplications } from "@/lib/auth"

export async function GET() {
  const applications = getApprovedApplications()
  return NextResponse.json({ applications })
}
