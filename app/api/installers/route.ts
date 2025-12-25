import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@/lib/services/auth"

function mapInstaller(org: any) {
  const primaryInstaller = org.users.find(
    (user: any) => user.role === "installer"
  )

  return {
    id: org.id,
    companyName: org.name,
    email: primaryInstaller?.email || "",
    phone: org.phone || primaryInstaller?.phone || "",
    address: org.address || "",
    description: org.description || "",
    registrationNumber: org.registrationNumber || "",
    verified: org.verified,
    verifiedAt: org.verifiedAt,
    documents: org.documents || [],
    rating: org.rating ?? 0,
    completedInstallations: org.completedInstallations ?? 0,
    packages: org.packages.map((pkg: any) => ({
      id: pkg.id,
      installerId: org.id,
      name: pkg.name,
      capacity: pkg.capacity,
      panelCount: pkg.panelCount,
      panelType: pkg.panelType,
      inverterBrand: pkg.inverterBrand,
      warranty: pkg.warranty,
      price: pkg.price,
      features: pkg.features || [],
    })),
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const verified = url.searchParams.get("verified")

  const organizations = await prisma.organization.findMany({
    where: verified === "true" ? { verified: true } : undefined,
    include: {
      packages: true,
      users: true,
    },
  })

  return NextResponse.json({
    installers: organizations.map(mapInstaller),
  })
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.role !== "installer" || !user.organization) {
    return NextResponse.json(
      { error: "Only installers can add packages" },
      { status: 403 }
    )
  }

  const body = await request.json()

  try {
    const pkg = await prisma.installerPackage.create({
      data: {
        organizationId: user.organization.id,
        name: body.name,
        capacity: body.capacity,
        panelCount: body.panelCount,
        panelType: body.panelType,
        inverterBrand: body.inverterBrand,
        warranty: body.warranty,
        price: body.price,
        features: body.features || [],
      },
    })

    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add package"

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
