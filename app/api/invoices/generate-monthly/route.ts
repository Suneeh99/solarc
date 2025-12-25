import { NextRequest, NextResponse } from "next/server"
import { generateMonthlyBills } from "@/lib/billing"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { month, year, ratePerKwh, creditRatePerKwh } = body as {
    month?: number
    year?: number
    ratePerKwh?: number
    creditRatePerKwh?: number
  }

  if (!month || !year) {
    return NextResponse.json({ error: "month and year are required" }, { status: 400 })
  }

  const results = await generateMonthlyBills({ month, year, ratePerKwh, creditRatePerKwh })
  return NextResponse.json({ monthlyBills: results })
}
