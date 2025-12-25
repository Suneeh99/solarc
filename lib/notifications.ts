import { PaymentTransaction, Invoice } from "./prisma-types"

interface EmailPayload {
  to: string
  subject: string
  body: string
}

async function sendEmail({ to, subject, body }: EmailPayload) {
  // Placeholder for SMTP/provider integration. Logging is used to avoid failing in sandboxed environments.
  console.log("[notification] email", { to, subject, body })
}

export async function sendPaymentApprovedNotification(payment: PaymentTransaction) {
  await sendEmail({
    to: `${payment.customerId}@example.com`,
    subject: `Payment ${payment.id} approved`,
    body: `Your payment for ${payment.type} has been approved. Reference: ${payment.reference ?? payment.id}.`,
  })
}

export async function sendPaymentRejectedNotification(payment: PaymentTransaction) {
  await sendEmail({
    to: `${payment.customerId}@example.com`,
    subject: `Payment ${payment.id} rejected`,
    body: `Your payment could not be approved. Notes: ${payment.notes ?? "None provided."}`,
  })
}

export async function sendPaymentReminder(invoice: Invoice) {
  await sendEmail({
    to: `${invoice.customerId}@example.com`,
    subject: `Reminder: Invoice ${invoice.id} is pending`,
    body: `${invoice.description} is due on ${new Date(invoice.dueDate).toDateString()}. Amount: ${invoice.amount}.`,
  })
}

export async function sendInstallationUpdate(customerId: string, message: string) {
  await sendEmail({
    to: `${customerId}@example.com`,
    subject: "Installation update",
    body: message,
  })
}

export async function sendAgreementNotification(customerId: string, message: string) {
  await sendEmail({
    to: `${customerId}@example.com`,
    subject: "Agreement update",
    body: message,
  })
}
