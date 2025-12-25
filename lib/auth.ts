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

const APPLICATIONS_KEY = "demo_applications"
const INSTALLERS_KEY = "demo_installers"
let applicationCache: Application[] | null = null
let installerCache: Installer[] | null = null

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  const cached = localStorage.getItem(key)
  if (!cached) return fallback
  try {
    return JSON.parse(cached) as T
  } catch (error) {
    console.error(`Failed to parse ${key} from storage`, error)
    return fallback
  }
}

function persistToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
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
  if (applicationCache) return applicationCache
  const fallback: Application[] = [
    {
      id: "APP-001",
      customerId: "CUST-001",
      customerName: "John Customer",
      status: "approved",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      reviewedAt: "2024-01-19",
      documents: {
        nic: {
          fileName: "john_nic.pdf",
          url: "https://example.com/docs/john-nic.pdf",
          uploadedAt: "2024-01-15T08:00:00Z",
          mimeType: "application/pdf",
          sizeKb: 220,
        },
        bankDetails: {
          fileName: "john_bank_statement.pdf",
          url: "https://example.com/docs/john-bank.pdf",
          uploadedAt: "2024-01-15T08:05:00Z",
          mimeType: "application/pdf",
          sizeKb: 540,
        },
        electricityBill: {
          fileName: "ceb_bill_december.pdf",
          url: "https://example.com/docs/john-bill.pdf",
          uploadedAt: "2024-01-15T08:10:00Z",
          mimeType: "application/pdf",
          sizeKb: 315,
        },
        propertyDocument: {
          fileName: "deed_scan.pdf",
          url: "https://example.com/docs/john-deed.pdf",
          uploadedAt: "2024-01-15T08:15:00Z",
          mimeType: "application/pdf",
          sizeKb: 825,
        },
      },
      technicalDetails: {
        roofType: "Flat Concrete",
        roofArea: "50 sqm",
        monthlyConsumption: "350 kWh",
        connectionPhase: "Single Phase",
      },
      siteVisitDate: "2024-01-18",
    },
    {
      id: "APP-002",
      customerId: "CUST-002",
      customerName: "Jane Smith",
      status: "under_review",
      createdAt: "2024-01-18",
      updatedAt: "2024-01-18",
      documents: {
        nic: {
          fileName: "jane_nic.pdf",
          url: "https://example.com/docs/jane-nic.pdf",
          uploadedAt: "2024-01-18T10:00:00Z",
        },
        bankDetails: {
          fileName: "jane_bank.pdf",
          url: "https://example.com/docs/jane-bank.pdf",
          uploadedAt: "2024-01-18T10:10:00Z",
        },
        electricityBill: {
          fileName: "jane_bill.pdf",
          url: "https://example.com/docs/jane-bill.pdf",
          uploadedAt: "2024-01-18T10:15:00Z",
        },
      },
      technicalDetails: {
        roofType: "Sloped Tile",
        roofArea: "75 sqm",
        monthlyConsumption: "500 kWh",
        connectionPhase: "Three Phase",
      },
      siteVisitDate: "2024-01-25",
    },
    {
      id: "APP-003",
      customerId: "CUST-003",
      customerName: "Mike Johnson",
      status: "rejected",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-12",
      reviewedAt: "2024-01-12",
      rejectionReason: "Missing property ownership proof",
      documents: {
        nic: {
          fileName: "mike_nic.pdf",
          url: "https://example.com/docs/mike-nic.pdf",
          uploadedAt: "2024-01-10T09:00:00Z",
        },
        bankDetails: {
          fileName: "mike_bank.pdf",
          url: "https://example.com/docs/mike-bank.pdf",
          uploadedAt: "2024-01-10T09:05:00Z",
        },
        electricityBill: {
          fileName: "mike_bill.pdf",
          url: "https://example.com/docs/mike-bill.pdf",
          uploadedAt: "2024-01-10T09:10:00Z",
        },
      },
      technicalDetails: {
        roofType: "Metal Sheet",
        roofArea: "100 sqm",
        monthlyConsumption: "800 kWh",
        connectionPhase: "Three Phase",
      },
    },
  ]

  const stored = getFromStorage<Application[]>(APPLICATIONS_KEY, fallback)
  applicationCache = stored
  return stored
}

