"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, Sun, Leaf, TrendingUp, Zap } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"

const monthlyData = [
  { month: "Jan", generated: 420, exported: 280, imported: 120, saved: 8400 },
  { month: "Feb", generated: 380, exported: 240, imported: 150, saved: 7600 },
  { month: "Mar", generated: 450, exported: 300, imported: 100, saved: 9000 },
  { month: "Apr", generated: 520, exported: 360, imported: 80, saved: 10400 },
  { month: "May", generated: 580, exported: 400, imported: 60, saved: 11600 },
  { month: "Jun", generated: 550, exported: 380, imported: 70, saved: 11000 },
]

const stats = {
  totalGenerated: 2900,
  totalExported: 1960,
  totalImported: 580,
  totalSavings: 58000,
  co2Prevented: 2.5,
  treesEquivalent: 42,
}

export default function CustomerReports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Track your solar system performance and environmental impact</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="6months">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Generated</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalGenerated} kWh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Exported</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.totalExported - stats.totalImported} kWh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <p className="text-2xl font-bold text-foreground">Rs. {stats.totalSavings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CO₂ Prevented</p>
                  <p className="text-2xl font-bold text-foreground">{stats.co2Prevented} tons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Generation Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Energy Production
              </CardTitle>
              <CardDescription>Monthly energy generation and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="generated" fill="hsl(var(--chart-2))" name="Generated (kWh)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="exported" fill="hsl(var(--chart-1))" name="Exported (kWh)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="imported" fill="hsl(var(--chart-4))" name="Imported (kWh)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Savings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Monthly Savings
              </CardTitle>
              <CardDescription>Your electricity bill savings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Savings"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="saved"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environmental Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Environmental Impact
            </CardTitle>
            <CardDescription>Your contribution to a greener planet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-500 mb-1">{stats.co2Prevented} tons</p>
                <p className="text-sm text-muted-foreground">CO₂ Emissions Prevented</p>
                <p className="text-xs text-muted-foreground mt-2">Calculated using 0.85 kg CO₂/kWh</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌳</span>
                </div>
                <p className="text-3xl font-bold text-emerald-500 mb-1">{stats.treesEquivalent}</p>
                <p className="text-sm text-muted-foreground">Trees Equivalent</p>
                <p className="text-xs text-muted-foreground mt-2">Each tree absorbs ~21 kg CO₂/year</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <p className="text-3xl font-bold text-blue-500 mb-1">{stats.totalGenerated}</p>
                <p className="text-sm text-muted-foreground">Clean kWh Generated</p>
                <p className="text-xs text-muted-foreground mt-2">Powering homes with renewable energy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
