import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { addMeterReading, buildDashboardPayload } from "@/lib/data/meter-readings"

export const dynamic = "force-dynamic"

const readingSchema = z.object({
  applicationId: z.string().optional(),
  deviceId: z.string().optional(),
  kWh_generated: z.number().nonnegative(),
  kWh_exported: z.number().nonnegative(),
  kWh_imported: z.number().nonnegative(),
  voltage: z.number().optional(),
  current: z.number().optional(),
  timestamp: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: "timestamp must be a valid ISO date string" }),
})

type DeviceRegistration = {
  deviceId: string
  applicationId: string
  customerId: string
  secret: string
}

const DEVICE_REGISTRY: Record<string, DeviceRegistration> = {
  "device-token-alpha": {
    deviceId: "DEV-ALPHA",
    applicationId: "APP-001",
    customerId: "CUST-001",
    secret: "alpha-signing-secret",
  },
}

type RateBucket = { count: number; resetAt: number }
const rateLimiter = new Map<string, RateBucket>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_REQUESTS = 30

function isRateLimited(key: string) {
  const now = Date.now()
  const bucket = rateLimiter.get(key)
  if (!bucket || bucket.resetAt < now) {
    rateLimiter.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  bucket.count += 1
  return bucket.count > RATE_LIMIT_REQUESTS
}

function verifySignature(secret: string, payload: string, provided: string) {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  const normalized = provided.trim().toLowerCase()
  if (expected.length !== normalized.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId") ?? undefined
  const limit = Number(searchParams.get("limit") ?? "30")
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 30

  const payload = await buildDashboardPayload(customerId, safeLimit)
  return NextResponse.json(payload)
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-device-token")
  const signature = request.headers.get("x-device-signature")

  if (!token || !signature) {
    return NextResponse.json({ error: "Missing device authentication headers" }, { status: 401 })
  }

  const device = DEVICE_REGISTRY[token]
  if (!device) {
    return NextResponse.json({ error: "Unknown device token" }, { status: 401 })
  }

  if (isRateLimited(token)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  const rawBody = await request.text()

  if (!verifySignature(device.secret, rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = readingSchema.safeParse(parsedBody)

  if (!result.success) {
    return NextResponse.json({ error: "Payload validation failed", issues: result.error.flatten() }, { status: 400 })
  }

  const reading = result.data

  const record = await addMeterReading({
    applicationId: reading.applicationId ?? device.applicationId,
    deviceId: reading.deviceId ?? device.deviceId,
    customerId: device.customerId,
    kWhGenerated: reading.kWh_generated,
    kWhExported: reading.kWh_exported,
    kWhImported: reading.kWh_imported,
    voltage: reading.voltage,
    current: reading.current,
    timestamp: new Date(reading.timestamp).toISOString(),
  })

  return NextResponse.json(
    {
      status: "accepted",
      readingId: record.id,
      receivedAt: record.createdAt,
      applicationId: record.applicationId,
    },
    { status: 202 },
  )
}
