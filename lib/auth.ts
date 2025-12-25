/* ------------------------------------------------------------------ */
/* Core domain types                                                    */
/* ------------------------------------------------------------------ */

export type UserRole = "customer" | "installer" | "officer"

export interface User {
  id: string
  role: UserRole
  email: string
  name: string
  verified?: boolean
  phone?: string
  address?: string
  createdAt?: string
  organization?: {
    id: string
    name: string
  } | null
}

export type InstallerStatus = "pending" | "verified" | "rejected" | "suspended"

export interface DocumentMeta {
  fileName: string
  url: string
  uploadedAt: string
  mimeType?: string
  sizeKb?: number
}

export interface Application {
  id: string
  reference?: string
  customerId: string
  customerName: string
  status:
    | "pending"
    | "under_review"
    | "site_visit_scheduled"
    | "approved"
    | "rejected"
    | "payment_pending"
    | "payment_confirmed"
    | "finding_installer"
    | "installation_in_progress"
    | "installation_complete"
    | "final_inspection"
    | "agreement_pending"
    | "completed"
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  siteVisitDate?: string
  rejectionReason?: string
  documents: {
    nic?: DocumentMeta
    bankDetails?: DocumentMeta
    electricityBill?: DocumentMeta
    propertyDocument?: DocumentMeta
  }
  technicalDetails: {
    roofType: string
    roofArea: string
    monthlyConsumption: string
    connectionPhase: string
  }
  selectedInstaller?: {
    id: string
    name: string
    packageName?: string
    price?: number
  }
  bidId?: string
  invoices?: Invoice[]
}

export interface Installer {
  id: string
  companyName: string
  email: string
  phone: string
  address: string
  description: string
  registrationNumber: string
  status: InstallerStatus
  verified: boolean
  verifiedAt?: string
  rejectionReason?: string
  suspendedReason?: string
  documents: DocumentMeta[]
  packages: SolarPackage[]
  rating: number
  completedInstallations: number
}

export interface SolarPackage {
  id: string
  installerId: string
  name: string
  capacity: string
  panelCount: number
  panelType: string
  inverterBrand: string
  warranty: string
  price: number
  features: string[]
}

export interface Bid {
  id: string
  applicationId: string
  installerId: string
  installerName: string
  price: number
  proposal: string
  warranty: string
  estimatedDays: number
  createdAt: string
  status: "pending" | "accepted" | "rejected" | "expired"
}

export interface BidSession {
  id: string
  applicationId: string
  customerId: string
  startedAt: string
  expiresAt: string
  status: "open" | "closed" | "expired"
  bids: Bid[]
  selectedBidId?: string
}

export interface Invoice {
  id: string
  applicationId: string
  customerId: string
  customerName?: string
  type: "authority_fee" | "installation" | "monthly_bill"
  amount: number
  status: "pending" | "paid" | "overdue"
  createdAt: string
  paidAt?: string
  dueDate: string
  description: string
  paymentId?: string
  meterReadingId?: string
  pdfUrl?: string
  channel?: "email" | "sms" | "in_app"
  nextAction?: string
}

export interface MonthlyBill {
  id: string
  customerId: string
  applicationId: string
  month: number
  year: number
  kwhGenerated: number
  kwhExported: number
  kwhImported: number
  amount: number
  status: "pending" | "paid" | "overdue" | "credited"
  createdAt: string
  meterReadingId?: string
  invoiceId?: string
  pdfUrl?: string
}

/* ------------------------------------------------------------------ */
/* API helpers                                                          */
/* ------------------------------------------------------------------ */

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = (data as any)?.error || response.statusText
    throw new Error(message || "Request failed")
  }
  return response.json() as Promise<T>
}

/* ------------------------------------------------------------------ */
/* Auth                                                                 */
/* ------------------------------------------------------------------ */

export async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch("/api/auth/me", { cache: "no-store" })
  if (response.status === 401) return null
  const data = await handleResponse<{ user: User }>(response)
  return data.user
}

export async function login(payload: {
  email: string
  password: string
}) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await handleResponse<{ user: User }>(response)
  return data.user
}

export async function register(payload: {
  role: UserRole
  email: string
  password: string
  name: string
  phone?: string
  address?: string
  companyName?: string
  registrationNumber?: string
  description?: string
}) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await handleResponse<{ user: User }>(response)
  return data.user
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" })
}

/* ------------------------------------------------------------------ */
/* Data fetchers                                                        */
/* ------------------------------------------------------------------ */

