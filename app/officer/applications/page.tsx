"use client"

import type React from "react"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Download,
  Zap,
  MapPin,
} from "lucide-react"

import type { Application, DocumentMeta } from "@/lib/auth"

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending Review", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  under_review: { label: "Under Review", color: "bg-blue-500/10 text-blue-600", icon: FileText },
  site_visit_scheduled: { label: "Site Visit Scheduled", color: "bg-cyan-500/10 text-cyan-600", icon: Calendar },
  approved: { label: "Approved", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: AlertCircle },
}

function OfficerApplicationsContent() {
  const searchParams = useSearchParams()
  const defaultStatus = searchParams.get("status") || "all"

  const [applications, setApplications] = useState<Application[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState(defaultStatus)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [siteVisitDate, setSiteVisitDate] = useState("")

  useEffect(() => {
    const fetchApps = async () => {
      const res = await fetch("/api/officer/applications")
      const data = await res.json()
      setApplications(data.applications)
    }
    fetchApps()
  }, [])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  const refreshApp = (updated: Application) => {
    setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)))
    setSelectedApp(updated)
  }

  const updateStatus = async (
    status: Application["status"],
    extras?: { rejectionReason?: string; siteVisitDate?: string },
  ) => {
    if (!selectedApp) return
    const res = await fetch("/api/officer/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: selectedApp.id, status, ...extras }),
    })
    const data = await res.json()
    if (res.ok) {
      refreshApp(data.application)
    } else {
      alert(data.error || "Failed to update application")
    }
  }

  const handleApprove = () => updateStatus("approved")

  const handleReject = async () => {
    await updateStatus("rejected", { rejectionReason: rejectReason })
    setShowRejectDialog(false)
    setRejectReason("")
  }

  const handleScheduleSiteVisit = async () => {
    await updateStatus("site_visit_scheduled", { siteVisitDate })
    setShowScheduleDialog(false)
    setSiteVisitDate("")
  }

  const renderDocument = (name: string, doc?: DocumentMeta) => (
    <div key={name} className="flex items-center justify-between p-2 rounded border border-border">
      <span className="text-sm capitalize text-foreground">{name.replace(/([A-Z])/g, " $1").trim()}</span>
      {doc ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
            <a href={doc.url} target="_blank" rel="noreferrer">
              <Download className="w-3 h-3" />
            </a>
          </Button>
        </div>
      ) : (
        <AlertCircle className="w-4 h-4 text-red-500" />
      )}
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Applications</h1>
          <p className="text-muted-foreground">Review and manage solar installation applications</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or application ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="site_visit_scheduled">Site Visit Scheduled</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Applications ({filteredApplications.length})</CardTitle>
            <CardDescription>Click on an application to review details and take action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const status = statusConfig[app.status] || statusConfig.pending
                const StatusIcon = status.icon
                return (
                  <div
                    key={app.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg border border-border hover:border-blue-500/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-start gap-4 mb-4 lg:mb-0">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{app.customerName}</p>
                          <Badge className={status.color} variant="secondary">
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{app.id}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {app.address} • {app.technicalDetails?.roofType || app.connectionPhase || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</p>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Application Detail Dialog */}
        <Dialog
          open={!!selectedApp && !showRejectDialog && !showScheduleDialog}
          onOpenChange={() => setSelectedApp(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Application Review</DialogTitle>
              <DialogDescription>{selectedApp?.id}</DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="text-foreground">{selectedApp.customerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="text-foreground">{selectedApp.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="text-foreground">{selectedApp.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Address</p>
                      <p className="text-foreground">{selectedApp.address}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Technical Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Roof Type</p>
                      <p className="text-foreground">{selectedApp.technicalDetails.roofType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Roof Area</p>
                      <p className="text-foreground">{selectedApp.technicalDetails.roofArea}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Consumption</p>
                      <p className="text-foreground">{selectedApp.technicalDetails.monthlyConsumption}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Connection Phase</p>
                      <p className="text-foreground">{selectedApp.technicalDetails.connectionPhase}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {renderDocument("nic", selectedApp.documents.nic)}
                    {renderDocument("bankDetails", selectedApp.documents.bankDetails)}
                    {renderDocument("electricityBill", selectedApp.documents.electricityBill)}
                    {renderDocument("propertyDocument", selectedApp.documents.propertyDocument)}
                  </div>
                </div>

                {/* Review metadata */}
                {selectedApp.reviewedAt && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Verification Timeline
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Last reviewed at {new Date(selectedApp.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedApp?.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-500/50 hover:bg-red-500/10 bg-transparent"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="outline" className="bg-transparent" onClick={() => setShowScheduleDialog(true)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Site Visit
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleApprove}>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {selectedApp?.status === "site_visit_scheduled" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-500/50 hover:bg-red-500/10 bg-transparent"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleApprove}>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve After Visit
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-foreground">Reject Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejection. This will be sent to the customer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  placeholder="Enter the reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Site Visit Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-foreground">Schedule Site Visit</DialogTitle>
              <DialogDescription>Select a date for the site inspection visit.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Site Visit Date</Label>
                <Input type="date" value={siteVisitDate} onChange={(e) => setSiteVisitDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleScheduleSiteVisit}
                disabled={!siteVisitDate}
              >
                Schedule Visit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function OfficerApplications() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OfficerApplicationsContent />
    </Suspense>
  )
}
