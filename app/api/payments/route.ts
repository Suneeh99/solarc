import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@/lib/services/auth"

function mapInvoice(invoice: any) {
  return {
    id: invoice.id,
    applicationId: invoice.application.reference,
    customerId: invoice.customerId,
    customerName: invoice.customer?.name,
    amount: invoice.amount,
    status: invoice.status,
    type: invoice.type,
    description: invoice.description,
    createdAt: invoice.createdAt,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
  }
}

export async function GET() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const where =
    user.role === "customer"
      ? { customerId: user.id }
      : user.role === "installer" && user.organization
        ? { application: { installerOrganizationId: user.organization.id } }
        : {}

  const [invoices, meterReadings] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { application: { select: { reference: true, customerId: true } }, customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.meterReading.findMany({
      where: user.role === "officer" ? undefined : { userId: user.id },
    }),
  ])

  const invoiceList = invoices.filter((inv) => inv.type !== "monthly_bill").map(mapInvoice)

  const monthlyBills = invoices
    .filter((inv) => inv.type === "monthly_bill")
    .map((inv) => {
      const reading = meterReadings.find(
        (r) =>
          r.applicationId === inv.applicationId &&
          r.year === inv.dueDate.getFullYear() &&
          r.month === inv.dueDate.getMonth() + 1,
      )

      return {
        id: inv.id,
        customerId: inv.customerId,
        applicationId: inv.application.reference,
        month: inv.dueDate.getMonth() + 1,
        year: inv.dueDate.getFullYear(),
        kwhGenerated: reading?.kwhGenerated || 0,
        kwhExported: reading?.kwhExported || 0,
        kwhImported: reading?.kwhImported || 0,
        amount: inv.amount,
        status: inv.status,
        createdAt: inv.createdAt,
      }
    })

  return NextResponse.json({ invoices: invoiceList, monthlyBills })
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.role === "installer") {
    return NextResponse.json({ error: "Installers cannot create invoices" }, { status: 403 })
  }

  const body = await request.json()
  const application = await prisma.application.findFirst({ where: { reference: body.applicationId } })

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  const invoice = await prisma.invoice.create({
    data: {
      applicationId: application.id,
      customerId: application.customerId,
      amount: body.amount,
      description: body.description,
      dueDate: new Date(body.dueDate),
      status: body.status || "pending",
      type: body.type || "authority_fee",
    },
    include: { application: { select: { reference: true, customerId: true } } },
  })

  return NextResponse.json({ invoice: mapInvoice(invoice) }, { status: 201 })
}
