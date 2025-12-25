"use client"

import type React from "react"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Receipt, Clock, CheckCircle, AlertCircle, Download, FileText, Zap, Mail, CreditCard } from "lucide-react"
import { getDemoInvoices, getDemoMonthlyBills } from "@/lib/auth"

const invoices = getDemoInvoices()
const bills = getDemoMonthlyBills()

function getStatusBadge(status: string) {
  const styles: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    pending: { color: "bg-amber-500/10 text-amber-600", icon: Clock, label: "Pending" },
    paid: { color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle, label: "Paid" },
    overdue: { color: "bg-red-500/10 text-red-600", icon: AlertCircle, label: "Overdue" },
  }
  const { color, icon: Icon, label } = styles[status] || styles.pending
  return (
    <Badge className={color} variant="secondary">
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  )
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = invoices.find((inv) => inv.id === params.id)

  if (!invoice) {
    return (
      <DashboardLayout>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-foreground">Invoice not found</CardTitle>
            <CardDescription>The requested invoice does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/customer/invoices">Back to invoices</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const bill = bills.find((b) => b.invoiceId === invoice.id)
  const isCredit = bill ? bill.amount < 0 : invoice.amount < 0

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{invoice?.id}</h1>
              {invoice && getStatusBadge(invoice.status)}
              {invoice && (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                  {invoice.type.replace("_", " ")}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Invoice generated from payment and billing events</p>
          </div>
          <div className="flex gap-2">
            {invoice?.pdfUrl && (
              <Button variant="outline" asChild>
                <a href={invoice.pdfUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/customer/invoices">Back to invoices</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Invoice summary</CardTitle>
            <CardDescription>Details, delivery channel, and linked energy data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className={`text-2xl font-bold ${isCredit ? "text-emerald-600" : "text-foreground"}`}>
                  {isCredit ? "Credit " : "Rs. "}
                  {Math.abs(invoice?.amount || 0).toLocaleString()}
                </p>
                {bill && bill.amount < 0 && <p className="text-xs text-muted-foreground">Net metering credit</p>}
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Application</p>
                <p className="text-lg font-semibold text-foreground">{invoice?.applicationId}</p>
                {invoice?.meterReadingId && (
                  <p className="text-xs text-muted-foreground">From {invoice.meterReadingId}</p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Due date</p>
                <p className="text-lg font-semibold text-foreground">
                  {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "On delivery"}
                </p>
                {invoice?.paidAt && <p className="text-xs text-muted-foreground">Paid {new Date(invoice.paidAt).toLocaleDateString()}</p>}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Receipt className="w-4 h-4" />
                  <span>Type</span>
                </div>
                <p className="text-sm font-semibold text-foreground capitalize">{invoice?.type.replace("_", " ")}</p>
                <p className="text-sm text-muted-foreground">{invoice?.description}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Delivery</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{invoice?.channel || "Email & in-app"}</p>
                <p className="text-sm text-muted-foreground">
                  Email notifications are dispatched to keep installers and customers aligned. In-app notifications mirror
                  the delivery status in dashboards.
                </p>
              </div>
            </div>

            {invoice?.type === "authority_fee" && (
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-200 flex items-start gap-3">
                <ShieldIcon />
                <div>
                  <p className="text-sm font-semibold text-purple-800">Authority-fee receipt</p>
                  <p className="text-sm text-purple-900/80">
                    Officer approval of this receipt will unlock installation scheduling for the linked application.
                  </p>
                </div>
              </div>
            )}

            {bill && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Derived from meter reading {bill.meterReadingId}
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm mt-3">
                  <div>
                    <p className="text-muted-foreground">Generated</p>
                    <p className="font-semibold text-foreground">{bill.kwhGenerated} kWh</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Exported</p>
                    <p className="font-semibold text-emerald-600">{bill.kwhExported} kWh</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Imported</p>
                    <p className="font-semibold text-amber-600">{bill.kwhImported} kWh</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Actions</CardTitle>
            <CardDescription>Download, pay, or review linked documents</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {invoice?.status === "pending" && (
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Complete payment
              </Button>
            )}
            {invoice?.pdfUrl && (
              <Button variant="outline" asChild>
                <a href={invoice.pdfUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/customer/invoices">Return to list</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function ShieldIcon() {
  return (
    <div className="mt-1 w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
      <FileText className="w-5 h-5 text-purple-700" />
    </div>
  )
}
