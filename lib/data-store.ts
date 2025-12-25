import type { Application, Bid, BidSession, Installer, Notification } from "./types"
import { getDemoApplications, getDemoInstallers } from "./seed"

const db = {
  applications: seedApplications(),
  installers: seedInstallers(),
  bidSessions: seedBidSessions(),
  notifications: [] as Notification[],
}
syncSessionsWithApplications()

function seedApplications(): Application[] {
  return getDemoApplications()
}

function seedInstallers(): Installer[] {
  return getDemoInstallers()
}

function seedBidSessions(): BidSession[] {
  const now = new Date()
  const twoDays = 1000 * 60 * 60 * 48
  return [
    {
      id: "BID-001",
      applicationId: "APP-001",
      customerId: "CUST-001",
      startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(),
      expiresAt: new Date(now.getTime() + twoDays).toISOString(),
      status: "open",
      bidType: "open",
      requirements: "Looking for premium panels and remote monitoring.",
      maxBudget: 1500000,
      bids: [
        {
          id: "B-001",
          applicationId: "APP-001",
          installerId: "INS-001",
          installerName: "Solar Pro Ltd",
          price: 1280000,
          proposal: "Premium 5kW package with Huawei inverter",
          warranty: "12 years",
          estimatedDays: 10,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
          status: "pending",
          packageName: "Premium Solar Package",
          contact: { email: "bids@solarpro.lk", phone: "+94 11 234 5678" },
          installerRating: 4.8,
          completedProjects: 150,
        },
        {
          id: "B-002",
          applicationId: "APP-001",
          installerId: "INS-002",
          installerName: "Green Energy Solutions",
          price: 1200000,
          proposal: "Standard 5kW kit with monitoring",
          warranty: "10 years",
          estimatedDays: 12,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
          status: "pending",
          packageName: "Standard Solar Package",
          contact: { email: "sales@greenenergy.lk", phone: "+94 11 345 6789" },
          installerRating: 4.6,
          completedProjects: 95,
        },
      ],
      applicationDetails: {
        address: "123 Solar Lane, Colombo 07",
        capacity: "5 kW",
      },
    },
    {
      id: "BID-002",
      applicationId: "APP-004",
      customerId: "CUST-001",
      startedAt: new Date(now.getTime() - twoDays).toISOString(),
      expiresAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      status: "closed",
      bidType: "specific",
      requirements: "Need quick turnaround",
      maxBudget: 1800000,
      selectedBidId: "B-003",
      bids: [
        {
          id: "B-003",
          applicationId: "APP-004",
          installerId: "INS-001",
          installerName: "Solar Pro Ltd",
          price: 1650000,
          proposal: "8kW premium kit with expedited installation",
          warranty: "12 years",
          estimatedDays: 8,
          createdAt: new Date(now.getTime() - twoDays + 1000 * 60 * 60).toISOString(),
          status: "accepted",
          packageName: "Enterprise Package",
          contact: { email: "bids@solarpro.lk", phone: "+94 11 234 5678" },
          installerRating: 4.8,
          completedProjects: 150,
        },
      ],
      applicationDetails: {
        address: "321 Energy Street, Negombo",
        capacity: "8 kW",
      },
    },
  ]
}

function clone<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value))
  }
}

export function getApplications() {
  return clone(db.applications)
}

export function getInstallers() {
  return clone(db.installers)
}

export function listBidSessions(filter?: { customerId?: string }) {
  applyExpiry()
  const sessions = db.bidSessions.filter((session) => {
    if (filter?.customerId && session.customerId !== filter.customerId) return false
    return true
  })
  return clone(sessions)
}

export function getBidSessionById(id: string) {
  applyExpiry()
  const session = db.bidSessions.find((item) => item.id === id)
  return session ? clone(session) : null
}

export function createBidSession(options: {
  applicationId: string
  customerId: string
  durationHours?: number
  requirements?: string
  maxBudget?: number
  bidType?: "open" | "specific"
}) {
  const application = db.applications.find((app) => app.id === options.applicationId)
  if (!application) throw new Error("Application not found")

  const now = new Date()
  const durationMs = (options.durationHours ?? 48) * 60 * 60 * 1000

  const session: BidSession = {
    id: `BID-${(db.bidSessions.length + 1).toString().padStart(3, "0")}`,
    applicationId: options.applicationId,
    customerId: options.customerId,
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + durationMs).toISOString(),
    status: "open",
    bidType: options.bidType ?? "open",
    requirements: options.requirements,
    maxBudget: options.maxBudget,
    bids: [],
    applicationDetails: {
      address: application.siteAddress,
      capacity: application.systemCapacity,
    },
  }

  db.bidSessions.unshift(session)
  application.status = "finding_installer"
  application.bidId = session.id

  addNotification(application.customerId, `Bid session ${session.id} opened for ${application.id}`)

  return clone(session)
}

