"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  Banknote,
} from "lucide-react"

import { fetchPayments, type Invoice } from "@/lib/auth"

export default function OfficerPaymentsPage() {
  const [payments, setPayments] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<Invoice | null>(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [note, setNote] = useState("")

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
  const paidPayments = payments.filter((p) => p.status === "paid")
  const overduePayments = payments.filter((p) => p.status === "overdue")

  const totals = useMemo(() => {
    return {
      pending: pendingPayments.reduce((s, p) => s + p.amount, 0),
      paid: paidPayments.reduce((s, p) => s + p.amount, 0),
    }
  }, [pendingPayments, paidPayments])

  async function updateStatus(status: "paid" | "overdue") {
    if (!selectedPayment) return

    try {
      const res = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      })

      if (!res.ok) {
        throw new Error("Failed to update payment")
      }

      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id ? { ...p, status } : p,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setVerifyDialogOpen(false)
      setRejectDialogOpen(false)
      setSelectedPayment(null)
      setNote("")
    }
  }

  const filtered = (list: Invoice[]) =>
    list.filter(
      (p) =>
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const typeLabel: Record<Invoice["type"], string> = {
    authority_fee: "Authority Fee",
    installation: "Installation",
    monthly_bill: "Monthly Bill",
  }

  const statusBadge = (status: Invoice["status"]) => {
    const map = {
      pending: {
        label: "Pending",
        className: "bg-amber-500/10 text-amber-600",
        icon: Clock,
      },
      paid: {
        label: "Paid",
        className: "bg-emerald-500/10 text-emerald-600",
        icon: CheckCircle,
      },
      overdue: {
        label: "Overdue",
        className: "bg-red-500/10 text-red-600",
        icon: XCircle,
      },
    }

    const cfg = map[status]
    const Icon = cfg.icon

    return (
      <Badge variant="secondary" className={cfg.className}>
        <Icon className="w-3 h-3 mr-1" />
        {cfg.label}
      </Badge>
    )
  }

  function PaymentCard({ payment }: { payment: Invoice }) {
    return (
      <div className="p-4 rounded-lg border border-border space-y-3">
        <div className="flex justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{payment.id}</p>
              <Badge variant="secondary">
                {typeLabel[payment.type]}
              </Badge>
              {statusBadge(payment.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {payment.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Application: {payment.applicationId}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-emerald-600">
              LKR {payment.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Due {new Date(payment.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {payment.status === "pending" && (
          <div className="flex gap-2 pt-3 border-t">
            <Button
              size="sm"
              className="bg-emerald-500 text-white"
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
              className="text-red-600 border-red-600"
              onClick={() => {
                setSelectedPayment(payment)
                setRejectDialogOpen(true)
              }}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Flag
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Payments & Invoices</h1>
            <p className="text-muted-foreground">
              Review customer payments and update invoice status
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  LKR {totals.pending.toLocaleString()}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-amber-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">
                  LKR {totals.paid.toLocaleString()}
                </p>
              </div>
              <Banknote className="w-8 h-8 text-emerald-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">
                  {overduePayments.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({paidPayments.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overduePayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading payments…
                </CardContent>
              </Card>
            ) : (
              filtered(pendingPayments).map((p) => (
                <PaymentCard key={p.id} payment={p} />
              ))
            )}
          </TabsContent>

          <TabsContent value="paid" className="mt-4 space-y-3">
            {filtered(paidPayments).map((p) => (
              <PaymentCard key={p.id} payment={p} />
            ))}
          </TabsContent>

          <TabsContent value="overdue" className="mt-4 space-y-3">
            {filtered(overduePayments).map((p) => (
              <PaymentCard key={p.id} payment={p} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Mark this payment as paid after verifying the receipt.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-500 text-white"
                onClick={() => updateStatus("paid")}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Flag Payment</DialogTitle>
              <DialogDescription>
                Add a note explaining why this payment needs follow-up.
              </DialogDescription>
            </DialogHeader>
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white"
                onClick={() => updateStatus("overdue")}
              >
                Flag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
