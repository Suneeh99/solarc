"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
  DialogTrigger,
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
  Zap,
  Sun,
  Shield,
  Gavel,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"

import {
  fetchApplications,
  fetchInstallers,
  type Application,
  type Installer,
  type SolarPackage,
} from "@/lib/auth"

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()

  const installerId = params.id as string
  const packageId = params.pkgId as string

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
    async function load() {
      try {
        const [installerList, applicationList] = await Promise.all([
          fetchInstallers(true),
          fetchApplications(),
        ])

        const foundInstaller = installerList.find((i) => i.id === installerId)
        if (!foundInstaller) {
          setError("Installer not found")
          return
        }

        const foundPackage = foundInstaller.packages.find(
          (p) => p.id === packageId,
        )
        if (!foundPackage) {
          setError("Package not found")
          return
        }

        setInstaller(foundInstaller)
        setPkg(foundPackage)

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
        setError(err instanceof Error ? err.message : "Unable to load data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [installerId, packageId])

  async function handleCreateBid() {
    if (!selectedApplication) return

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
      router.push("/customer/bids")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bid")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading package details…
        </div>
      </DashboardLayout>
    )
  }

  if (error || !installer || !pkg) {
    return (
      <DashboardLayout>
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <p className="text-destructive">{error ?? "Package unavailable"}</p>
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/customer/installers/${installer.id}/packages`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{pkg.name}</h1>
            <p className="text-muted-foreground">
              by {installer.companyName}
            </p>
          </div>
        </div>

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
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {installer.address}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {installer.phone}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {installer.email}
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{installer.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Overview</CardTitle>
            <CardDescription>
              Installation details and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <Sun className="w-4 h-4 mb-1" />
              <p className="text-xl font-bold">{pkg.capacity}</p>
              <p className="text-sm text-muted-foreground">Capacity</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Zap className="w-4 h-4 mb-1" />
              <p className="text-xl font-bold">{pkg.panelCount}</p>
              <p className="text-sm text-muted-foreground">Panels</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Shield className="w-4 h-4 mb-1" />
              <p className="text-xl font-bold">{pkg.warranty}</p>
              <p className="text-sm text-muted-foreground">Warranty</p>
            </div>
          </CardContent>
        </Card>

        <Dialog open={openBidDialog} onOpenChange={setOpenBidDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-emerald-500 text-white"
              disabled={applications.length === 0}
              title={
                applications.length === 0
                  ? "You need an approved application to request a bid"
                  : undefined
              }
            >
              <Gavel className="w-4 h-4 mr-2" />
              Request Bid
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Bid</DialogTitle>
              <DialogDescription>
                Request a quote from {installer.companyName}
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
