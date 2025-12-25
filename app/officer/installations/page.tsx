"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Search, CheckCircle, Clock, Zap, MapPin, Building, Wrench, Eye, FileCheck, AlertTriangle } from "lucide-react"
import { fetchApplications, type Application } from "@/lib/auth"

type InstallationStatus = "pending_start" | "in_progress" | "pending_inspection" | "completed" | "issues_reported"

interface Installation {
  id: string
  applicationId: string
  customerId: string
  customerName: string
  address: string
  installerName?: string
  capacity?: string
  status: InstallationStatus
  progress: number
  siteVisitDate?: string
}

export default function OfficerInstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const apps = await fetchApplications()
        const mapped = apps
          .filter((app) =>
            ["installation_in_progress", "installation_complete", "final_inspection", "completed"].includes(app.status),
          )
          .map<Installation>((app) => {
            const statusMap: Record<Application["status"], InstallationStatus> = {
              installation_in_progress: "in_progress",
              installation_complete: "pending_inspection",
              final_inspection: "pending_inspection",
              completed: "completed",
              pending: "pending_start",
              under_review: "pending_start",
              site_visit_scheduled: "pending_start",
              approved: "pending_start",
              rejected: "issues_reported",
              payment_pending: "pending_start",
              payment_confirmed: "pending_start",
              finding_installer: "pending_start",
              agreement_pending: "pending_inspection",
            }
            const status = statusMap[app.status] || "pending_start"
            const progressByStatus: Record<InstallationStatus, number> = {
              pending_start: 10,
              in_progress: 55,
              pending_inspection: 85,
              completed: 100,
              issues_reported: 30,
            }
            return {
              id: `INST-${app.id}`,
              applicationId: app.id,
              customerId: app.customerId,
              customerName: app.customerName,
              address: (app.technicalDetails as any)?.address || "Pending address",
              installerName: app.selectedInstaller?.name,
              capacity: app.selectedInstaller?.packageName,
              status,
              progress: progressByStatus[status],
              siteVisitDate: app.siteVisitDate,
            }
          })
        setInstallations(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load installations")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getStatusBadge = (status: InstallationStatus) => {
    const config = {
      pending_start: { label: "Pending Start", color: "bg-slate-500/10 text-slate-600", icon: Clock },
      in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-600", icon: Wrench },
      pending_inspection: { label: "Pending Inspection", color: "bg-amber-500/10 text-amber-600", icon: FileCheck },
      completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
      issues_reported: { label: "Issues Reported", color: "bg-red-500/10 text-red-600", icon: AlertTriangle },
    }
    const { label, color, icon: Icon } = config[status]
    return (
      <Badge className={color} variant="secondary">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const stats = useMemo(() => {
    return {
      total: installations.length,
      inProgress: installations.filter((i) => i.status === "in_progress").length,
      pendingInspection: installations.filter((i) => i.status === "pending_inspection").length,
      issues: installations.filter((i) => i.status === "issues_reported").length,
    }
  }, [installations])

  const handleApproveInspection = async () => {
    if (selectedInstallation) {
      await fetch(`/api/applications/${selectedInstallation.applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      })
      setInstallations((prev) =>
        prev.map((i) => (i.id === selectedInstallation.id ? { ...i, status: "completed", progress: 100 } : i)),
      )
      setApproveDialogOpen(false)
      setSelectedInstallation(null)
    }
  }

  const filteredInstallations = installations.filter(
    (i) =>
      i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.installerName || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const InstallationCard = ({ installation }: { installation: Installation }) => (
    <Card className="hover:border-emerald-500/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-foreground">{installation.id}</p>
              {getStatusBadge(installation.status)}
            </div>
            <p className="text-sm text-muted-foreground">{installation.customerName}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-emerald-600">{installation.capacity || "N/A"}</p>
            <p className="text-xs text-muted-foreground">{installation.applicationId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-foreground">{installation.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="w-4 h-4" />
            <span className="text-foreground">{installation.installerName || "Awaiting assignment"}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <p className="text-muted-foreground">Progress</p>
            <p className="text-foreground">{installation.progress}%</p>
          </div>
          <Progress value={installation.progress} />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setDetailsOpen(true)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
          {installation.status === "pending_inspection" && (
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => {
                setSelectedInstallation(installation)
                setApproveDialogOpen(true)
              }}
            >
              Approve Inspection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Installations</h1>
            <p className="text-muted-foreground">Track installation progress and inspections</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search installations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Loading installations...</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Installations</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Pending Inspection</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingInspection}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Issues</p>
                  <p className="text-2xl font-bold text-foreground">{stats.issues}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstallations.map((installation) => (
                <InstallationCard key={installation.id} installation={installation} />
              ))}
            </div>
          </>
        )}

        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Inspection</DialogTitle>
              <DialogDescription>Confirm the installation has passed inspection.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproveInspection} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
