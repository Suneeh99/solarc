"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
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
import { Search, CheckCircle, XCircle, Clock, CreditCard, Banknote } from "lucide-react"
import { PaymentTransaction, PaymentStatus } from "@/lib/prisma-types"

type Payment = PaymentTransaction & { customerName?: string }

export default function OfficerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === "pending_review" || p.status === "requires_action"),
    [payments],
  )
  const verifiedPayments = useMemo(
    () => payments.filter((p) => p.status === "verified" || p.status === "succeeded"),
    [payments],
  )
  const rejectedPayments = useMemo(() => payments.filter((p) => p.status === "rejected"), [payments])

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalVerified = verifiedPayments.reduce((sum, p) => sum + p.amount, 0)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/payments")
        if (!response.ok) {
          throw new Error("Unable to load payments")
        }
        const data = await response.json()
        setPayments(data.transactions ?? [])
      } catch (err) {
        console.error(err)
        setError("Failed to load payments")
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const updatePayment = async (status: PaymentStatus, notes?: string) => {
    if (!selectedPayment) return
    const response = await fetch(`/api/payments/${selectedPayment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    })
    if (!response.ok) {
      setError("Failed to update payment")
      return
    }
    const data = await response.json()
    if (data.payment) {
      setPayments(payments.map((p) => (p.id === data.payment.id ? data.payment : p)))
    }
  }

  const handleVerify = async () => {
    if (selectedPayment) {
      await updatePayment("verified")
      setVerifyDialogOpen(false)
      setSelectedPayment(null)
    }
  }

  const handleReject = () => {
    if (selectedPayment) {
      updatePayment("rejected", rejectionReason)
      setRejectDialogOpen(false)
      setSelectedPayment(null)
      setRejectionReason("")
    }
  }

  const getTypeLabel = (type: Payment["type"]) => {
    const labels = {
      authority_fee: "Authority Fee",
      installation: "Installation Payment",
      inspection: "Inspection Fee",
      monthly_bill: "Monthly Bill",
    }
    return labels[type] ?? type
  }

  const getTypeColor = (type: Payment["type"]) => {
    const colors = {
      authority_fee: "bg-blue-500/10 text-blue-600",
      installation: "bg-emerald-500/10 text-emerald-600",
      inspection: "bg-amber-500/10 text-amber-600",
      monthly_bill: "bg-purple-500/10 text-purple-600",
    }
    return colors[type] ?? "bg-muted text-foreground"
  }

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString()
  }

  const filteredPayments = (list: Payment[]) =>
    list.filter(
      (p) =>
        (p.customerName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.reference ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <div className="p-4 rounded-lg border border-border hover:border-emerald-500/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground">{payment.id}</p>
            <Badge className={getTypeColor(payment.type)} variant="secondary">
              {getTypeLabel(payment.type)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{payment.customerName ?? payment.customerId}</p>
          <p className="text-xs text-muted-foreground">App: {payment.applicationId ?? "—"}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-emerald-600">LKR {payment.amount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{payment.paymentMethod ?? "Unspecified"}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Ref: </span>
            <span className="text-foreground font-mono">{payment.reference ?? "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            {(payment.status === "pending_review" || payment.status === "requires_action") && (
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
            {(payment.status === "verified" || payment.status === "succeeded") && (
              <Badge className="bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {payment.status === "rejected" && (
              <Badge className="bg-red-500/10 text-red-600">
                <XCircle className="w-3 h-3 mr-1" />
                Rejected
              </Badge>
            )}
          </div>
        </div>
        {payment.notes && <p className="mt-2 text-xs text-red-600 bg-red-500/10 p-2 rounded">{payment.notes}</p>}
      </div>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Payment Verification</h1>
          <Card>
            <CardContent className="p-6 text-muted-foreground">Loading payments...</CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Verification</h1>
          <p className="text-muted-foreground">Review and verify customer payment submissions</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-500/10 p-3 rounded">{error}</p>}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Today</p>
                  <p className="text-2xl font-bold text-emerald-600">{verifiedPayments.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold text-blue-600">LKR {(totalPending / 1000).toFixed(0)}K</p>
                </div>
                <Banknote className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Amount</p>
                  <p className="text-2xl font-bold text-cyan-600">LKR {(totalVerified / 1000).toFixed(0)}K</p>
                </div>
                <CreditCard className="w-8 h-8 text-cyan-500/50" />
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

        {/* Verify Dialog */}
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Payment</DialogTitle>
              <DialogDescription>Confirm that this payment has been received and verified.</DialogDescription>
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
                    <span className="font-mono text-foreground">{selectedPayment.reference ?? "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="text-foreground">{formatDate(selectedPayment.createdAt)}</span>
                  </div>
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
