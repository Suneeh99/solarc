const { PrismaClient, Role, ApplicationStatus, InvoiceStatus, InvoiceType, PaymentStatus, BidStatus } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("password123", 10)

  const officer = await prisma.user.upsert({
    where: { email: "officer@demo.com" },
    update: {},
    create: {
      name: "CEB Officer",
      email: "officer@demo.com",
      passwordHash: password,
      role: Role.officer,
      verified: true,
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      name: "John Customer",
      email: "customer@demo.com",
      passwordHash: password,
      role: Role.customer,
      phone: "+94 77 000 0000",
      address: "123 Demo Street, Colombo",
      verified: true,
    },
  })

  const solarPro = await prisma.organization.upsert({
    where: { id: "org-solar-pro" },
    update: {},
    create: {
      id: "org-solar-pro",
      name: "Solar Pro Ltd",
      registrationNumber: "REG-2024-001",
      phone: "+94 11 234 5678",
      address: "123 Solar Street, Colombo",
      description: "Leading solar installation company with 10+ years experience",
      verified: true,
      verifiedAt: new Date(),
    },
  })

  const greenEnergy = await prisma.organization.upsert({
    where: { id: "org-green-energy" },
    update: {},
    create: {
      id: "org-green-energy",
      name: "Green Energy Solutions",
      registrationNumber: "REG-2024-002",
      phone: "+94 11 345 6789",
      address: "456 Energy Lane, Kandy",
      description: "Eco-friendly solar solutions for residential and commercial",
      verified: true,
      verifiedAt: new Date(),
    },
  })

  const installerOne = await prisma.user.upsert({
    where: { email: "installer@demo.com" },
    update: {},
    create: {
      name: "Solar Pro Ltd",
      email: "installer@demo.com",
      passwordHash: password,
      role: Role.installer,
      phone: "+94 71 234 5678",
      address: "123 Solar Street, Colombo",
      organizationId: solarPro.id,
      verified: true,
      verifiedAt: new Date(),
    },
  })

  const installerTwo = await prisma.user.upsert({
    where: { email: "installer2@demo.com" },
    update: {},
    create: {
      name: "Green Energy Solutions",
      email: "installer2@demo.com",
      passwordHash: password,
      role: Role.installer,
      phone: "+94 71 345 6789",
      address: "456 Energy Lane, Kandy",
      organizationId: greenEnergy.id,
      verified: true,
      verifiedAt: new Date(),
    },
  })

  const basicPackage = await prisma.installerPackage.upsert({
    where: { id: "pkg-basic" },
    update: {},
    create: {
      id: "pkg-basic",
      installerId: installerOne.id,
      organizationId: solarPro.id,
      name: "Basic Solar Package",
      description: "Starter package for small households",
      capacity: "3 kW",
      panelCount: 8,
      panelType: "Monocrystalline",
      inverterBrand: "Huawei",
      warranty: "10 years",
      price: 450000,
      features: ["Free installation", "1 year maintenance", "Net metering setup"],
    },
  })

  const premiumPackage = await prisma.installerPackage.upsert({
    where: { id: "pkg-premium" },
    update: {},
    create: {
      id: "pkg-premium",
      installerId: installerOne.id,
      organizationId: solarPro.id,
      name: "Premium Solar Package",
      description: "Higher capacity with monitoring",
      capacity: "5 kW",
      panelCount: 12,
      panelType: "Monocrystalline",
      inverterBrand: "SMA",
      warranty: "15 years",
      price: 750000,
      features: ["Free installation", "2 years maintenance", "Net metering setup", "Monitoring system"],
    },
  })

  await prisma.installerPackage.upsert({
    where: { id: "pkg-economy" },
    update: {},
    create: {
      id: "pkg-economy",
      installerId: installerTwo.id,
      organizationId: greenEnergy.id,
      name: "Economy Package",
      description: "Budget-friendly solar option",
      capacity: "2 kW",
      panelCount: 5,
      panelType: "Polycrystalline",
      inverterBrand: "Growatt",
      warranty: "8 years",
      price: 280000,
      features: ["Free installation", "Net metering setup"],
    },
  })

  const application = await prisma.application.upsert({
    where: { reference: "APP-001" },
    update: {},
    create: {
      reference: "APP-001",
      customerId: customer.id,
      installerId: installerOne.id,
      organizationId: solarPro.id,
      status: ApplicationStatus.approved,
      description: "5 kW rooftop system",
      location: "Colombo",
      capacityRequested: "5 kW",
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
  })

  const bid = await prisma.bid.upsert({
    where: { id: "bid-demo" },
    update: {},
    create: {
      id: "bid-demo",
      applicationId: application.id,
      installerId: installerOne.id,
      price: 720000,
      proposal: "Complete turnkey installation with monitoring",
      warranty: "10 years",
      estimatedDays: 14,
      status: BidStatus.accepted,
    },
  })

  await prisma.application.update({
    where: { id: application.id },
    data: { selectedBidId: bid.id },
  })

  const invoice = await prisma.invoice.upsert({
    where: { id: "inv-demo" },
    update: {},
    create: {
      id: "inv-demo",
      applicationId: application.id,
      customerId: customer.id,
      installerId: installerOne.id,
      type: InvoiceType.installation,
      amount: 720000,
      status: InvoiceStatus.pending,
      description: "Installation advance",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  })

  await prisma.payment.upsert({
    where: { id: "pay-demo" },
    update: {},
    create: {
      id: "pay-demo",
      invoiceId: invoice.id,
      applicationId: application.id,
      userId: customer.id,
      amount: 250000,
      method: "card",
      status: PaymentStatus.completed,
    },
  })

  await prisma.meterReading.upsert({
    where: { id: "reading-demo" },
    update: {},
    create: {
      id: "reading-demo",
      applicationId: application.id,
      readingDate: new Date(),
      kwhGenerated: 1250,
      kwhExported: 320,
      kwhImported: 120,
      notes: "Monthly net metering reading",
    },
  })

  await prisma.notification.create({
    data: {
      userId: customer.id,
      title: "Installation approved",
      message: "Your solar installation has been approved and assigned to Solar Pro Ltd",
    },
  })

  console.log({ officer: officer.email, customer: customer.email, installer: installerOne.email, installerTwo: installerTwo.email })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
