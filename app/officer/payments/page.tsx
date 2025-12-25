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
import { fetchPayments, type Invoice } from "@/lib/auth"

export default function OfficerPaymentsPage() {
  const [payments, setPayments] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Invoice | null>(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPayments()
        setPayments(data.invoices)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load payments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pendingPayments = payments.filter((p) => p.status === "pending")
  const verifiedPayments = payments.filter((p) => p.status === "paid")
  const overduePayments = payments.filter((p) => p.status === "overdue")

  const totals = useMemo(() => {
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalVerified = verifiedPayments.reduce((sum, p) => sum + p.amount, 0)
    return { totalPending, totalVerified }
  }, [pendingPayments, verifiedPayments])

  const handleStatusUpdate = async (status: "paid" | "overdue") => {
    if (!selectedPayment) return
    try {
      const response = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error("Unable to update payment")
      }
      setPayments((prev) => prev.map((p) => (p.id === selectedPayment.id ? { ...p, status } : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update payment")
    } finally {
      setVerifyDialogOpen(false)
      setRejectDialogOpen(false)
      setSelectedPayment(null)
      setRejectionReason("")
    }
  }

  const filteredPayments = (list: Invoice[]) =>
    list.filter(
      (p) =>
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.applicationId.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const getTypeLabel = (type: Invoice["type"]) => {
    const labels = {
      authority_fee: "Authority Fee",
      installation: "Installation",
      monthly_bill: "Monthly Bill",
    }
    return labels[type]
  }

  const getTypeColor = (type: Invoice["type"]) => {
    const colors = {
      authority_fee: "bg-blue-500/10 text-blue-600",
      installation: "bg-emerald-500/10 text-emerald-600",
      monthly_bill: "bg-amber-500/10 text-amber-600",
    }
    return colors[type]
  }

  const PaymentCard = ({ payment }: { payment: Invoice }) => (
    <div className="p-4 rounded-lg border border-border hover:border-emerald-500/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground">{payment.id}</p>
            <Badge className={getTypeColor(payment.type)} variant="secondary">
              {getTypeLabel(payment.type)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{payment.description}</p>
          <p className="text-xs text-muted-foreground">App: {payment.applicationId}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-emerald-600">LKR {payment.amount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Status: </span>
            <span className="text-foreground capitalize">{payment.status.replace("_", " ")}</span>
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
                  Mark Paid
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
                  Flag Issue
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments & Invoices</h1>
            <p className="text-muted-foreground">
              Review customer payments and approve or flag invoices for follow-up
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-foreground">LKR {totals.totalPending.toLocaleString()}</p>
              </div>
              <CreditCard className="w-8 h-8 text-amber-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-foreground">LKR {totals.totalVerified.toLocaleString()}</p>
              </div>
              <Banknote className="w-8 h-8 text-emerald-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-foreground">{overduePayments.length}</p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({verifiedPayments.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overduePayments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">Loading payments...</CardContent>
              </Card>
            ) : (
              filteredPayments(pendingPayments).map((payment) => <PaymentCard key={payment.id} payment={payment} />)
            )}
          </TabsContent>
          <TabsContent value="verified" className="mt-4 space-y-3">
            {filteredPayments(verifiedPayments).map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </TabsContent>
          <TabsContent value="overdue" className="mt-4 space-y-3">
            {filteredPayments(overduePayments).map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </TabsContent>
        </Tabs>

        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Payment as Paid</DialogTitle>
              <DialogDescription>
                Confirm that you have verified the receipt and want to mark this payment as paid.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleStatusUpdate("paid")} className="bg-emerald-500 hover:bg-emerald-600">
                Confirm Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Flag Payment</DialogTitle>
              <DialogDescription>Add a note for why this payment needs follow-up.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Provide more details..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleStatusUpdate("overdue")} className="bg-red-500 hover:bg-red-600 text-white">
                Flag as Overdue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
