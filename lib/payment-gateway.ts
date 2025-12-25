import { randomUUID } from "crypto"
import { PaymentTransaction } from "./prisma-types"

interface PaymentIntentInput {
  amount: number
  currency: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  description?: string
  metadata?: Record<string, unknown>
}

export function createSandboxPaymentIntent(input: PaymentIntentInput): PaymentIntent {
  const id = `pi_test_${randomUUID()}`
  const clientSecret = `cs_test_${randomUUID()}`
  return { id, clientSecret, ...input }
}

export function buildReceiptUrl(transaction: PaymentTransaction) {
  return `/receipts/${transaction.id}.pdf`
}
