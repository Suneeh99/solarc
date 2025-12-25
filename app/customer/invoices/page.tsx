"use client"

import { useMemo } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, Clock, CheckCircle, AlertCircle, Download, CreditCard, Zap, FileText } from "lucide-react"
import { getDemoInvoices, getDemoMonthlyBills } from "@/lib/auth"

const customerInvoices = getDemoInvoices().filter((invoice) => invoice.customerId === "CUST-001")
const customerBills = getDemoMonthlyBills().filter((bill) => bill.customerId === "CUST-001")

export default function CustomerInvoices() {
  const totals = useMemo(() => {
    const pending = customerInvoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0)
    const paid = customerInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + Math.max(inv.amount, 0), 0)
    const credits = customerBills.filter((bill) => bill.amount < 0).reduce((sum, bill) => sum + Math.abs(bill.amount), 0)
    return { pending, paid, credits }
  }, [])

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

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      authority_fee: "bg-purple-500/10 text-purple-600",
      installation: "bg-emerald-500/10 text-emerald-600",
      monthly_bill: "bg-blue-500/10 text-blue-600",
    }
    const labels: Record<string, string> = {
      authority_fee: "Authority Fee",
      installation: "Installation",
      monthly_bill: "Monthly Bill",
    }
    return (
      <Badge className={styles[type]} variant="secondary">
        {labels[type]}
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices & Bills</h1>
          <p className="text-muted-foreground">
            Authority-fee receipts, installation milestones, and monthly bills generated from meter readings
          </p>
        </div>

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
                  <p className="text-2xl font-bold text-foreground">Rs. {totals.pending.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-foreground">Rs. {totals.paid.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-emerald-500">Rs. {totals.credits.toLocaleString()}</p>
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

          <TabsContent value="invoices" className="mt-4 space-y-4">
            {customerInvoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{invoice.id}</p>
                          {getStatusBadge(invoice.status)}
                          {getTypeBadge(invoice.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          {invoice.paidAt && ` • Paid: ${new Date(invoice.paidAt).toLocaleDateString()}`}
                          {invoice.meterReadingId && ` • From ${invoice.meterReadingId}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">Rs. {invoice.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{invoice.applicationId}</p>
                      </div>
                      {invoice.status === "pending" ? (
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="bg-transparent" asChild>
                          <Link href={`/customer/invoices/${invoice.id}`}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        download
                        className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </a>
                    )}
                    {invoice.type === "authority_fee" && (
                      <Badge className="bg-purple-500/10 text-purple-700" variant="secondary">
                        Unlocks installation after officer confirmation
                      </Badge>
                    )}
                    {invoice.nextAction && <Badge variant="outline">{invoice.nextAction}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Monthly Energy Bills</CardTitle>
                <CardDescription>Net metering statements generated from meter readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerBills.map((bill) => (
                    <div key={bill.id} className="p-4 rounded-lg border border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                          <p className="font-semibold text-foreground">
                            {bill.month} {bill.year}
                          </p>
                          {getStatusBadge(bill.status)}
                          <Badge className="bg-blue-500/10 text-blue-600" variant="secondary">
                            {bill.meterReadingId}
                          </Badge>
                        </div>
                        <p className={`text-lg font-bold ${bill.amount < 0 ? "text-emerald-500" : "text-foreground"}`}>
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
                      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Generated from meter reading {bill.meterReadingId}
                        </div>
                        <div className="flex gap-2">
                          {bill.invoiceId && (
                            <Button variant="outline" size="sm" className="bg-transparent" asChild>
                              <Link href={`/customer/invoices/${bill.invoiceId}`}>
                                <FileText className="w-4 h-4 mr-2" />
                                View invoice
                              </Link>
                            </Button>
                          )}
                          {bill.pdfUrl && (
                            <Button variant="outline" size="sm" className="bg-transparent" asChild>
                              <a href={bill.pdfUrl} download>
                                <Download className="w-4 h-4 mr-2" />
                                Download Statement
                              </a>
                            </Button>
                          )}
                        </div>
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
