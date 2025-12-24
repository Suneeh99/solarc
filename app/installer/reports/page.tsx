"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, TrendingUp, Package, Star, Users } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const monthlyData = [
  { month: "Jan", revenue: 850000, installations: 3, bidsWon: 4 },
  { month: "Feb", revenue: 720000, installations: 2, bidsWon: 3 },
  { month: "Mar", revenue: 1200000, installations: 4, bidsWon: 5 },
  { month: "Apr", revenue: 980000, installations: 3, bidsWon: 4 },
  { month: "May", revenue: 1450000, installations: 5, bidsWon: 6 },
  { month: "Jun", revenue: 1100000, installations: 4, bidsWon: 5 },
]

const packagePerformance = [
  { name: "Basic", sales: 25, revenue: 11250000 },
  { name: "Premium", sales: 18, revenue: 13500000 },
  { name: "Commercial", sales: 8, revenue: 11200000 },
]

const stats = {
  totalRevenue: 12500000,
  totalInstallations: 45,
  avgRating: 4.8,
  bidSuccessRate: 72,
  repeatCustomers: 15,
}

export default function InstallerReports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Track your business performance and growth</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold text-foreground">Rs. {(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Installations</p>
                  <p className="text-lg font-bold text-foreground">{stats.totalInstallations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                  <p className="text-lg font-bold text-foreground">{stats.avgRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bid Success</p>
                  <p className="text-lg font-bold text-foreground">{stats.bidSuccessRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Repeat Customers</p>
                  <p className="text-lg font-bold text-foreground">{stats.repeatCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" tickFormatter={(value) => `${value / 1000000}M`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Installations Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Installations & Bids
              </CardTitle>
              <CardDescription>Monthly installations and bid wins</CardDescription>
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
                    <Bar
                      dataKey="installations"
                      fill="hsl(var(--chart-1))"
                      name="Installations"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="bidsWon" fill="hsl(var(--chart-2))" name="Bids Won" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Package Performance</CardTitle>
            <CardDescription>Sales breakdown by package type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {packagePerformance.map((pkg) => (
                <div key={pkg.name} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-semibold text-foreground">{pkg.name} Package</p>
                    <p className="text-sm text-muted-foreground">{pkg.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">Rs. {(pkg.revenue / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: Rs. {Math.round(pkg.revenue / pkg.sales).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
