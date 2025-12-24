"use client"

import { useState } from "react"
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

interface Installation {
  id: string
  applicationId: string
  customerId: string
  customerName: string
  customerPhone: string
  address: string
  installerId: string
  installerName: string
  capacity: string
  status: "pending_start" | "in_progress" | "pending_inspection" | "completed" | "issues_reported"
  progress: number
  startDate?: string
  expectedCompletion?: string
  completedDate?: string
  notes?: string
  milestones: {
    name: string
    completed: boolean
    date?: string
  }[]
}

const demoInstallations: Installation[] = [
  {
    id: "INST-001",
    applicationId: "APP-001",
    customerId: "CUST-001",
    customerName: "John Silva",
    customerPhone: "+94 77 123 4567",
    address: "123 Solar Lane, Colombo 07",
    installerId: "INS-001",
    installerName: "SunPower Systems",
    capacity: "5 kW",
    status: "in_progress",
    progress: 60,
    startDate: "2024-01-15",
    expectedCompletion: "2024-01-25",
    milestones: [
      { name: "Site Preparation", completed: true, date: "2024-01-15" },
      { name: "Panel Mounting", completed: true, date: "2024-01-17" },
      { name: "Electrical Wiring", completed: true, date: "2024-01-19" },
      { name: "Inverter Installation", completed: false },
      { name: "Grid Connection", completed: false },
    ],
  },
  {
    id: "INST-002",
    applicationId: "APP-002",
    customerId: "CUST-002",
    customerName: "Maria Fernando",
    customerPhone: "+94 71 234 5678",
    address: "456 Green Avenue, Kandy",
    installerId: "INS-002",
    installerName: "Green Solar Co",
    capacity: "10 kW",
    status: "pending_inspection",
    progress: 100,
    startDate: "2024-01-10",
    completedDate: "2024-01-18",
    milestones: [
      { name: "Site Preparation", completed: true, date: "2024-01-10" },
      { name: "Panel Mounting", completed: true, date: "2024-01-12" },
      { name: "Electrical Wiring", completed: true, date: "2024-01-14" },
      { name: "Inverter Installation", completed: true, date: "2024-01-16" },
      { name: "Grid Connection", completed: true, date: "2024-01-18" },
    ],
  },
  {
    id: "INST-003",
    applicationId: "APP-003",
    customerId: "CUST-003",
    customerName: "David Perera",
    customerPhone: "+94 76 345 6789",
    address: "789 Energy Street, Negombo",
    installerId: "INS-001",
    installerName: "SunPower Systems",
    capacity: "3 kW",
    status: "pending_start",
    progress: 0,
    expectedCompletion: "2024-02-05",
    milestones: [
      { name: "Site Preparation", completed: false },
      { name: "Panel Mounting", completed: false },
      { name: "Electrical Wiring", completed: false },
      { name: "Inverter Installation", completed: false },
      { name: "Grid Connection", completed: false },
    ],
  },
  {
    id: "INST-004",
    applicationId: "APP-004",
    customerId: "CUST-004",
    customerName: "Lisa Jayawardena",
    customerPhone: "+94 70 456 7890",
    address: "321 Power Road, Galle",
    installerId: "INS-003",
    installerName: "EcoSolar Lanka",
    capacity: "8 kW",
    status: "issues_reported",
    progress: 40,
    startDate: "2024-01-12",
    expectedCompletion: "2024-01-22",
    notes: "Roof structure needs reinforcement before continuing",
    milestones: [
      { name: "Site Preparation", completed: true, date: "2024-01-12" },
      { name: "Panel Mounting", completed: true, date: "2024-01-14" },
      { name: "Electrical Wiring", completed: false },
      { name: "Inverter Installation", completed: false },
      { name: "Grid Connection", completed: false },
    ],
  },
]