export function getDemoInstallers(): Installer[] {
  if (installerCache) return installerCache
  const fallback: Installer[] = [
    {
      id: "INS-001",
      companyName: "Solar Pro Ltd",
      email: "contact@solarpro.lk",
      phone: "+94 11 234 5678",
      address: "123 Solar Street, Colombo",
      description: "Leading solar installation company with 10+ years experience",
      registrationNumber: "REG-2024-001",
      status: "verified",
      verified: true,
      verifiedAt: "2024-01-10T10:00:00Z",
      documents: [
        {
          fileName: "Registration Certificate",
          url: "https://example.com/docs/solar-pro-registration.pdf",
          uploadedAt: "2024-01-05T08:00:00Z",
        },
        {
          fileName: "Business License",
          url: "https://example.com/docs/solar-pro-license.pdf",
          uploadedAt: "2024-01-05T08:05:00Z",
        },
      ],
      rating: 4.8,
      completedInstallations: 150,
      packages: [
        {
          id: "PKG-001",
          installerId: "INS-001",
          name: "Basic Solar Package",
          capacity: "3 kW",
          panelCount: 8,
          panelType: "Monocrystalline",
          inverterBrand: "Huawei",
          warranty: "10 years",
          price: 450000,
          features: ["Free installation", "1 year maintenance", "Net metering setup"],
        },
        {
          id: "PKG-002",
          installerId: "INS-001",
          name: "Premium Solar Package",
          capacity: "5 kW",
          panelCount: 12,
          panelType: "Monocrystalline",
          inverterBrand: "SMA",
          warranty: "15 years",
          price: 750000,
          features: ["Free installation", "2 years maintenance", "Net metering setup", "Monitoring system"],
        },
      ],
    },
    {
      id: "INS-002",
      companyName: "Green Energy Solutions",
      email: "info@greenenergy.lk",
      phone: "+94 11 345 6789",
      address: "456 Energy Lane, Kandy",
      description: "Eco-friendly solar solutions for residential and commercial",
      registrationNumber: "REG-2024-002",
      status: "verified",
      verified: true,
      verifiedAt: "2024-01-12T12:00:00Z",
      documents: [
        {
          fileName: "Registration Certificate",
          url: "https://example.com/docs/green-energy-registration.pdf",
          uploadedAt: "2024-01-07T09:00:00Z",
        },
      ],
      rating: 4.6,
      completedInstallations: 95,
      packages: [
        {
          id: "PKG-003",
          installerId: "INS-002",
          name: "Economy Package",
          capacity: "2 kW",
          panelCount: 5,
          panelType: "Polycrystalline",
          inverterBrand: "Growatt",
          warranty: "8 years",
          price: 280000,
          features: ["Free installation", "Net metering setup"],
        },
      ],
    },
    {
      id: "INS-003",
      companyName: "SunPower Systems",
      email: "hello@sunpower.lk",
      phone: "+94 11 456 7890",
      address: "789 Renewable Road, Galle",
      description: "Premium solar installations with cutting-edge technology",
      registrationNumber: "REG-2024-003",
      status: "pending",
      verified: false,
      documents: [
        {
          fileName: "Registration Certificate",
          url: "https://example.com/docs/sunpower-registration.pdf",
          uploadedAt: "2024-01-18T11:00:00Z",
        },
        {
          fileName: "Business License",
          url: "https://example.com/docs/sunpower-license.pdf",
          uploadedAt: "2024-01-18T11:05:00Z",
        },
      ],
      rating: 0,
      completedInstallations: 0,
      packages: [],
    },
    {
      id: "INS-004",
      companyName: "Green Solar Co",
      email: "contact@greensolar.lk",
      phone: "+94 11 567 8901",
      address: "321 Sun Avenue, Matara",
      description: "Affordable solar solutions for every home",
      registrationNumber: "REG-2024-004",
      status: "rejected",
      verified: false,
      rejectionReason: "Incomplete documentation and invalid business license",
      documents: [
        {
          fileName: "Registration Certificate",
          url: "https://example.com/docs/green-solar-registration.pdf",
          uploadedAt: "2024-01-12T10:00:00Z",
        },
      ],
      rating: 0,
      completedInstallations: 0,
      packages: [],
    },
    {
      id: "INS-005",
      companyName: "Reliant Solar Partners",
      email: "info@reliantsolar.lk",
      phone: "+94 11 678 9012",
      address: "222 Coastal Road, Negombo",
      description: "Trusted EPC partner with compliance focus",
      registrationNumber: "REG-2024-005",
      status: "suspended",
      verified: false,
      suspendedReason: "Insurance coverage expired",
      documents: [
        {
          fileName: "Insurance Certificate",
          url: "https://example.com/docs/reliant-insurance.pdf",
          uploadedAt: "2024-01-08T09:30:00Z",
        },
        {
          fileName: "Business License",
          url: "https://example.com/docs/reliant-license.pdf",
          uploadedAt: "2024-01-08T09:35:00Z",
        },
      ],
      rating: 0,
      completedInstallations: 0,
      packages: [],
    },
  ]

  const stored = getFromStorage<Installer[]>(INSTALLERS_KEY, fallback)
  installerCache = stored
  return stored
}

