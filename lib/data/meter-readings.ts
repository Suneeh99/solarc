import fs from "fs/promises"
import path from "path"

export interface MeterReading {
  id: string
  customerId: string
  applicationId: string
  deviceId: string
  kWhGenerated: number
  kWhExported: number
  kWhImported: number
  voltage?: number
  current?: number
  timestamp: string
  createdAt: string
}

export interface MonthlyBillingSummary {
  month: string
  year: number
  monthIndex: number
  kWhGenerated: number
  kWhExported: number
  kWhImported: number
  netKWh: number
  amountDue: number
  credit: number
}

const STORE_PATH = path.join(process.cwd(), "data", "meter-readings.json")
const BILLING_RATE_PER_KWH = 52 // simple illustrative tariff
const EXPORT_CREDIT_PER_KWH = 30

async function ensureStore(): Promise<MeterReading[]> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8")
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as MeterReading[]
    }
    return []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.writeFile(STORE_PATH, "[]", "utf-8")
      return []
    }
    throw error
  }
}

async function writeStore(readings: MeterReading[]) {
  await fs.writeFile(STORE_PATH, JSON.stringify(readings, null, 2), "utf-8")
}

export async function getMeterReadings(customerId?: string): Promise<MeterReading[]> {
  const readings = await ensureStore()
  const filtered = customerId ? readings.filter((r) => r.customerId === customerId) : readings
  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function addMeterReading(reading: Omit<MeterReading, "id" | "createdAt">): Promise<MeterReading> {
  const readings = await ensureStore()
  const createdAt = new Date().toISOString()
  const id = `MR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const nextReading: MeterReading = {
    ...reading,
    id,
    createdAt,
  }

  readings.push(nextReading)
  await writeStore(readings)
  return nextReading
}

export async function getRecentReadings(limit = 20, customerId?: string): Promise<MeterReading[]> {
  const readings = await getMeterReadings(customerId)
  return readings.slice(0, limit)
}

export function calculateMonthlyBilling(readings: MeterReading[]): MonthlyBillingSummary[] {
  const grouped = readings.reduce<Record<string, MonthlyBillingSummary>>((acc, reading) => {
    const date = new Date(reading.timestamp)
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`
    if (!acc[key]) {
      acc[key] = {
        month: date.toLocaleString("en-US", { month: "short" }),
        year: date.getUTCFullYear(),
        monthIndex: date.getUTCMonth(),
        kWhGenerated: 0,
        kWhExported: 0,
        kWhImported: 0,
        netKWh: 0,
        amountDue: 0,
        credit: 0,
      }
    }
    acc[key].kWhGenerated += reading.kWhGenerated
    acc[key].kWhExported += reading.kWhExported
    acc[key].kWhImported += reading.kWhImported
    return acc
  }, {})

  Object.values(grouped).forEach((summary) => {
    summary.netKWh = summary.kWhImported - summary.kWhExported
    if (summary.netKWh > 0) {
      summary.amountDue = Number((summary.netKWh * BILLING_RATE_PER_KWH).toFixed(2))
      summary.credit = 0
    } else {
      summary.amountDue = 0
      summary.credit = Number((Math.abs(summary.netKWh) * EXPORT_CREDIT_PER_KWH).toFixed(2))
    }
  })

  return Object.values(grouped).sort((a, b) => {
    if (a.year === b.year) {
      return a.monthIndex - b.monthIndex
    }
    return a.year - b.year
  })
}

export function buildEnergySnapshot(readings: MeterReading[]) {
  const monthly = calculateMonthlyBilling(readings)

  const totals = readings.reduce(
    (acc, reading) => {
      acc.kWhGenerated += reading.kWhGenerated
      acc.kWhExported += reading.kWhExported
      acc.kWhImported += reading.kWhImported
      return acc
    },
    { kWhGenerated: 0, kWhExported: 0, kWhImported: 0 },
  )

  const netKWh = totals.kWhImported - totals.kWhExported
  const amountDue = netKWh > 0 ? Number((netKWh * BILLING_RATE_PER_KWH).toFixed(2)) : 0
  const credit = netKWh < 0 ? Number((Math.abs(netKWh) * EXPORT_CREDIT_PER_KWH).toFixed(2)) : 0

  return {
    totals: {
      ...totals,
      netKWh,
      amountDue,
      credit,
    },
    monthly,
  }
}

export interface DashboardPayload {
  readings: MeterReading[]
  monthly: MonthlyBillingSummary[]
  totals: {
    kWhGenerated: number
    kWhExported: number
    kWhImported: number
    netKWh: number
    amountDue: number
    credit: number
  }
}

export async function buildDashboardPayload(customerId?: string, limit = 30): Promise<DashboardPayload> {
  const allReadings = await getMeterReadings(customerId)
  const readings = allReadings.slice(0, limit)
  const snapshot = buildEnergySnapshot(allReadings)
  return {
    readings,
    monthly: snapshot.monthly,
    totals: snapshot.totals,
  }
}
