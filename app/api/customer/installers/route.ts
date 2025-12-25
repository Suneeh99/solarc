import { NextResponse } from "next/server"

import { getVerifiedInstallers } from "@/lib/auth"

export async function GET() {
  const installers = getVerifiedInstallers()
  return NextResponse.json({ installers })
}