function saveApplications(applications: Application[]) {
  applicationCache = applications
  persistToStorage(APPLICATIONS_KEY, applications)
}

function saveInstallers(installers: Installer[]) {
  installerCache = installers
  persistToStorage(INSTALLERS_KEY, installers)
}

export function updateApplicationStatus(
  applicationId: string,
  status: Application["status"],
  options?: { rejectionReason?: string; siteVisitDate?: string },
): Application | null {
  const applications = getDemoApplications()
  const index = applications.findIndex((app) => app.id === applicationId)
  if (index === -1) return null

  const updated: Application = {
    ...applications[index],
    status,
    rejectionReason: options?.rejectionReason,
    siteVisitDate: options?.siteVisitDate,
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  applications[index] = updated
  saveApplications(applications)
  return updated
}

const APPROVED_STATES: Application["status"][] = [
  "approved",
  "payment_pending",
  "payment_confirmed",
  "finding_installer",
  "installation_in_progress",
  "installation_complete",
  "final_inspection",
  "agreement_pending",
  "completed",
]

export function isApplicationApproved(app: Application) {
  return APPROVED_STATES.includes(app.status)
}

export function getApprovedApplications(): Application[] {
  return getDemoApplications().filter(isApplicationApproved)
}

export function updateInstallerStatus(
  installerId: string,
  status: InstallerStatus,
  options?: { rejectionReason?: string; suspendedReason?: string },
): Installer | null {
  const installers = getDemoInstallers()
  const index = installers.findIndex((installer) => installer.id === installerId)
  if (index === -1) return null

  const now = new Date().toISOString()
  const updated: Installer = {
    ...installers[index],
    status,
    verified: status === "verified",
    verifiedAt: status === "verified" ? now : installers[index].verifiedAt,
    rejectionReason: status === "rejected" ? options?.rejectionReason : undefined,
    suspendedReason: status === "suspended" ? options?.suspendedReason : undefined,
  }

  if (status !== "verified") {
    updated.verified = false
  }

  installers[index] = updated
  saveInstallers(installers)
  return updated
}

export function getVerifiedInstallers(): Installer[] {
  return getDemoInstallers().filter((installer) => installer.status === "verified" && installer.verified)
}
