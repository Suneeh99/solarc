"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Zap,
  Download,
  CreditCard,
  Building,
} from "lucide-react"
import { fetchApplication, type Application } from "@/lib/auth"

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending Review", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  under_review: { label: "Under Review", color: "bg-blue-500/10 text-blue-600", icon: FileText },
  site_visit_scheduled: { label: "Site Visit Scheduled", color: "bg-cyan-500/10 text-cyan-600", icon: Calendar },
  approved: { label: "Approved", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: AlertCircle },
  payment_pending: { label: "Payment Pending", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  payment_confirmed: { label: "Payment Confirmed", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  finding_installer: { label: "Finding Installer", color: "bg-blue-500/10 text-blue-600", icon: FileText },
  installation_in_progress: { label: "Installation In Progress", color: "bg-cyan-500/10 text-cyan-600", icon: Zap },
  installation_complete: {
    label: "Installation Complete",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
  final_inspection: { label: "Final Inspection", color: "bg-blue-500/10 text-blue-600", icon: FileText },
  agreement_pending: { label: "Agreement Pending", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
}

const workflowSteps = [
  { key: "pending", label: "Application Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "site_visit_scheduled", label: "Site Visit" },
  { key: "approved", label: "Approved" },
  { key: "payment_pending", label: "Authority Fee" },
  { key: "finding_installer", label: "Find Installer" },
  { key: "installation_in_progress", label: "Installation" },
  { key: "final_inspection", label: "Final Inspection" },
  { key: "completed", label: "Completed" },
]

export default function ApplicationDetail() {
  const params = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const app = await fetchApplication(params.id as string)
        setApplication(app)
        if (!app) setError("Application not found")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load application")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading application...</div>
      </DashboardLayout>
    )
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-destructive">{error || "Application not found"}</p>
        </div>
      </DashboardLayout>
    )
  }

  const status = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = status.icon
  const currentStepIndex = workflowSteps.findIndex((s) => s.key === application.status)
  const canFindInstaller = ["approved", "payment_confirmed", "finding_installer"].includes(application.status)
  const needsPayment = application.status === "approved"

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/customer/applications">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{application.id}</h1>
              <Badge className={status.color} variant="secondary">
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">Created on {new Date(application.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Progress Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Application Progress</CardTitle>
            <CardDescription>Track your application through each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex items-center justify-between">
                {workflowSteps.map((step, index) => {
                  const isCompleted = index < currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const isRejected = application.status === "rejected" && step.key === "approved"

                  return (
                    <div key={step.key} className="flex flex-col items-center relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                              : isRejected
                                ? "bg-red-500 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : isRejected ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center max-w-16 ${
                          isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                      {index < workflowSteps.length - 1 && (
                        <div
                          className={`absolute top-4 left-8 w-[calc(100%-2rem)] h-0.5 ${
                            isCompleted ? "bg-emerald-500" : "bg-muted"
                          }`}
                          style={{ width: "calc(100% + 1rem)" }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        {needsPayment && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Authority Fee Payment Required</h3>
                    <p className="text-sm text-muted-foreground">
                      Pay the CEB authority fee to proceed with your installation
                    </p>
                  </div>
                </div>
                <Link href="/customer/invoices">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">Pay Now</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {canFindInstaller && (
          <Card className="border-emerald-500/50 bg-emerald-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Building className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Find Your Installer</h3>
                    <p className="text-sm text-muted-foreground">Browse solar packages or open a bid for installers</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/customer/installers">
                    <Button variant="outline" className="bg-transparent">
                      Browse Packages
                    </Button>
                  </Link>
                  <Link href={`/customer/bids/new?application=${application.id}`}>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Open Bid</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Roof Type</p>
                  <p className="font-medium text-foreground">{application.technicalDetails.roofType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roof Area</p>
                  <p className="font-medium text-foreground">{application.technicalDetails.roofArea}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Consumption</p>
                  <p className="font-medium text-foreground">{application.technicalDetails.monthlyConsumption}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Connection Phase</p>
                  <p className="font-medium text-foreground">{application.technicalDetails.connectionPhase}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(application.documents).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-xs text-muted-foreground">{value}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Selected Installer */}
        {application.selectedInstaller && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-500" />
                Selected Installer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-semibold text-foreground">{application.selectedInstaller.name}</p>
                  <p className="text-sm text-muted-foreground">{application.selectedInstaller.packageName}</p>
                </div>
                <p className="text-lg font-bold text-emerald-500">
                  Rs. {application.selectedInstaller.price.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Reason */}
        {application.status === "rejected" && application.rejectionReason && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Rejection Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{application.rejectionReason}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
