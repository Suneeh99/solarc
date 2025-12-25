"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useNotifications } from "@/components/notifications"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  ShieldCheck,
  Unlock,
  MailCheck,
} from "lucide-react"

interface Payment {
  id: string
  customerId: string
  customerName: string
  applicationId: string
  installationId?: string
  type: "authority_fee" | "installation" | "inspection" | "application_fee"
  amount: number
  paymentMethod: string
  referenceNo: string
  submittedAt: string
  status: "pending" | "verified" | "rejected"
  receiptUrl?: string
  notes?: string
  invoiceId?: string
  unlocksInstallation?: boolean
}

interface ReleaseLog {
  paymentId: string
  installationId?: string
  note: string
  timestamp: string
}

const demoPayments: Payment[] = [
  {
    id: "PAY-AUTH-001",
    customerId: "CUST-001",
    customerName: "John Silva",
    applicationId: "APP-001",
    installationId: "INST-003",
    type: "authority_fee",
    amount: 25000,
    paymentMethod: "Bank Transfer",
    referenceNo: "AUTH20240301",
    submittedAt: "2024-03-01",
    status: "pending",
    receiptUrl: "/pdfs/invoice-auth-001.pdf",
    invoiceId: "INV-AUTH-001",
    unlocksInstallation: true,
    notes: "Awaiting officer confirmation to unlock installation",
  },
  {
    id: "PAY-002",
    customerId: "CUST-002",
    customerName: "Maria Fernando",
    applicationId: "APP-002",
    installationId: "INST-002",
    type: "installation",
    amount: 850000,
    paymentMethod: "Bank Transfer",
    referenceNo: "BT2024012002",
    submittedAt: "2024-01-19",
    status: "verified",
    invoiceId: "INV-INST-002",
  },
  {
    id: "PAY-003",
    customerId: "CUST-003",
    customerName: "David Perera",
    applicationId: "APP-003",
    type: "inspection",
    amount: 2500,
    paymentMethod: "Online Payment",
    referenceNo: "OP2024012003",
    submittedAt: "2024-01-18",
    status: "verified",
  },
  {
    id: "PAY-004",
    customerId: "CUST-004",
    customerName: "Lisa Jayawardena",
    applicationId: "APP-004",
    installationId: "INST-004",
    type: "authority_fee",
    amount: 25000,
    paymentMethod: "Cash",
    referenceNo: "AUTH2024012004",
    submittedAt: "2024-01-17",
    status: "rejected",
    unlocksInstallation: true,
    notes: "Receipt image unclear, please resubmit",
  },
]

const initialReleaseLog: ReleaseLog[] = [
  {
    paymentId: "PAY-002",
    installationId: "INST-002",
    note: "Installation milestone paid and released for inspection scheduling",
    timestamp: "2024-01-18T09:00:00Z",
  },
]

