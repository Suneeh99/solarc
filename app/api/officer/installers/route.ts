import { NextResponse } from "next/server"

import { getDemoInstallers, updateInstallerStatus } from "@/lib/auth"

export async function GET() {
  const installers = getDemoInstallers()
  return NextResponse.json({ installers })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { installerId, status, rejectionReason, suspendedReason } = body || {}

  if (!installerId || !status) {
    return NextResponse.json({ error: "installerId and status are required" }, { status: 400 })
  }

  const updated = updateInstallerStatus(installerId, status, { rejectionReason, suspendedReason })
  if (!updated) {
    return NextResponse.json({ error: "Installer not found" }, { status: 404 })
  }

  return NextResponse.json({ installer: updated })
}
