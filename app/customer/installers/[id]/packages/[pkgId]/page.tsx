"use client"

import { useEffect, useState } from "react"
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
import { fetchApplications, fetchInstallers, type Application, type Installer, type SolarPackage } from "@/lib/auth"

export default function PackageDetailPage() {
  const params = useParams()
  const id = params.id as string
  const pkgId = params.pkgId as string

  const router = useRouter()
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [pkg, setPkg] = useState<SolarPackage | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [openBidDialog, setOpenBidDialog] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState("")
  const [bidDuration, setBidDuration] = useState("7")
  const [requirements, setRequirements] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [installerList, applicationList] = await Promise.all([fetchInstallers(true), fetchApplications()])
        const foundInstaller = installerList.find((i) => i.id === id)
        if (!foundInstaller) {
          setError(`Installer "${id}" not found`)
          return
        }
        setInstaller(foundInstaller)
        const foundPkg = foundInstaller.packages.find((p) => p.id === pkgId)
        if (!foundPkg) {
          setError(`Package "${pkgId}" not found for installer "${foundInstaller.companyName}"`)
          return
        }
        setPkg(foundPkg)
        setApplications(
          applicationList.filter((app) =>
            ["approved", "payment_confirmed", "finding_installer", "installation_in_progress"].includes(app.status),
          ),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load package details")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, pkgId])

  const handleCreateBid = async () => {
    if (!selectedApplication) {
      alert("Please select an application first")
      return
    }
    setSubmitting(true)

    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApplication,
          expiresInDays: Number(bidDuration),
          requirements,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Unable to create bid request")
      }

      setOpenBidDialog(false)
      router.push("/customer/bids")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send bid request")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading package details...</p>
        </div>
      </DashboardLayout>
    )
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
          <p className="text-muted-foreground">Package details unavailable</p>
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

        {/* Package Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Package Overview</CardTitle>
              <CardDescription>Details about this solar installation package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sun className="w-4 h-4" />
                    Capacity
                  </div>
                  <p className="text-xl font-bold text-foreground">{pkg.capacity}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    Panels
                  </div>
                  <p className="text-xl font-bold text-foreground">{pkg.panelCount} panels</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Warranty
                  </div>
                  <p className="text-xl font-bold text-foreground">{pkg.warranty}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    Inverter
                  </div>
                  <p className="text-xl font-bold text-foreground">{pkg.inverterBrand}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {pkg.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="bg-muted text-foreground">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Price</CardTitle>
              <CardDescription>Package investment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">Rs. {pkg.price.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">All-inclusive package price</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Installation Timeline</h4>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Estimated completion in 10-14 days after approval
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Included Services</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Site assessment and system design</li>
                  <li>Net metering application</li>
                  <li>Installation and testing</li>
                  <li>One-year maintenance</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setOpenBidDialog(true)}>
                  <Gavel className="w-4 h-4 mr-2" />
                  Request Bid from Installer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About Installer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">About {installer.companyName}</CardTitle>
            <CardDescription>Company background and credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Registration Number</p>
                <p className="font-semibold text-foreground">{installer.registrationNumber}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-semibold text-foreground">10+ years</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Completed Projects</p>
                <p className="font-semibold text-foreground">{installer.completedInstallations}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Verification</p>
                <p className="font-semibold text-emerald-500">Verified by CEB</p>
              </div>
            </div>
            <p className="text-muted-foreground">{installer.description}</p>
          </CardContent>
        </Card>

        {/* Bid Dialog */}
        <Dialog open={openBidDialog} onOpenChange={setOpenBidDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Gavel className="w-4 h-4 mr-2" />
              Request Bid
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Bid from {installer.companyName}</DialogTitle>
              <DialogDescription>Select an approved application and share your requirements</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Application</Label>
                <p className="text-sm text-muted-foreground">
                  Choose an approved application to request a bid from this installer
                </p>
              </div>
              <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an approved application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.id} - {(app.technicalDetails as any).roofType || "Solar application"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label>Bid Window (days)</Label>
                <Select value={bidDuration} onValueChange={setBidDuration}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="10">10 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Additional Requirements</Label>
                <Textarea
                  placeholder="Describe any specific requirements or preferences..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={handleCreateBid}
                disabled={!selectedApplication || submitting}
              >
                {submitting ? "Sending Bid..." : "Send Bid Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Package Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Why Choose This Package?</CardTitle>
            <CardDescription>Key benefits and coverage details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Comprehensive Warranty</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enjoy {pkg.warranty} coverage on panels, inverter, and workmanship.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Sun className="w-5 h-5" />
                <span className="font-semibold">High Efficiency</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Premium {pkg.panelType} panels designed for tropical climates to maximize generation.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Fast Installation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Typical installation completed within two weeks after approval and site readiness.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