export async function fetchApplications(): Promise<Application[]> {
  const response = await fetch("/api/applications", { cache: "no-store" })
  const data = await handleResponse<{ applications: Application[] }>(response)
  return data.applications
}

export async function fetchApplication(
  reference: string,
): Promise<Application | null> {
  const response = await fetch(`/api/applications/${reference}`, {
    cache: "no-store",
  })
  if (response.status === 404) return null
  const data = await handleResponse<{ application: Application }>(response)
  return data.application
}

export async function fetchInstallers(
  verifiedOnly = true,
): Promise<Installer[]> {
  const url = verifiedOnly
    ? "/api/installers?verified=true"
    : "/api/installers"

  const response = await fetch(url, { cache: "no-store" })
  const data = await handleResponse<{ installers: Installer[] }>(response)
  return data.installers
}

export async function fetchBidSessions(): Promise<BidSession[]> {
  const response = await fetch("/api/bids", { cache: "no-store" })
  const data = await handleResponse<{ bidSessions: BidSession[] }>(response)
  return data.bidSessions
}

export async function fetchPayments(): Promise<{
  invoices: Invoice[]
  monthlyBills: MonthlyBill[]
}> {
  const response = await fetch("/api/payments", { cache: "no-store" })
  return handleResponse(response)
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users", { cache: "no-store" })
  const data = await handleResponse<{ users: User[] }>(response)
  return data.users
}

export function getDemoInvoices(): Invoice[] {
  return [
    {
      id: "INV-AUTH-001",
      applicationId: "APP-001",
      customerId: "CUST-001",
      type: "authority_fee",
      amount: 25000,
      status: "pending",
      createdAt: "2024-01-20",
      dueDate: "2024-02-03",
      description: "Authority fee invoice for grid connection approval",
      paymentId: "PAY-AUTH-001",
      pdfUrl: "/pdfs/invoice-auth-001.pdf",
      channel: "email",
      nextAction: "Awaiting receipt verification to unlock installation",
    },
    {
      id: "INV-INST-002",
      applicationId: "APP-002",
      customerId: "CUST-002",
      type: "installation",
      amount: 850000,
      status: "paid",
      createdAt: "2024-01-15",
      paidAt: "2024-01-18",
      dueDate: "2024-01-22",
      description: "Installation milestone invoice for premium package",
      paymentId: "PAY-002",
      pdfUrl: "/pdfs/invoice-installation-002.pdf",
      channel: "email",
    },
    {
      id: "INV-BILL-2024-01",
      applicationId: "APP-001",
      customerId: "CUST-001",
      type: "monthly_bill",
      amount: -3200,
      status: "paid",
      createdAt: "2024-02-01",
      paidAt: "2024-02-05",
      dueDate: "2024-02-10",
      description: "Net metering statement - January 2024 (credit)",
      meterReadingId: "MR-001",
      pdfUrl: "/pdfs/bill-2024-01.pdf",
      channel: "email",
    },
    {
      id: "INV-BILL-2024-02",
      applicationId: "APP-001",
      customerId: "CUST-001",
      type: "monthly_bill",
      amount: 2100,
      status: "pending",
      createdAt: "2024-03-01",
      dueDate: "2024-03-15",
      description: "Net metering statement - February 2024",
      meterReadingId: "MR-002",
      pdfUrl: "/pdfs/bill-2024-02.pdf",
      channel: "email",
      nextAction: "Auto-reminder scheduled 3 days before due date",
    },
  ]
}

export function getDemoMonthlyBills(): MonthlyBill[] {
  return [
    {
      id: "BILL-001",
      customerId: "CUST-001",
      applicationId: "APP-001",
      month: "January",
      year: 2024,
      kwhGenerated: 420,
      kwhExported: 280,
      kwhImported: 120,
      amount: -3200,
      status: "paid",
      createdAt: "2024-02-01",
      meterReadingId: "MR-001",
      invoiceId: "INV-BILL-2024-01",
      pdfUrl: "/pdfs/bill-2024-01.pdf",
    },
    {
      id: "BILL-002",
      customerId: "CUST-001",
      applicationId: "APP-001",
      month: "February",
      year: 2024,
      kwhGenerated: 395,
      kwhExported: 250,
      kwhImported: 180,
      amount: 2100,
      status: "pending",
      createdAt: "2024-03-01",
      meterReadingId: "MR-002",
      invoiceId: "INV-BILL-2024-02",
      pdfUrl: "/pdfs/bill-2024-02.pdf",
    },
  ]
}
