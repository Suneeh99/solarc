import { generateId, readDb, writeDb } from "./data-store"
import {
  DatabaseSchema,
  Invoice,
  InvoiceStatus,
  InvoiceType,
  MeterReading,
  MeterReadingStatus,
  MonthlyBill,
  PaymentStatus,
  PaymentTransaction,
  PaymentType,
} from "./prisma-types"

type Where<T> = Partial<T> & { id?: string }

function matchesWhere<T extends Record<string, unknown>>(record: T, where?: Where<T>) {
  if (!where) return true
  return Object.entries(where).every(([key, value]) => {
    if (value === undefined) return true
    // @ts-ignore
    return record[key] === value
  })
}

async function updateRecord<T extends { id: string }>(
  collection: keyof DatabaseSchema,
  id: string,
  data: Partial<T>,
): Promise<T | null> {
  const db = await readDb()
  // @ts-ignore
  const items: T[] = db[collection]
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return null
  const updated = { ...items[index], ...data, updatedAt: new Date().toISOString() }
  items[index] = updated
  await writeDb(db)
  return updated
}

export const prisma = {
  invoice: {
    async findMany({ where }: { where?: Where<Invoice> } = {}) {
      const db = await readDb()
      return db.invoices.filter((invoice) => matchesWhere(invoice, where))
    },
    async findUnique({ where: { id } }: { where: { id: string } }) {
      const db = await readDb()
      return db.invoices.find((invoice) => invoice.id === id) ?? null
    },
    async create({ data }: { data: Omit<Invoice, "id" | "createdAt" | "updatedAt"> & { id?: string } }) {
      const db = await readDb()
      const newInvoice: Invoice = {
        ...data,
        id: data.id ?? generateId("inv"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      db.invoices.push(newInvoice)
      await writeDb(db)
      return newInvoice
    },
    async update({
      where: { id },
      data,
    }: {
      where: { id: string }
      data: Partial<Omit<Invoice, "id">>
    }) {
      return updateRecord<Invoice>("invoices", id, data)
    },
  },
  paymentTransaction: {
    async findMany({ where }: { where?: Where<PaymentTransaction> } = {}) {
      const db = await readDb()
      return db.payments.filter((payment) => matchesWhere(payment, where))
    },
    async findUnique({ where: { id } }: { where: { id: string } }) {
      const db = await readDb()
      return db.payments.find((payment) => payment.id === id) ?? null
    },
    async create({
      data,
    }: {
      data: Omit<PaymentTransaction, "id" | "createdAt" | "updatedAt"> & { id?: string }
    }) {
      const db = await readDb()
      const newPayment: PaymentTransaction = {
        ...data,
        id: data.id ?? generateId("pay"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      db.payments.push(newPayment)
      await writeDb(db)
      return newPayment
    },
    async update({
      where: { id },
      data,
    }: {
      where: { id: string }
      data: Partial<Omit<PaymentTransaction, "id">>
    }) {
      return updateRecord<PaymentTransaction>("payments", id, data)
    },
  },
  monthlyBill: {
    async findMany({ where }: { where?: Where<MonthlyBill> } = {}) {
      const db = await readDb()
      return db.monthlyBills.filter((bill) => matchesWhere(bill, where))
    },
    async create({ data }: { data: Omit<MonthlyBill, "id" | "createdAt"> & { id?: string } }) {
      const db = await readDb()
      const newBill: MonthlyBill = {
        ...data,
        id: data.id ?? generateId("bill"),
        createdAt: new Date().toISOString(),
      }
      db.monthlyBills.push(newBill)
      await writeDb(db)
      return newBill
    },
  },
  meterReading: {
    async findMany({ where }: { where?: Where<MeterReading> } = {}) {
      const db = await readDb()
      return db.meterReadings.filter((reading) => matchesWhere(reading, where))
    },
    async create({ data }: { data: Omit<MeterReading, "id" | "createdAt"> & { id?: string } }) {
      const db = await readDb()
      const newReading: MeterReading = {
        ...data,
        id: data.id ?? generateId("mr"),
        createdAt: new Date().toISOString(),
      }
      db.meterReadings.push(newReading)
      await writeDb(db)
      return newReading
    },
    async update({
      where: { id },
      data,
    }: {
      where: { id: string }
      data: Partial<Omit<MeterReading, "id">>
    }) {
      return updateRecord<MeterReading>("meterReadings", id, data)
    },
  },
}

export {
  PaymentType,
  PaymentStatus,
  InvoiceStatus,
  InvoiceType,
  MeterReadingStatus,
  Invoice,
  PaymentTransaction,
  MonthlyBill,
  MeterReading,
}
