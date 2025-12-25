"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import {
  ArrowLeft,
  Download,
  CreditCard,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react"

import type {
  Invoice,
  MonthlyBill,
  PaymentTransaction,
} from "@/lib/prisma-types"

function getStatusBadge(status: string) {
  if (status === "paid") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
        <CheckCircle className="w-3 h-3 mr-1" />
        Paid
      </Badge>
    )
  }

  if (status === "overdue") {
    return (
      <Badge className="bg-red-500/10 text-red-600" variant="secondary">
        <AlertCircle className="w-3 h-3 mr-1" />
        Overdue
      </Badge>
    )
  }

  return (
    <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </Badge>
  )
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [monthlyBill, setMonthlyBill] = useState<MonthlyBill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/invoices/${params.id}`, {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("Invoice not found")
        }

        const data = await res.json()
        setInvoice(data.invoice)
        setPayments(data.payments ?? [])
        setMonthlyBill(data.monthlyBill ?? null)
      } catch (err) {
        setError("Unable to load invoice details")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params.id])

  const paidTotal = useMemo(() => {
    return payments
      .filter((p) => p.status === "succeeded" || p.status === "verified")
      .reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const balanceDue = useMemo(() => {
    if (!invoice) return 0
    return invoice.amount - paidTotal
  }, [invoice, paidTotal])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-12 text-muted-foreground">
          Loading invoice…
        </div>
      </DashboardLayout>
    )
  }

  if (error || !invoice) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-12 space-y-4">
          <p className="text-destructive">{error ?? "Invoice not found"}</p>
          <Link href="/customer/invoices">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to invoices
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">
                {invoice.id}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              {invoice.type.replace("_", " ")}
            </p>
          </div>

          <div className="flex gap-2">
            {invoice.pdfUrl && (
              <Button variant="outline" asChild>
                <a href={invoice.pdfUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/customer/invoices">Back</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice summary</CardTitle>
            <CardDescription>Amounts, dates, and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  Rs. {invoice.amount.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Due date</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-lg font-semibold text-foreground">
                  Rs. {paidTotal.toLocaleString()}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">Balance due</p>
              <p className="text-xl font-bold text-amber-600">
                Rs. {balanceDue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded bg-muted"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {p.paymentMethod ?? "Online payment"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ref {p.reference ?? p.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">
                      Rs. {p.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {monthlyBill && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly bill details</CardTitle>
              <CardDescription>
                {monthlyBill.month}/{monthlyBill.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Generated</p>
                <p className="font-semibold">
                  {monthlyBill.kwhGenerated} kWh
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exported</p>
                <p className="font-semibold text-emerald-600">
                  {monthlyBill.kwhExported} kWh
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Imported</p>
                <p className="font-semibold text-amber-600">
                  {monthlyBill.kwhImported} kWh
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {invoice.status === "pending" && balanceDue > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Complete payment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Pay now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
