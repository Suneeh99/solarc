import { NextResponse } from "next/server"

import { getDemoApplications } from "@/lib/auth"

export async function GET() {
  const applications = getDemoApplications()
  return NextResponse.json({ applications })
}
