export type UserRole = "customer" | "installer" | "officer"

export interface User {
  id: string
  role: UserRole
  email: string
  name: string
  verified?: boolean
  phone?: string
  address?: string
  organizationId?: string
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
  verifiedAt?: string
  documents: string[]
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

// Demo data helpers
export function getDemoApplications(): Application[] {
  return [
    {
      id: "APP-001",
      customerId: "CUST-001",
      customerName: "John Customer",
      status: "approved",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      documents: {
        nic: "nic.pdf",
        bankDetails: "bank.pdf",
        electricityBill: "bill.pdf",
      },
      technicalDetails: {
        roofType: "Flat Concrete",
        roofArea: "50 sqm",
        monthlyConsumption: "350 kWh",
        connectionPhase: "Single Phase",
      },
    },
    {
      id: "APP-002",
      customerId: "CUST-002",
      customerName: "Jane Smith",
      status: "pending",
      createdAt: "2024-01-18",
      updatedAt: "2024-01-18",
      documents: {
        nic: "nic.pdf",
        bankDetails: "bank.pdf",
        electricityBill: "bill.pdf",
      },
      technicalDetails: {
        roofType: "Sloped Tile",
        roofArea: "75 sqm",
        monthlyConsumption: "500 kWh",
        connectionPhase: "Three Phase",
      },
    },
  ]
}

export function getDemoInstallers(): Installer[] {
  return [
    {
      id: "INS-001",
      companyName: "Solar Pro Ltd",
      email: "contact@solarpro.lk",
      phone: "+94 11 234 5678",
      address: "123 Solar Street, Colombo",
      description: "Leading solar installation company with 10+ years experience",
      registrationNumber: "REG-2024-001",
      verified: true,
      verifiedAt: "2024-01-10",
      documents: ["cert.pdf", "license.pdf"],
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
      verified: true,
      verifiedAt: "2024-01-12",
      documents: ["cert.pdf"],
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
      verified: false,
      documents: ["cert.pdf", "license.pdf"],
      rating: 0,
      completedInstallations: 0,
      packages: [],
    },
  ]
}
