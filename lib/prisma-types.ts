export type PaymentType = "authority_fee" | "installation" | "inspection" | "monthly_bill"

export type PaymentStatus = "requires_action" | "pending_review" | "succeeded" | "verified" | "rejected" | "cancelled"

export type InvoiceType = "authority_fee" | "installation" | "monthly_bill"

export type InvoiceStatus = "pending" | "paid" | "overdue"

export type MeterReadingStatus = "pending" | "verified"

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  applicationId?: string | null
  customerId: string
  type: InvoiceType
  description: string
  amount: number
  status: InvoiceStatus
  dueDate: string
  paidAt?: string | null
  lineItems?: InvoiceLineItem[] | null
  createdAt: string
  updatedAt: string
}

export interface PaymentTransaction {
  id: string
  applicationId?: string | null
  customerId: string
  invoiceId?: string | null
  type: PaymentType
  amount: number
  currency: string
  status: PaymentStatus
  provider: string
  providerIntentId?: string | null
  clientSecret?: string | null
  reference?: string | null
  paymentMethod?: string | null
  notes?: string | null
  receiptUrl?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface MonthlyBill {
  id: string
  invoiceId: string
  customerId: string
  applicationId?: string | null
  month: number
  year: number
  kwhGenerated: number
  kwhExported: number
  kwhImported: number
  netAmount: number
  createdAt: string
}

export interface MeterReading {
  id: string
  customerId: string
  applicationId?: string | null
  month: number
  year: number
  readingDate: string
  unitsConsumed: number
  unitsGenerated: number
  netUnits: number
  status: MeterReadingStatus
  notes?: string | null
  createdAt: string
  updatedAt?: string
}

export interface DatabaseSchema {
  invoices: Invoice[]
  payments: PaymentTransaction[]
  monthlyBills: MonthlyBill[]
  meterReadings: MeterReading[]
}
