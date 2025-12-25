"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Building, Star, CheckCircle, Package, ArrowRight, MapPin, Phone } from "lucide-react"
import { fetchInstallers, type Installer } from "@/lib/auth"

export default function CustomerInstallers() {
  const [installers, setInstallers] = useState<Installer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadInstallers() {
      try {
        const response = await fetchInstallers(true)
        setInstallers(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load installers")
      } finally {
        setLoading(false)
      }
    }
    loadInstallers()
  }, [])

  const filteredInstallers = installers.filter(
    (installer) =>
      installer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      installer.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Find Installer</h1>
          <p className="text-muted-foreground">Browse verified solar installation companies and their packages</p>
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Installers List */}
        <div className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">Loading installers...</CardContent>
            </Card>
          ) : filteredInstallers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No installers found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredInstallers.map((installer) => (
              <Card key={installer.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Building className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-foreground">{installer.companyName}</CardTitle>
                          <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">{installer.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {installer.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {installer.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-foreground">{installer.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {installer.completedInstallations} installations
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-500" />
                      Available Packages ({installer.packages.length})
                    </h4>
                    <Link href={`/customer/installers/${installer.id}/packages`}>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        View All Packages
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {installer.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-lg border border-border hover:border-emerald-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-foreground">{pkg.name}</h5>
                          <Badge variant="secondary">{pkg.capacity}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground mb-4">
                          <p>
                            {pkg.panelCount} panels ({pkg.panelType})
                          </p>
                          <p>Inverter: {pkg.inverterBrand}</p>
                          <p>Warranty: {pkg.warranty}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-emerald-500">Rs. {pkg.price.toLocaleString()}</p>
                          <Link href={`/customer/installers/${installer.id}/packages/${pkg.id}`}>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                              Select
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
