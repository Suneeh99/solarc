import { prisma } from "./prisma"
import { Invoice, MeterReading, MonthlyBill } from "./prisma-types"

interface MonthlyBillInput {
  month: number
  year: number
  ratePerKwh?: number
  creditRatePerKwh?: number
}

function computeAmount(reading: MeterReading, ratePerKwh: number, creditRatePerKwh: number) {
  const netUnits = reading.netUnits
  if (netUnits >= 0) {
    return netUnits * ratePerKwh
  }
  return netUnits * creditRatePerKwh
}

export async function generateMonthlyBills(input: MonthlyBillInput) {
  const { month, year, ratePerKwh = 30, creditRatePerKwh = 25 } = input
  const readings = await prisma.meterReading.findMany({ where: { month, year, status: "verified" } })
  const created: { bill: MonthlyBill; invoice: Invoice }[] = []

  for (const reading of readings) {
    const amount = computeAmount(reading, ratePerKwh, creditRatePerKwh)
    const dueDate = new Date(reading.readingDate)
    dueDate.setDate(dueDate.getDate() + 14)

    const invoice = await prisma.invoice.create({
      data: {
        applicationId: reading.applicationId ?? null,
        customerId: reading.customerId,
        type: "monthly_bill",
        description: `${new Date(reading.readingDate).toLocaleString("default", { month: "long" })} Net Metering Bill`,
        amount,
        status: "pending",
        dueDate: dueDate.toISOString(),
        paidAt: null,
        lineItems: [
          {
            description: `Net energy ${reading.netUnits >= 0 ? "import" : "export"} (${reading.netUnits} kWh)`,
            quantity: 1,
            unitPrice: amount,
            total: amount,
          },
        ],
      },
    })

    const bill = await prisma.monthlyBill.create({
      data: {
        invoiceId: invoice.id,
        customerId: reading.customerId,
        applicationId: reading.applicationId ?? null,
        month,
        year,
        kwhGenerated: reading.unitsGenerated,
        kwhExported: Math.max(0, -reading.netUnits),
        kwhImported: Math.max(0, reading.netUnits),
        netAmount: amount,
      },
    })

    created.push({ bill, invoice })
  }

  return created
}
