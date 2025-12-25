export type UserRole = "customer" | "installer" | "officer"

export interface User {
  id?: string
  role: UserRole
  email: string
  name: string
  verified?: boolean
  phone?: string
  address?: string
}

export interface Application {
  id: string
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
  siteVisitDate?: string
  rejectionReason?: string
  documents: {
    nic?: string
    bankDetails?: string
    electricityBill?: string
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
    packageName: string
    price: number
  }
  bidId?: string
}

export interface Installer {
  id: string
  companyName: string
  email: string
  phone: string
  address: string
  description: string
  registrationNumber: string
  verified: boolean
  status?: "pending" | "verified" | "rejected" | "suspended"
  verifiedAt?: string
  rejectionReason?: string
  suspensionReason?: string
  documents: string[]
  documentLinks?: { name: string; url: string }[]
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
}

export interface Invoice {
  id: string
  applicationId: string
  customerId: string
  type: "authority_fee" | "installation" | "monthly_bill"
  amount: number
  status: "pending" | "paid" | "overdue"
  createdAt: string
  paidAt?: string
  dueDate: string
  description: string
}

export interface MonthlyBill {
  id: string
  customerId: string
  applicationId: string
  month: string
  year: number
  kwhGenerated: number
  kwhExported: number
  kwhImported: number
  amount: number
  status: "pending" | "paid"
  createdAt: string
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem("user")
  window.location.href = "/login"
}

// Demo data helpers
export function getDemoApplications(): Application[] {
  const { getApplications } = require("./data") as typeof import("./data")
  return getApplications()
}

export function getDemoInstallers(): Installer[] {
  const { getInstallers } = require("./data") as typeof import("./data")
  return getInstallers()
}

export function getApprovedApplications(): Application[] {
  const { getApprovedApplications } = require("./data") as typeof import("./data")
  return getApprovedApplications()
}
