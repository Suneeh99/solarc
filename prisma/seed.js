const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  await prisma.notification.deleteMany()
  await prisma.meterReading.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.bidSession.deleteMany()
  await prisma.application.deleteMany()
  await prisma.installerPackage.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  const officerPassword = await bcrypt.hash("password123", 10)
  const customerPassword = await bcrypt.hash("password123", 10)
  const installerPassword = await bcrypt.hash("password123", 10)

  const officerOrg = await prisma.organization.create({
    data: {
      name: "CEB",
      verified: true,
    },
  })

  const solarPro = await prisma.organization.create({
    data: {
      name: "Solar Pro Ltd",
      registrationNumber: "REG-2024-001",
      description: "Leading solar installation company with 10+ years experience",
      address: "123 Solar Street, Colombo",
      phone: "+94 11 234 5678",
      verified: true,
      verifiedAt: new Date("2024-01-10T00:00:00Z"),
      rating: 4.8,
      completedInstallations: 150,
      documents: ["cert.pdf", "license.pdf"],
    },
  })

  const greenEnergy = await prisma.organization.create({
    data: {
      name: "Green Energy Solutions",
      registrationNumber: "REG-2024-002",
      description: "Eco-friendly solar solutions for residential and commercial",
      address: "456 Energy Lane, Kandy",
      phone: "+94 11 345 6789",
      verified: true,
      verifiedAt: new Date("2024-01-12T00:00:00Z"),
      rating: 4.6,
      completedInstallations: 95,
      documents: ["cert.pdf"],
    },
  })

  const officer = await prisma.user.create({
    data: {
      email: "officer@demo.com",
      name: "CEB Officer",
      role: "officer",
      passwordHash: officerPassword,
      organizationId: officerOrg.id,
      verified: true,
    },
  })

  const customer = await prisma.user.create({
    data: {
      email: "customer@demo.com",
      name: "John Customer",
      role: "customer",
      passwordHash: customerPassword,
      phone: "+94 71 123 4567",
      address: "25 Main Street, Colombo",
      verified: true,
    },
  })

  const installer = await prisma.user.create({
    data: {
      email: "installer@demo.com",
      name: "Solar Pro Admin",
      role: "installer",
      passwordHash: installerPassword,
      phone: "+94 11 222 3333",
      address: "123 Solar Street, Colombo",
      organizationId: solarPro.id,
      verified: true,
    },
  })

  const packageBasic = await prisma.installerPackage.create({
    data: {
      organizationId: solarPro.id,
      name: "Basic Solar Package",
      capacity: "3 kW",
      panelCount: 8,
      panelType: "Monocrystalline",
      inverterBrand: "Huawei",
      warranty: "10 years",
      price: 450000,
      features: ["Free installation", "1 year maintenance", "Net metering setup"],
    },
  })

  const packagePremium = await prisma.installerPackage.create({
    data: {
      organizationId: solarPro.id,
      name: "Premium Solar Package",
      capacity: "5 kW",
      panelCount: 12,
      panelType: "Monocrystalline",
      inverterBrand: "SMA",
      warranty: "15 years",
      price: 750000,
      features: ["Free installation", "2 years maintenance", "Net metering setup", "Monitoring system"],
    },
  })

  await prisma.installerPackage.create({
    data: {
      organizationId: greenEnergy.id,
      name: "Economy Package",
      capacity: "2 kW",
      panelCount: 5,
      panelType: "Polycrystalline",
      inverterBrand: "Growatt",
      warranty: "8 years",
      price: 280000,
      features: ["Free installation", "Net metering setup"],
    },
  })

  const application = await prisma.application.create({
    data: {
      reference: "APP-001",
      customerId: customer.id,
      installerOrganizationId: solarPro.id,
      selectedPackageId: packageBasic.id,
      status: "approved",
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
      siteVisitDate: new Date("2024-01-20T00:00:00Z"),
    },
  })

  const bidSession = await prisma.bidSession.create({
    data: {
      applicationId: application.id,
      customerId: customer.id,
      status: "open",
      startedAt: new Date("2024-01-20T10:00:00Z"),
      expiresAt: new Date("2024-01-22T10:00:00Z"),
    },
  })

  await prisma.bid.create({
    data: {
      applicationId: application.id,
      bidSessionId: bidSession.id,
      installerId: installer.id,
      organizationId: solarPro.id,
      packageId: packagePremium.id,
      price: 420000,
      proposal: "Premium package with upgraded inverter and monitoring",
      warranty: "12 years",
      estimatedDays: 7,
      status: "pending",
    },
  })

  await prisma.invoice.create({
    data: {
      applicationId: application.id,
      customerId: customer.id,
      amount: 150000,
      description: "Authority connection fee",
      dueDate: new Date("2024-02-01T00:00:00Z"),
      status: "pending",
      type: "authority_fee",
    },
  })

  await prisma.invoice.create({
    data: {
      applicationId: application.id,
      customerId: customer.id,
      amount: 18500,
      description: "January solar bill",
      dueDate: new Date("2024-02-15T00:00:00Z"),
      status: "paid",
      type: "monthly_bill",
      paidAt: new Date("2024-02-10T00:00:00Z"),
    },
  })

  await prisma.meterReading.create({
    data: {
      applicationId: application.id,
      userId: officer.id,
      month: 1,
      year: 2024,
      kwhGenerated: 1250,
      kwhExported: 450,
      kwhImported: 200,
    },
  })

  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        title: "Application approved",
        body: "Your application APP-001 has been approved. Please review payment instructions.",
      },
      {
        userId: installer.id,
        title: "New bid opportunity",
        body: "Customer opened a new bid session for APP-001.",
      },
    ],
  })

  console.log("Database seeded with demo data")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