export default function OfficerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(demoPayments)
  const [releaseLog, setReleaseLog] = useState<ReleaseLog[]>(initialReleaseLog)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const { addNotification } = useNotifications()

  const pendingPayments = payments.filter((p) => p.status === "pending")
  const verifiedPayments = payments.filter((p) => p.status === "verified")
  const rejectedPayments = payments.filter((p) => p.status === "rejected")

  const lockedInstallations = payments.filter((p) => p.unlocksInstallation && p.status !== "verified")
  const releasedInstallations = payments.filter((p) => p.unlocksInstallation && p.status === "verified")

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalVerified = verifiedPayments.reduce((sum, p) => sum + p.amount, 0)

  const handleVerify = () => {
    if (!selectedPayment) return

    const updated = payments.map((p) => (p.id === selectedPayment.id ? { ...p, status: "verified", notes: undefined } : p))
    setPayments(updated)

    const releaseNote = selectedPayment.unlocksInstallation
      ? `Authority fee confirmed. Installation ${selectedPayment.installationId} unlocked for scheduling.`
      : `Payment ${selectedPayment.id} verified.`

    setReleaseLog([{ paymentId: selectedPayment.id, installationId: selectedPayment.installationId, note: releaseNote, timestamp: new Date().toISOString() }, ...releaseLog])

    addNotification({
      type: "payment",
      title: `${selectedPayment.type === "authority_fee" ? "Authority fee" : "Payment"} verified`,
      message: `${selectedPayment.id} for ${selectedPayment.applicationId} has been verified. ${selectedPayment.unlocksInstallation ? "Installer can proceed to schedule work." : "Invoice marked as paid."}`,
      link: selectedPayment.unlocksInstallation ? "/officer/installations" : "/officer/payments",
      channel: "email",
    })

    if (selectedPayment.unlocksInstallation) {
      addNotification({
        type: "installation",
        title: "Installation unlocked",
        message: `${selectedPayment.installationId} can now be scheduled because the authority-fee receipt was approved.`,
        link: "/installer/orders",
        channel: "email",
      })
    }

    setVerifyDialogOpen(false)
    setSelectedPayment(null)
  }

  const handleReject = () => {
    if (!selectedPayment) return

    setPayments(
      payments.map((p) => (p.id === selectedPayment.id ? { ...p, status: "rejected", notes: rejectionReason } : p)),
    )

    addNotification({
      type: "payment",
      title: "Receipt rejected",
      message: `${selectedPayment.id} was rejected: ${rejectionReason}`,
      link: "/customer/invoices",
      channel: "email",
    })

    setRejectDialogOpen(false)
    setSelectedPayment(null)
    setRejectionReason("")
  }

  const getTypeLabel = (type: Payment["type"]) => {
    const labels = {
      authority_fee: "Authority Fee",
      application_fee: "Application Fee",
      installation: "Installation",
      inspection: "Inspection",
    }
    return labels[type]
  }

  const getTypeColor = (type: Payment["type"]) => {
    const colors = {
      authority_fee: "bg-purple-500/10 text-purple-600",
      application_fee: "bg-blue-500/10 text-blue-600",
      installation: "bg-emerald-500/10 text-emerald-600",
      inspection: "bg-amber-500/10 text-amber-600",
    }
    return colors[type]
  }

  const getStatusBadge = (status: Payment["status"]) => {
    const configs = {
      pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600", icon: Clock },
      verified: { label: "Verified", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
      rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: XCircle },
    }
    const { label, color, icon: Icon } = configs[status]
    return (
      <Badge className={color} variant="secondary">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const filteredPayments = (list: Payment[]) =>
    list.filter(
      (p) =>
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.applicationId.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <div className="p-4 rounded-lg border border-border hover:border-emerald-500/30 transition-colors space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-foreground">{payment.id}</p>
            <Badge className={getTypeColor(payment.type)} variant="secondary">
              {getTypeLabel(payment.type)}
            </Badge>
            {payment.unlocksInstallation && (
              <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                <Unlock className="w-3 h-3 mr-1" />
                Unlocks installation
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>{payment.customerName}</span>
            <span className="text-border">•</span>
            <span className="font-mono text-foreground">App {payment.applicationId}</span>
            {payment.installationId && (
              <span className="font-mono text-foreground">Inst {payment.installationId}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-emerald-600">LKR {payment.amount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Reference</p>
          <p className="text-sm font-medium text-foreground">{payment.referenceNo}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Submitted</p>
          <p className="text-sm font-medium text-foreground">{new Date(payment.submittedAt).toLocaleDateString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Invoice</p>
          {payment.invoiceId ? (
            <Link href={`/customer/invoices/${payment.invoiceId}`} className="text-sm font-medium text-emerald-600 hover:underline">
              {payment.invoiceId}
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">Generated on verification</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge(payment.status)}
          {payment.receiptUrl && (
            <a href={payment.receiptUrl} download className="text-xs text-emerald-600 hover:underline font-medium">
              Download receipt
            </a>
          )}
          {payment.unlocksInstallation && payment.status !== "verified" && (
            <Badge className="bg-purple-500/10 text-purple-600" variant="secondary">
              Awaiting officer release
            </Badge>
          )}
          {payment.status === "verified" && payment.unlocksInstallation && (
            <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Installation unlocked
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {payment.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-emerald-600 border-emerald-600 hover:bg-emerald-600/10 bg-transparent"
                onClick={() => {
                  setSelectedPayment(payment)
                  setVerifyDialogOpen(true)
                }}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Verify
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-600/10 bg-transparent"
                onClick={() => {
                  setSelectedPayment(payment)
                  setRejectDialogOpen(true)
                }}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
      {payment.notes && <p className="mt-2 text-xs text-red-600 bg-red-500/10 p-2 rounded">{payment.notes}</p>}
    </div>
  )

  const releaseMemo = useMemo(
    () =>
      releaseLog.map((log) => ({
        ...log,
        label: log.installationId ? `${log.installationId} released` : "Payment update",
      })),
    [releaseLog],
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Verification</h1>
          <p className="text-muted-foreground">
            Review authority-fee receipts, generate invoices, and unlock installations once approved
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">LKR {(totalPending / 1000).toFixed(0)}K queued</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">LKR {(totalVerified / 1000).toFixed(0)}K</p>
                </div>
                <CreditCard className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Authority fee locks</p>
                  <p className="text-2xl font-bold text-blue-600">{lockedInstallations.length}</p>
                </div>
                <ShieldCheck className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Installations released</p>
                  <p className="text-2xl font-bold text-cyan-600">{releasedInstallations.length}</p>
                </div>
                <Unlock className="w-8 h-8 text-cyan-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, ID, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="bg-muted">
            <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({verifiedPayments.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedPayments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-4">
            {filteredPayments(pendingPayments).length > 0 ? (
              filteredPayments(pendingPayments).map((payment) => <PaymentCard key={payment.id} payment={payment} />)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-emerald-500/50 mb-4" />
                  <p className="text-muted-foreground">No pending payments to verify</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verified" className="mt-4 space-y-4">
            {filteredPayments(verifiedPayments).map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="mt-4 space-y-4">
            {filteredPayments(rejectedPayments).map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Installation release log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Installation release log</CardTitle>
            <CardDescription>Track which payments unlocked authority-fee gates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {releaseMemo.map((entry) => (
              <div key={`${entry.paymentId}-${entry.timestamp}`} className="flex items-start justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">{entry.paymentId}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            ))}
            {releaseMemo.length === 0 && <p className="text-sm text-muted-foreground">No unlock actions yet</p>}
          </CardContent>
        </Card>

        {/* Verify Dialog */}
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Payment</DialogTitle>
              <DialogDescription>Confirm the receipt and release any downstream gates.</DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID:</span>
                    <span className="font-medium text-foreground">{selectedPayment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium text-foreground">{selectedPayment.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-emerald-600">LKR {selectedPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-mono text-foreground">{selectedPayment.referenceNo}</span>
                  </div>
                  {selectedPayment.unlocksInstallation && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Installation</span>
                      <span className="font-medium text-foreground">{selectedPayment.installationId}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                    <MailCheck className="w-4 h-4" />
                    Invoice and email delivery
                  </p>
                  <p className="text-xs text-emerald-900/80 mt-1">
                    {selectedPayment.invoiceId
                      ? `Marking this verified will attach invoice ${selectedPayment.invoiceId} and notify the customer.`
                      : "A paid invoice PDF will be generated and emailed to the customer on confirmation."}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleVerify} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payment</DialogTitle>
              <DialogDescription>Please provide a reason for rejecting this payment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReject} disabled={!rejectionReason.trim()} className="bg-red-600 hover:bg-red-700">
                <XCircle className="w-4 h-4 mr-2" />
                Reject Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
