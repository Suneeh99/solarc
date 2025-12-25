import { NextResponse } from "next/server"
import { getApplications } from "@/lib/data-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") ?? undefined
  const customerId = searchParams.get("customerId") ?? undefined

  const apps = getApplications().filter((app) => {
    if (status && app.status !== status) return false
    if (customerId && app.customerId !== customerId) return false
    return true
  })

  return NextResponse.json(apps)
}
