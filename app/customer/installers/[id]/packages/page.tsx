"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  ArrowLeft,
  Building,
  Star,
  CheckCircle,
  Package,
  MapPin,
  Phone,
  Gavel,
} from "lucide-react"

import {
  fetchApplications,
  fetchInstallers,
  type Application,
  type Installer,
  type SolarPackage,
} from "@/lib/auth"

export default function InstallerPackagesPage() {
  const params = useParams()
  const installerId = params.id as string

  const [installer, setInstaller] = useState<Installer | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [openBidDialog, setOpenBidDialog] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<SolarPackage | null>(null)
  const [selectedApplication, setSelectedApplication] = useState("")
  const [bidDuration, setBidDuration] = useState("7")
  const [requirements, setRequirements] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [installerList, applicationList] = await Promise.all([
          fetchInstallers(true),
          fetchApplications(),
        ])

        const found = installerList.find((i) => i.id === installerId)
        if (!found) {
          setError(`Installer "${installerId}" not found`)
          return
        }

        setInstaller(found)
        setApplications(
          applicationList.filter((app) =>
            [
              "approved",
              "payment_confirmed",
              "finding_installer",
              "installation_in_progress",
            ].includes(app.status),
          ),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load installer")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [installerId])

  function handleOpenBidDialog(pkg: SolarPackage) {
    setSelectedPackage(pkg)
    setOpenBidDialog(true)
  }

  async function handleCreateBid() {
    if (!selectedApplication || !selectedPackage) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApplication,
          durationHours: Number(bidDuration) * 24,
          requirements,
          bidType: "specific",
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Unable to create bid")
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
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading installer…
        </div>
      </DashboardLayout>
    )
  }

  if (error || !installer) {
    return (
      <DashboardLayout>
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <p className="text-destructive">{error ?? "Installer unavailable"}</p>
          <Link href="/customer/installers">
            <Button className="bg-emerald-600 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Installers
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const hasEligibleApplications = applications.length > 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/customer/installers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{installer.companyName}</h1>
            <p className="text-muted-foreground">View all available packages</p>
          </div>
        </div>

        {!hasEligibleApplications && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-sm text-red-500">
                You need an approved application to select packages or request quotes.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6 flex justify-between flex-wrap gap-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Building className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{installer.companyName}</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {installer.description}
                </p>
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
                  <span className="font-semibold">{installer.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{installer.completedInstallations}</p>
                <p className="text-xs text-muted-foreground">Installations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Packages ({installer.packages.length})
            </CardTitle>
            <CardDescription>Select a package to request a bid</CardDescription>
          </CardHeader>
          <CardContent>
            {installer.packages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No packages available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {installer.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-lg border hover:border-emerald-500/50"
                  >
                    <h5 className="font-medium mb-1">{pkg.name}</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      {pkg.panelCount} panels • {pkg.inverterBrand}
                    </p>
                    <p className="font-bold text-emerald-500 mb-3">
                      Rs. {pkg.price.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/customer/installers/${installer.id}/packages/${pkg.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="bg-emerald-500 text-white"
                        onClick={() => handleOpenBidDialog(pkg)}
                        disabled={!hasEligibleApplications}
                        title={
                          !hasEligibleApplications
                            ? "You need an approved application to request a quote"
                            : undefined
                        }
                      >
                        <Gavel className="w-3 h-3 mr-1" />
                        Request Bid
                      </Button>
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
              <DialogDescription>
                Select an application and add requirements
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Label>Application</Label>
              <Select
                value={selectedApplication}
                onValueChange={setSelectedApplication}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Bid Duration (days)</Label>
              <Select value={bidDuration} onValueChange={setBidDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="10">10 days</SelectItem>
                </SelectContent>
              </Select>

              <Label>Requirements</Label>
              <Textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Any special requirements"
              />

              <Button
                onClick={handleCreateBid}
                disabled={!selectedApplication || submitting}
                className="bg-emerald-500 text-white"
              >
                {submitting ? "Sending…" : "Send Bid Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
