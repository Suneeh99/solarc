"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Building, Star, CheckCircle, Package, MapPin, Phone, Gavel, ShieldAlert } from "lucide-react"
import type { Installer, SolarPackage, Application } from "@/lib/auth"

export default function InstallerPackagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Bid dialog state
  const [openBidDialog, setOpenBidDialog] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<SolarPackage | null>(null)
  const [selectedApplication, setSelectedApplication] = useState("")
  const [bidDuration, setBidDuration] = useState("7")
  const [requirements, setRequirements] = useState("")
  const [loading, setLoading] = useState(false)
  const [approvedApplications, setApprovedApplications] = useState<Application[]>([])

  useEffect(() => {
    const installersFetch = async () => {
      const res = await fetch("/api/customer/installers")
      const data = await res.json()
      const found = data.installers.find((i: Installer) => i.id === resolvedParams.id)
      if (found) {
        setInstaller(found)
        setError(null)
      } else {
        setError(`Installer "${resolvedParams.id}" not found`)
      }
    }

    const fetchApproved = async () => {
      const res = await fetch("/api/customer/applications/approved")
      const data = await res.json()
      setApprovedApplications(data.applications)
    }

    installersFetch()
    fetchApproved()
  }, [resolvedParams])

  const handleOpenBidDialog = (pkg: SolarPackage) => {
    setSelectedPackage(pkg)
    setOpenBidDialog(true)
  }

  const handleCreateBid = () => {
    if (!selectedApplication) {
      alert("Please select an application first")
      return
    }
    if (!selectedPackage) {
      alert("No package selected")
      return
    }
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setOpenBidDialog(false)
      setSelectedPackage(null)
      setSelectedApplication("")
      setRequirements("")
      alert("Bid request sent to installer successfully!")
    }, 1500)
  }

  const hasApproved = approvedApplications.length > 0

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
          <p className="text-muted-foreground">Loading...</p>
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

        {!hasApproved && (
          <Card className="border-amber-500/40 bg-amber-500/10">
            <CardContent className="p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Approval required to request quotes</p>
                <p className="text-sm text-muted-foreground">
                  You need at least one approved application to request a quote or open a bid with an installer.
                </p>
                <div className="mt-2 flex gap-2">
                  <Link href="/customer/applications/new">
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      Submit application
                    </Button>
                  </Link>
                  <Link href="/customer/applications">
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Track applications
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                    className="p-4 rounded-lg border border-border hover:border-emerald-500/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-foreground">{pkg.name}</h5>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                        {pkg.capacity}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground mb-4">
                      <p>
                        {pkg.panelCount} panels ({pkg.panelType})
                      </p>
                      <p>Inverter: {pkg.inverterBrand}</p>
                      <p>Warranty: {pkg.warranty}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-emerald-500">Rs. {pkg.price.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={() => handleOpenBidDialog(pkg)}
                          disabled={!hasApproved}
                          title={hasApproved ? undefined : "Application approval required before opening a bid"}
                        >
                          <Gavel className="w-3 h-3 mr-1" />
                          Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bid Dialog */}
        <Dialog open={openBidDialog} onOpenChange={setOpenBidDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Open New Bid</DialogTitle>
              <DialogDescription>
                Request a quote from {installer.companyName} for the selected package
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Selected Package Summary */}
              {selectedPackage && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm font-medium text-foreground">{selectedPackage.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPackage.capacity} - Rs. {selectedPackage.price.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Select Application */}
              <div className="space-y-2">
                <Label>Select Approved Application</Label>
                <Select value={selectedApplication} onValueChange={setSelectedApplication} disabled={!approvedApplications.length}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an application" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedApplications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.id} - {app.technicalDetails.roofType} ({app.technicalDetails.monthlyConsumption})
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
                onClick={() => {
                  setOpenBidDialog(false)
                  setSelectedPackage(null)
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleCreateBid}
                disabled={!selectedApplication || loading || !approvedApplications.length}
              >
                {loading ? "Creating..." : "Create Bid"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
