import { Application, Installer } from "./auth"

type InstallerStatus = "pending" | "verified" | "rejected" | "suspended"

type UpdateInstallerPayload = {
  reason?: string
  documentLinks?: { name: string; url: string }[]
}

type ApplicationAction = "approve" | "reject" | "schedule_visit"

type UpdateApplicationPayload = {
  reason?: string
  siteVisitDate?: string
}

let installers: Installer[] = [
  {
    id: "INS-001",
    companyName: "Solar Pro Ltd",
    email: "contact@solarpro.lk",
    phone: "+94 11 234 5678",
    address: "123 Solar Street, Colombo",
    description: "Leading solar installation company with 10+ years experience",
    registrationNumber: "REG-2024-001",
    verified: true,
    status: "verified",
    verifiedAt: "2024-01-10",
    documents: ["Registration Certificate", "Business License", "Insurance Certificate"],
    documentLinks: [
      { name: "Registration Certificate", url: "/docs/solarpro/registration.pdf" },
      { name: "Business License", url: "/docs/solarpro/license.pdf" },
      { name: "Insurance Certificate", url: "/docs/solarpro/insurance.pdf" },
    ],
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
    rating: 4.8,
    completedInstallations: 150,
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
    status: "verified",
    verifiedAt: "2024-01-12",
    documents: ["Registration Certificate", "Business License"],
    documentLinks: [
      { name: "Registration Certificate", url: "/docs/greenenergy/registration.pdf" },
      { name: "Business License", url: "/docs/greenenergy/license.pdf" },
    ],
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
    rating: 4.6,
    completedInstallations: 95,
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
    status: "pending",
    documents: ["Registration Certificate", "Business License", "Technical Certifications"],
    documentLinks: [
      { name: "Registration Certificate", url: "/docs/sunpower/registration.pdf" },
      { name: "Business License", url: "/docs/sunpower/license.pdf" },
      { name: "Technical Certifications", url: "/docs/sunpower/technical.pdf" },
    ],
    packages: [],
    rating: 0,
    completedInstallations: 0,
  },
  {
    id: "INS-004",
    companyName: "Green Solar Co",
    email: "contact@greensolar.lk",
    phone: "+94 11 567 8901",
    address: "321 Sun Avenue, Matara",
    description: "Affordable solar solutions for every home",
    registrationNumber: "REG-2024-004",
    verified: false,
    status: "pending",
    documents: ["Registration Certificate"],
    documentLinks: [{ name: "Registration Certificate", url: "/docs/greensolar/registration.pdf" }],
    packages: [],
    rating: 0,
    completedInstallations: 0,
  },
  {
    id: "INS-005",
    companyName: "Rejected Solar Inc",
    email: "info@rejected.lk",
    phone: "+94 11 678 9012",
    address: "999 Failed Street, Colombo",
    description: "Solar company with incomplete documentation",
    registrationNumber: "REG-2024-005",
    verified: false,
    status: "rejected",
    rejectionReason: "Incomplete documentation and invalid business license",
    documents: ["Registration Certificate"],
    documentLinks: [{ name: "Registration Certificate", url: "/docs/rejected/registration.pdf" }],
    packages: [],
    rating: 0,
    completedInstallations: 0,
  },
]

let applications: Application[] = [
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
    siteVisitDate: "2024-01-22",
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
  {
    id: "APP-003",
    customerId: "CUST-003",
    customerName: "Sam Taylor",
    status: "site_visit_scheduled",
    createdAt: "2024-01-17",
    updatedAt: "2024-01-19",
    siteVisitDate: "2024-01-25",
    documents: {
      nic: "nic.pdf",
      bankDetails: "bank.pdf",
      electricityBill: "bill.pdf",
    },
    technicalDetails: {
      roofType: "Metal Sheet",
      roofArea: "100 sqm",
      monthlyConsumption: "800 kWh",
      connectionPhase: "Three Phase",
    },
  },
]

function cloneInstaller(installer: Installer): Installer {
  return JSON.parse(JSON.stringify(installer))
}

function cloneApplication(application: Application): Application {
  return JSON.parse(JSON.stringify(application))
}

export function getInstallers(filter?: { status?: InstallerStatus; verified?: boolean }) {
  let data = installers
  if (filter?.status) {
    data = data.filter((installer) => installer.status === filter.status)
  }
  if (typeof filter?.verified === "boolean") {
    data = data.filter((installer) => installer.verified === filter.verified)
  }
  return data.map(cloneInstaller)
}

export function updateInstallerStatus(
  installerId: string,
  action: "approve" | "reject" | "suspend",
  payload: UpdateInstallerPayload = {},
) {
  const installer = installers.find((i) => i.id === installerId)
  if (!installer) {
    throw new Error("Installer not found")
  }

  const now = new Date().toISOString()

  switch (action) {
    case "approve":
      installer.status = "verified"
      installer.verified = true
      installer.verifiedAt = now
      if (payload.documentLinks) {
        installer.documentLinks = payload.documentLinks
      }
      installer.rejectionReason = undefined
      installer.suspensionReason = undefined
      break
    case "reject":
      installer.status = "rejected"
      installer.verified = false
      installer.rejectionReason = payload.reason || ""
      installer.suspensionReason = undefined
      break
    case "suspend":
      installer.status = "suspended"
      installer.verified = false
      installer.suspensionReason = payload.reason || ""
      break
    default:
      throw new Error("Invalid installer action")
  }

  return cloneInstaller(installer)
}

export function getApplications(filter?: { status?: Application["status"] }) {
  const data = filter?.status ? applications.filter((app) => app.status === filter.status) : applications
  return data.map(cloneApplication)
}

export function updateApplicationStatus(
  applicationId: string,
  action: ApplicationAction,
  payload: UpdateApplicationPayload = {},
) {
  const application = applications.find((app) => app.id === applicationId)
  if (!application) {
    throw new Error("Application not found")
  }

  const now = new Date().toISOString()

  switch (action) {
    case "approve":
      application.status = "approved"
      application.updatedAt = now
      application.rejectionReason = undefined
      break
    case "reject":
      application.status = "rejected"
      application.updatedAt = now
      application.rejectionReason = payload.reason || ""
      break
    case "schedule_visit":
      if (!payload.siteVisitDate) {
        throw new Error("Site visit date is required")
      }
      application.status = "site_visit_scheduled"
      application.siteVisitDate = payload.siteVisitDate
      application.updatedAt = now
      break
    default:
      throw new Error("Invalid application action")
  }

  return cloneApplication(application)
}

export function getApprovedApplications() {
  return getApplications({ status: "approved" })
}
