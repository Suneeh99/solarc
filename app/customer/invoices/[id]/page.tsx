"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, CreditCard, Building2, Calendar } from "lucide-react"
import Link from "next/link"
import { Invoice, MonthlyBill, PaymentTransaction } from "@/lib/prisma-types"

export default function InvoiceDetailPage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [monthlyBill, setMonthlyBill] = useState<MonthlyBill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.id}`)
        if (!response.ok) throw new Error("Invoice not found")
        const data = await response.json()
        setInvoice(data.invoice)
        setPayments(data.payments ?? [])
        setMonthlyBill(data.monthlyBill ?? null)
      } catch (err) {
        console.error(err)
        setError("Unable to load invoice details")
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [params.id])

  const paymentTotal = useMemo(
    () => payments.filter((p) => p.status === "succeeded" || p.status === "verified").reduce((sum, p) => sum + p.amount, 0),
    [payments],
  )

  const balanceDue = useMemo(() => {
    if (!invoice) return 0
    return invoice.amount - paymentTotal
  }, [invoice, paymentTotal])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/customer/invoices">
                <Button variant="ghost" size="icon" className="bg-transparent">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
                <p className="text-muted-foreground">Fetching invoice details</p>
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="p-6 text-muted-foreground">Loading invoice data...</CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/customer/invoices">
              <Button variant="ghost" size="icon" className="bg-transparent">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Invoice not found</h1>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-500/10 p-3 rounded">{error}</p>}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/customer/invoices">
              <Button variant="ghost" size="icon" className="bg-transparent">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{invoice.id}</h1>
                <Badge
                  className={
                    invoice.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : invoice.status === "pending"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-red-500/10 text-red-600"
                  }
                  variant="secondary"
                >
                  {invoice.status === "paid" ? "Paid" : invoice.status === "pending" ? "Pending" : "Overdue"}
                </Badge>
              </div>
              <p className="text-muted-foreground">{invoice.type === "monthly_bill" ? "Monthly Bill" : "Payment Invoice"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            {balanceDue > 0 && (
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">From</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Solar Utility</p>
                  <p className="text-sm text-muted-foreground">123 Solar Avenue, Colombo</p>
                  <p className="text-sm text-muted-foreground">+94 11 234 5678</p>
                  <p className="text-xs text-muted-foreground mt-1">Invoice Type: {invoice.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-semibold text-foreground">{invoice.customerId}</p>
                <p className="text-sm text-muted-foreground">Application: {invoice.applicationId ?? "N/A"}</p>
                <p className="text-xs text-muted-foreground mt-1">Invoice ID: {invoice.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Invoice Details</CardTitle>
                <CardDescription>Application {invoice.applicationId ?? "N/A"}</CardDescription>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Issued: {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-center py-3 text-sm font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Unit Price</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.lineItems ?? [{ description: invoice.description, quantity: 1, unitPrice: invoice.amount, total: invoice.amount }]).map(
                    (item, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-3 text-foreground">{item.description}</td>
                        <td className="py-3 text-center text-foreground">{item.quantity}</td>
                        <td className="py-3 text-right text-foreground">LKR {item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 text-right font-medium text-foreground">LKR {item.total.toLocaleString()}</td>
                      </tr>
                    ),
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-semibold text-foreground">
                      Total
                    </td>
                    <td className="py-3 text-right text-xl font-bold text-emerald-500">
                      LKR {invoice.amount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{payment.paymentMethod ?? "Online"}</p>
                      <p className="text-sm text-muted-foreground">Ref: {payment.reference ?? payment.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">LKR {payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-amber-500/10 rounded-lg flex items-center justify-between">
                <p className="font-medium text-foreground">Balance Due</p>
                <p className="text-xl font-bold text-amber-600">LKR {balanceDue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {monthlyBill && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Monthly Bill Details</CardTitle>
              <CardDescription>
                {new Date(2000, monthlyBill.month - 1, 1).toLocaleString("default", { month: "long" })} {monthlyBill.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-sm">kWh Generated</p>
                <p className="text-xl font-semibold text-foreground">{monthlyBill.kwhGenerated}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-sm">kWh Exported</p>
                <p className="text-xl font-semibold text-emerald-500">{monthlyBill.kwhExported}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-sm">kWh Imported</p>
                <p className="text-xl font-semibold text-amber-500">{monthlyBill.kwhImported}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-sm">Net Amount</p>
                <p className={`text-xl font-semibold ${monthlyBill.netAmount < 0 ? "text-emerald-500" : "text-foreground"}`}>
                  Rs. {Math.abs(monthlyBill.netAmount).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
