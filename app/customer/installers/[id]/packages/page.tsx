"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Building, Star, CheckCircle, Package, MapPin, Phone, Gavel } from "lucide-react"
import { fetchApplications, fetchInstallers, type Application, type Installer, type SolarPackage } from "@/lib/auth"

export default function InstallerPackagesPage() {
  const params = useParams()
  const id = params.id as string

  const [installer, setInstaller] = useState<Installer | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Bid dialog state
  const [openBidDialog, setOpenBidDialog] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<SolarPackage | null>(null)
  const [selectedApplication, setSelectedApplication] = useState("")
  const [bidDuration, setBidDuration] = useState("7")
  const [requirements, setRequirements] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadInstaller() {
      try {
        const [installerList, applicationList] = await Promise.all([fetchInstallers(true), fetchApplications()])
        const found = installerList.find((i) => i.id === id)
        if (!found) {
          setError(`Installer "${id}" not found`)
          return
        }
        setInstaller(found)
        setApplications(
          applicationList.filter((app) =>
            ["approved", "payment_confirmed", "finding_installer", "installation_in_progress"].includes(app.status),
          ),
        )
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load installer")
      } finally {
        setLoading(false)
      }
    }
    loadInstaller()
  }, [id])

  const handleOpenBidDialog = (pkg: SolarPackage) => {
    setSelectedPackage(pkg)
    setOpenBidDialog(true)
  }

  const handleCreateBid = async () => {
    if (!selectedApplication || !selectedPackage) {
      alert("Please select an application and package first")
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApplication,
          packageId: selectedPackage.id,
          expiresInDays: Number(bidDuration),
          requirements,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Unable to create bid request")
      }

      setOpenBidDialog(false)
      setSelectedPackage(null)
      setSelectedApplication("")
      setRequirements("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit bid")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading installer...</p>
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

  if (!installer) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Installer unavailable</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/customer/installers">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{installer.companyName}</h1>
            <p className="text-muted-foreground">View all available packages</p>
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
                  <p className="text-sm text-muted-foreground mt-1">{installer.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {installer.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {installer.phone}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
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

        {/* Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Available Packages ({installer.packages.length})
            </CardTitle>
            <CardDescription>Select a package to view details or request a quote</CardDescription>
          </CardHeader>
          <CardContent>
            {installer.packages.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">This installer has no packages available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {installer.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-lg border border-border hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-foreground">{pkg.name}</h5>
                      <Badge variant="secondary">{pkg.capacity}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground mb-4">
                      <p>
                        {pkg.panelCount} panels ({pkg.panelType})
                      </p>
                      <p>Inverter: {pkg.inverterBrand}</p>
                      <p>Warranty: {pkg.warranty}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-emerald-500">Rs. {pkg.price.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <Link href={`/customer/installers/${installer.id}/packages/${pkg.id}`}>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View
                          </Button>
                        </Link>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleOpenBidDialog(pkg)}>
                          Request Bid
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={openBidDialog} onOpenChange={setOpenBidDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Bid</DialogTitle>
              <DialogDescription>Select an application and share your requirements</DialogDescription>
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
                disabled={!selectedApplication || !selectedPackage || submitting}
              >
                {submitting ? "Sending Bid..." : "Send Bid Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
