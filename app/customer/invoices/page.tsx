"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, Clock, CheckCircle, AlertCircle, Download, CreditCard } from "lucide-react"
import { fetchPayments, type Invoice, type MonthlyBill } from "@/lib/auth"

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [monthlyBills, setMonthlyBills] = useState<MonthlyBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const payments = await fetchPayments()
        setInvoices(payments.invoices)
        setMonthlyBills(payments.monthlyBills)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load payments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const summary = useMemo(() => {
    const pending = invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0)
    const paid = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
    const credit = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0)
    return { pending, paid, credit }
  }, [invoices, monthlyBills])

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices & Bills</h1>
          <p className="text-muted-foreground">View and manage your payments and monthly energy bills</p>
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

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
                  <p className="text-2xl font-bold text-foreground">Rs. {summary.pending.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-foreground">Rs. {summary.paid.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-emerald-500">Rs. {summary.credit.toLocaleString()}</p>
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
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading invoices...</div>
                  ) : (
                    invoices.map((invoice) => (
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
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
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
                    ))
                  )}
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
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading monthly bills...</div>
                  ) : (
                    monthlyBills.map((bill) => (
                      <div key={bill.id} className="p-4 rounded-lg border border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <div className="flex items-center gap-2 mb-2 sm:mb-0">
                            <p className="font-semibold text-foreground">
                              {new Date(bill.year, bill.month - 1).toLocaleString("default", { month: "long" })}{" "}
                              {bill.year}
                            </p>
                            {getStatusBadge(bill.status)}
                          </div>
                          <p
                            className={`text-lg font-bold ${bill.amount < 0 ? "text-emerald-500" : "text-foreground"}`}
                          >
                            {bill.amount < 0 ? "Credit: " : ""}Rs. {Math.abs(bill.amount).toLocaleString()}
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
