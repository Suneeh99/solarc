"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Building,
  Star,
  CheckCircle,
  Zap,
  Sun,
  Shield,
  Calendar,
  Package,
  Gavel,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import { getDemoInstallers, type Installer, type SolarPackage } from "@/lib/auth"

// Demo approved applications for customer
const approvedApplications = [
  { id: "APP-001", address: "123 Solar Lane, Colombo 07", capacity: "5 kW", approvedDate: "2024-01-15" },
  { id: "APP-004", address: "321 Energy Street, Negombo", capacity: "8 kW", approvedDate: "2024-01-12" },
]

export default function PackageDetailPage() {
  const params = useParams()
  const id = params.id as string
  const pkgId = params.pkgId as string

  const router = useRouter()
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [pkg, setPkg] = useState<SolarPackage | null>(null)
  const [openBidDialog, setOpenBidDialog] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState("")
  const [bidDuration, setBidDuration] = useState("7")
  const [requirements, setRequirements] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] PackageDetailPage - params:", { id, pkgId })
    const installers = getDemoInstallers()
    console.log(
      "[v0] Available installers:",
      installers.map((i) => ({ id: i.id, packages: i.packages.map((p) => p.id) })),
    )

    const foundInstaller = installers.find((i) => i.id === id)
    console.log("[v0] Found installer:", foundInstaller?.id, foundInstaller?.companyName)

    if (foundInstaller) {
      setInstaller(foundInstaller)
      console.log(
        "[v0] Looking for package:",
        pkgId,
        "in packages:",
        foundInstaller.packages.map((p) => p.id),
      )
      const foundPkg = foundInstaller.packages.find((p) => p.id === pkgId)
      console.log("[v0] Found package:", foundPkg?.id, foundPkg?.name)

      if (foundPkg) {
        setPkg(foundPkg)
        setError(null)
      } else {
        setError(`Package "${pkgId}" not found for installer "${foundInstaller.companyName}"`)
      }
    } else {
      setError(`Installer "${id}" not found`)
    }
  }, [id, pkgId])

  const handleCreateBid = () => {
    if (!selectedApplication) {
      alert("Please select an application first")
      return
    }
    setLoading(true)
    console.log("[v0] Creating bid with:", {
      selectedApplication,
      bidDuration,
      requirements,
      installer: installer?.id,
      package: pkg?.id,
    })
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setOpenBidDialog(false)
      alert("Bid request sent to installer successfully!")
      router.push("/customer/bids")
    }, 1500)
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-destructive font-medium">{error}</p>
          <Link href="/customer/installers">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Installers
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  if (!installer || !pkg) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading package details...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link href={`/customer/installers/${installer.id}/packages`}>
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{pkg.name}</h1>
            <p className="text-muted-foreground">by {installer.companyName}</p>
          </div>
        </div>

        {/* Installer Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Building className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{installer.companyName}</h3>
                    <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {installer.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {installer.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {installer.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-foreground">{installer.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{installer.completedInstallations}</p>
                  <p className="text-xs text-muted-foreground">Installations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Package Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-500" />
                      Package Details
                    </CardTitle>
                    <CardDescription>Technical specifications and features</CardDescription>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-lg px-3 py-1">{pkg.capacity}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technical Specs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-foreground">Solar Panels</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pkg.panelCount} x {pkg.panelType}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-foreground">Inverter</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{pkg.inverterBrand}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-foreground">Warranty</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{pkg.warranty}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-foreground">Installation Time</span>
                    </div>
                    <p className="text-sm text-muted-foreground">2-3 days</p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Included Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    This {pkg.capacity} solar package is ideal for medium-sized households or small businesses. It
                    includes high-efficiency {pkg.panelType} panels and a reliable {pkg.inverterBrand} inverter. The
                    system comes with a comprehensive {pkg.warranty} warranty covering both panels and inverter.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price & Action Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-foreground">Package Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4 rounded-lg bg-emerald-500/10">
                  <p className="text-3xl font-bold text-emerald-600">Rs. {pkg.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Including installation</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equipment</span>
                    <span className="text-foreground">Rs. {Math.round(pkg.price * 0.7).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installation</span>
                    <span className="text-foreground">Rs. {Math.round(pkg.price * 0.2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Permits & Documentation</span>
                    <span className="text-foreground">Rs. {Math.round(pkg.price * 0.1).toLocaleString()}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between font-medium">
                    <span className="text-foreground">Total</span>
                    <span className="text-emerald-600">Rs. {pkg.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Open Bid Dialog */}
                <Dialog open={openBidDialog} onOpenChange={setOpenBidDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Gavel className="w-4 h-4 mr-2" />
                      Request Quote / Open Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Open New Bid</DialogTitle>
                      <DialogDescription>
                        Request a quote from {installer.companyName} for this package
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Selected Package Summary */}
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm font-medium text-foreground">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pkg.capacity} - Rs. {pkg.price.toLocaleString()}
                        </p>
                      </div>

                      {/* Select Application */}
                      <div className="space-y-2">
                        <Label>Select Approved Application</Label>
                        <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an application" />
                          </SelectTrigger>
                          <SelectContent>
                            {approvedApplications.map((app) => (
                              <SelectItem key={app.id} value={app.id}>
                                {app.id} - {app.address} ({app.capacity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {approvedApplications.length === 0 && (
                          <p className="text-xs text-red-500">
                            You need an approved application to open a bid.{" "}
                            <Link href="/customer/applications/new" className="underline">
                              Apply now
                            </Link>
                          </p>
                        )}
                      </div>

                      {/* Bid Duration */}
                      <div className="space-y-2">
                        <Label>Bid Duration</Label>
                        <Select value={bidDuration} onValueChange={setBidDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Days</SelectItem>
                            <SelectItem value="5">5 Days</SelectItem>
                            <SelectItem value="7">7 Days (Recommended)</SelectItem>
                            <SelectItem value="14">14 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Special Requirements */}
                      <div className="space-y-2">
                        <Label>Special Requirements (Optional)</Label>
                        <Textarea
                          placeholder="Any specific requirements or questions..."
                          value={requirements}
                          onChange={(e) => setRequirements(e.target.value)}
                          className="h-20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setOpenBidDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleCreateBid}
                        disabled={!selectedApplication || loading}
                      >
                        {loading ? "Creating..." : "Create Bid"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-center text-muted-foreground">
                  Opening a bid allows the installer to send you a customized quote
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
