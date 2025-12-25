"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, Clock, CheckCircle, AlertCircle, Download, CreditCard } from "lucide-react"
import { Invoice, MonthlyBill } from "@/lib/prisma-types"

export default function CustomerInvoices() {
  const customerId = "CUST-001"
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [monthlyBills, setMonthlyBills] = useState<(MonthlyBill & { invoice?: Invoice | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/invoices?customerId=${customerId}&includeMonthly=true`)
        if (!response.ok) throw new Error("Unable to load invoices")
        const data = await response.json()
        setInvoices(data.invoices ?? [])
        setMonthlyBills(data.monthlyBills ?? [])
      } catch (err) {
        console.error(err)
        setError("Failed to load invoices")
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const pendingTotal = useMemo(
    () => invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0),
    [invoices],
  )
  const paidTotal = useMemo(
    () => invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0),
    [invoices],
  )
  const netCredit = useMemo(
    () =>
      monthlyBills
        .map((bill) => bill.netAmount ?? bill.invoice?.amount ?? 0)
        .filter((amount) => amount < 0)
        .reduce((sum, amt) => sum + amt, 0),
    [monthlyBills],
  )

  const handleCreatePayment = async (invoice: Invoice) => {
    setPaymentMessage(null)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: invoice.amount,
          customerId,
          applicationId: invoice.applicationId,
          invoiceId: invoice.id,
          type: invoice.type,
          description: invoice.description,
          paymentMethod: "online",
        }),
      })
      if (!response.ok) throw new Error("Failed to create payment")
      const data = await response.json()
      setPaymentMessage(`Payment intent created. Client secret: ${data.clientSecret}`)
    } catch (err) {
      console.error(err)
      setError("Unable to start payment")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-500/10 text-red-600" variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        )
      default:
        return null
    }
  }

  const formatMonth = (month: number) => new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Invoices & Bills</h1>
          <Card>
            <CardContent className="p-6 text-muted-foreground">Loading invoices...</CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices & Bills</h1>
          <p className="text-muted-foreground">View and manage your payments and monthly energy bills</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-500/10 p-3 rounded">{error}</p>}
        {paymentMessage && <p className="text-sm text-emerald-700 bg-emerald-500/10 p-3 rounded">{paymentMessage}</p>}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">Rs. {pendingTotal.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-foreground">Rs. {paidTotal.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Metering Credit</p>
                  <p className="text-2xl font-bold text-emerald-500">Rs. {Math.abs(netCredit).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Payment Invoices</CardTitle>
                <CardDescription>Authority fees and installation payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{invoice.id}</p>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{invoice.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            {invoice.paidAt && ` • Paid: ${new Date(invoice.paidAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-foreground">Rs. {invoice.amount.toLocaleString()}</p>
                        {invoice.status === "pending" ? (
                          <Button
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => handleCreatePayment(invoice)}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Monthly Energy Bills</CardTitle>
                <CardDescription>Net metering statements and energy usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyBills.map((bill) => (
                    <div key={bill.id} className="p-4 rounded-lg border border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                          <p className="font-semibold text-foreground">
                            {formatMonth(bill.month)} {bill.year}
                          </p>
                          {getStatusBadge(bill.invoice?.status ?? "paid")}
                        </div>
                        <p
                          className={`text-lg font-bold ${
                            bill.netAmount < 0 || (bill.invoice?.amount ?? 0) < 0 ? "text-emerald-500" : "text-foreground"
                          }`}
                        >
                          {bill.netAmount < 0 || (bill.invoice?.amount ?? 0) < 0 ? "Credit: " : ""}
                          Rs. {Math.abs(bill.netAmount ?? bill.invoice?.amount ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-muted-foreground">Generated</p>
                          <p className="font-semibold text-foreground">{bill.kwhGenerated} kWh</p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-500/10">
                          <p className="text-muted-foreground">Exported</p>
                          <p className="font-semibold text-emerald-500">{bill.kwhExported} kWh</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10">
                          <p className="text-muted-foreground">Imported</p>
                          <p className="font-semibold text-amber-500">{bill.kwhImported} kWh</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Download Statement
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