export function submitBidProposal(input: {
  sessionId: string
  installerId: string
  installerName: string
  price: number
  proposal: string
  warranty: string
  estimatedDays: number
  packageName?: string
  contact?: Bid["contact"]
  message?: string
}) {
  const session = db.bidSessions.find((item) => item.id === input.sessionId)
  if (!session) throw new Error("Bid session not found")
  if (session.status !== "open") throw new Error("Bid session is not open")

  const bid: Bid = {
    id: `B-${(session.bids.length + 1).toString().padStart(3, "0")}`,
    applicationId: session.applicationId,
    installerId: input.installerId,
    installerName: input.installerName,
    price: input.price,
    proposal: input.proposal,
    warranty: input.warranty,
    estimatedDays: input.estimatedDays,
    createdAt: new Date().toISOString(),
    status: "pending",
    packageName: input.packageName,
    contact: input.contact,
    message: input.message,
  }

  session.bids.push(bid)
  addNotification(session.customerId, `${input.installerName} submitted a proposal on ${session.id}`)
  return clone(bid)
}

export function updateBidDecision(sessionId: string, bidId: string, action: "accept" | "reject") {
  const session = db.bidSessions.find((item) => item.id === sessionId)
  if (!session) throw new Error("Bid session not found")
  if (session.status !== "open") throw new Error("Only open sessions can be updated")

  const bid = session.bids.find((item) => item.id === bidId)
  if (!bid) throw new Error("Bid not found")
  if (bid.status !== "pending") throw new Error("Bid is already finalized")

  if (action === "accept") {
    session.status = "closed"
    session.selectedBidId = bidId
    bid.status = "accepted"
    session.bids.forEach((b) => {
      if (b.id !== bidId && b.status === "pending") b.status = "rejected"
    })

    const application = db.applications.find((app) => app.id === session.applicationId)
    if (application) {
      application.selectedInstaller = {
        id: bid.installerId,
        name: bid.installerName,
        packageName: bid.packageName ?? "Custom Package",
        price: bid.price,
      }
      application.status = "installation_in_progress"
      application.bidId = session.id
    }

    addNotification(session.customerId, `You accepted ${bid.installerName}'s bid on ${session.id}`)
  } else {
    bid.status = "rejected"
  }

  return clone(session)
}

export function expireStaleBids(now = new Date()) {
  let expiredCount = 0
  db.bidSessions.forEach((session) => {
    if (session.status !== "open") return
    if (new Date(session.expiresAt) > now) return

    session.status = "expired"
    session.bids = session.bids.map((bid) =>
      bid.status === "pending" ? { ...bid, status: "expired" } : bid,
    )
    expiredCount += 1

    const application = db.applications.find((app) => app.id === session.applicationId)
    if (application) {
      application.status = "approved"
      application.bidId = session.id
    }
    addNotification(session.customerId, `Bid session ${session.id} expired without approval.`)
  })

  return { expiredCount, timestamp: now.toISOString() }
}

export function listNotifications(customerId: string) {
  return clone(db.notifications.filter((note) => note.customerId === customerId))
}

function addNotification(customerId: string, message: string, type: Notification["type"] = "info") {
  db.notifications.push({
    id: `NT-${(db.notifications.length + 1).toString().padStart(3, "0")}`,
    customerId,
    message,
    createdAt: new Date().toISOString(),
    type,
  })
}

function applyExpiry() {
  expireStaleBids()
}

function syncSessionsWithApplications() {
  db.bidSessions.forEach((session) => {
    const application = db.applications.find((app) => app.id === session.applicationId)
    if (!application) return

    if (session.status === "open") {
      application.status = "finding_installer"
      application.bidId = session.id
    }

    if (session.selectedBidId) {
      const selectedBid = session.bids.find((bid) => bid.id === session.selectedBidId)
      if (selectedBid) {
        application.selectedInstaller = {
          id: selectedBid.installerId,
          name: selectedBid.installerName,
          packageName: selectedBid.packageName ?? "Custom Package",
          price: selectedBid.price,
        }
        application.status = session.status === "expired" ? "approved" : "installation_in_progress"
        application.bidId = session.id
      }
    }
  })
}