export default function OfficerInstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>(demoInstallations)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)

  const getStatusBadge = (status: Installation["status"]) => {
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

  const stats = {
    total: installations.length,
    inProgress: installations.filter((i) => i.status === "in_progress").length,
    pendingInspection: installations.filter((i) => i.status === "pending_inspection").length,
    issues: installations.filter((i) => i.status === "issues_reported").length,
  }

  const handleApproveInspection = () => {
    if (selectedInstallation) {
      setInstallations(
        installations.map((i) =>
          i.id === selectedInstallation.id
            ? { ...i, status: "completed", completedDate: new Date().toISOString().split("T")[0] }
            : i,
        ),
      )
      setApproveDialogOpen(false)
      setSelectedInstallation(null)
    }
  }

  const filteredInstallations = installations.filter(
    (i) =>
      i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.installerName.toLowerCase().includes(searchTerm.toLowerCase()),
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
            <p className="font-bold text-emerald-600">{installation.capacity}</p>
            <p className="text-xs text-muted-foreground">{installation.applicationId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{installation.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="w-4 h-4" />
            <span>{installation.installerName}</span>
          </div>
        </div>

        {installation.status !== "pending_start" && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{installation.progress}%</span>
            </div>
            <Progress value={installation.progress} className="h-2" />
          </div>
        )}

        {installation.notes && (
          <div className="p-3 bg-red-500/10 rounded-lg mb-4">
            <p className="text-sm text-red-600">{installation.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {installation.startDate && <span>Started: {installation.startDate}</span>}
            {!installation.startDate && installation.expectedCompletion && (
              <span>Expected: {installation.expectedCompletion}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedInstallation(installation)
                setDetailsOpen(true)
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Details
            </Button>
            {installation.status === "pending_inspection" && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setSelectedInstallation(installation)
                  setApproveDialogOpen(true)
                }}
              >
                <FileCheck className="w-4 h-4 mr-1" />
                Inspect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Installation Management</h1>
          <p className="text-muted-foreground">Monitor and manage ongoing solar installations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-500/20 bg-slate-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Active</p>
                  <p className="text-2xl font-bold text-slate-600">{stats.total}</p>
                </div>
                <Zap className="w-8 h-8 text-slate-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Wrench className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Inspection</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingInspection}</p>
                </div>
                <FileCheck className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Issues Reported</p>
                  <p className="text-2xl font-bold text-red-600">{stats.issues}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search installations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* Installations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredInstallations.map((installation) => (
            <InstallationCard key={installation.id} installation={installation} />
          ))}
        </div>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Installation Details</DialogTitle>
              <DialogDescription>
                {selectedInstallation?.id} - {selectedInstallation?.customerName}
              </DialogDescription>
            </DialogHeader>
            {selectedInstallation && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-medium text-foreground">{selectedInstallation.customerName}</p>
                      <p className="text-sm text-muted-foreground">{selectedInstallation.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm text-foreground">{selectedInstallation.address}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Installer</p>
                      <p className="font-medium text-foreground">{selectedInstallation.installerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Capacity</p>
                      <p className="text-lg font-bold text-emerald-600">{selectedInstallation.capacity}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Installation Milestones</p>
                  <div className="space-y-3">
                    {selectedInstallation.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          milestone.completed ? "bg-emerald-500/10" : "bg-muted"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            milestone.completed ? "bg-emerald-500 text-white" : "bg-muted-foreground/20"
                          }`}
                        >
                          {milestone.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs text-muted-foreground">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${milestone.completed ? "text-foreground" : "text-muted-foreground"}`}>
                            {milestone.name}
                          </p>
                        </div>
                        {milestone.date && <p className="text-xs text-muted-foreground">{milestone.date}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Inspection Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Installation Inspection</DialogTitle>
              <DialogDescription>
                Confirm that the installation has been inspected and approved for grid connection.
              </DialogDescription>
            </DialogHeader>
            {selectedInstallation && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Installation ID:</span>
                  <span className="font-medium text-foreground">{selectedInstallation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium text-foreground">{selectedInstallation.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-bold text-emerald-600">{selectedInstallation.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Installer:</span>
                  <span className="text-foreground">{selectedInstallation.installerName}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproveInspection} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
