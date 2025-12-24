"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, CreditCard, Building2, Calendar } from "lucide-react"
import Link from "next/link"

const invoiceData = {
  id: "INV-001",
  type: "installation",
  status: "pending",
  createdAt: "2024-01-15",
  dueDate: "2024-01-30",
  installer: {
    name: "SunPower Lanka",
    address: "45 Solar Avenue, Colombo 03",
    phone: "+94 11 234 5678",
    email: "billing@sunpowerlanka.lk",
    regNumber: "REG-2024-001",
  },
  customer: {
    name: "John Smith",
    address: "123 Solar Lane, Colombo 07",
    phone: "+94 77 123 4567",
    accountNumber: "0712345678",
  },
  application: {
    id: "APP-001",
    capacity: "5 kW",
  },
  items: [
    { description: "Solar Panels - Jinko Tiger Neo N-type (10 units)", quantity: 10, unitPrice: 65000, total: 650000 },
    { description: "Inverter - Huawei SUN2000-5KTL", quantity: 1, unitPrice: 180000, total: 180000 },
    { description: "Mounting Structure & Hardware", quantity: 1, unitPrice: 120000, total: 120000 },
    { description: "Wiring & Electrical Components", quantity: 1, unitPrice: 85000, total: 85000 },
    { description: "Installation Labor", quantity: 1, unitPrice: 150000, total: 150000 },
    { description: "CEB Grid Connection Fee", quantity: 1, unitPrice: 15000, total: 15000 },
  ],
  subtotal: 1200000,
  tax: 50000,
  total: 1250000,
  payments: [{ date: "2024-01-16", amount: 500000, method: "Bank Transfer", reference: "TRF-20240116-001" }],
  balanceDue: 750000,
}

export default function InvoiceDetailPage() {
  const params = useParams()

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
                <h1 className="text-2xl font-bold text-foreground">{params.id}</h1>
                <Badge
                  className={
                    invoiceData.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : invoiceData.status === "pending"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-red-500/10 text-red-600"
                  }
                  variant="secondary"
                >
                  {invoiceData.status === "paid" ? "Paid" : invoiceData.status === "pending" ? "Pending" : "Overdue"}
                </Badge>
              </div>
              <p className="text-muted-foreground">Installation Invoice</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            {invoiceData.balanceDue > 0 && (
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
                  <p className="font-semibold text-foreground">{invoiceData.installer.name}</p>
                  <p className="text-sm text-muted-foreground">{invoiceData.installer.address}</p>
                  <p className="text-sm text-muted-foreground">{invoiceData.installer.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">Reg: {invoiceData.installer.regNumber}</p>
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
                <p className="font-semibold text-foreground">{invoiceData.customer.name}</p>
                <p className="text-sm text-muted-foreground">{invoiceData.customer.address}</p>
                <p className="text-sm text-muted-foreground">{invoiceData.customer.phone}</p>
                <p className="text-xs text-muted-foreground mt-1">Account: {invoiceData.customer.accountNumber}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Invoice Details</CardTitle>
                <CardDescription>Application {invoiceData.application.id}</CardDescription>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Issued: {invoiceData.createdAt}
                </p>
                <p className="text-muted-foreground">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Due: {invoiceData.dueDate}
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
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 text-foreground">{item.description}</td>
                      <td className="py-3 text-center text-foreground">{item.quantity}</td>
                      <td className="py-3 text-right text-foreground">LKR {item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 text-right font-medium text-foreground">LKR {item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-b border-border">
                    <td colSpan={3} className="py-3 text-right text-muted-foreground">
                      Subtotal
                    </td>
                    <td className="py-3 text-right font-medium text-foreground">
                      LKR {invoiceData.subtotal.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td colSpan={3} className="py-3 text-right text-muted-foreground">
                      Tax
                    </td>
                    <td className="py-3 text-right font-medium text-foreground">
                      LKR {invoiceData.tax.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-semibold text-foreground">
                      Total
                    </td>
                    <td className="py-3 text-right text-xl font-bold text-emerald-500">
                      LKR {invoiceData.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {invoiceData.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoiceData.payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{payment.method}</p>
                      <p className="text-sm text-muted-foreground">Ref: {payment.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">LKR {payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-amber-500/10 rounded-lg flex items-center justify-between">
                <p className="font-medium text-foreground">Balance Due</p>
                <p className="text-xl font-bold text-amber-600">LKR {invoiceData.balanceDue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
