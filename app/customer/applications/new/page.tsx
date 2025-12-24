"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, ArrowLeft, ArrowRight, CheckCircle, Info, FileText, Home, Zap } from "lucide-react"

const steps = [
  { id: 1, title: "Personal Info", icon: FileText },
  { id: 2, title: "Property Details", icon: Home },
  { id: 3, title: "Technical Info", icon: Zap },
  { id: 4, title: "Documents", icon: Upload },
  { id: 5, title: "Review", icon: CheckCircle },
]

export default function NewApplication() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    nic: "",
    email: "",
    phone: "",
    address: "",

    // Property Details
    propertyType: "",
    propertyOwnership: "",
    electricityAccountNumber: "",
    tariffCategory: "",

    // Technical Info
    roofType: "",
    roofArea: "",
    roofOrientation: "",
    shading: "",
    monthlyConsumption: "",
    connectionPhase: "",
    desiredCapacity: "",

    // Documents
    nicDocument: null as File | null,
    bankDetails: null as File | null,
    electricityBill: null as File | null,
    propertyDocument: null as File | null,
  })

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      router.push("/customer/applications?success=true")
    }, 1500)
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFormData({ ...formData, [field]: file })
  }

  const progress = (currentStep / 5) * 100

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Solar Installation Application</h1>
          <p className="text-muted-foreground">Complete all steps to submit your application for solar installation</p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        currentStep >= step.id ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`hidden sm:block w-16 lg:w-24 h-1 mx-2 ${
                          currentStep > step.id ? "bg-emerald-500" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              Step {currentStep} of 5: {steps[currentStep - 1].title}
            </p>
          </CardContent>
        </Card>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Provide your personal information for verification"}
              {currentStep === 2 && "Tell us about your property where the solar system will be installed"}
              {currentStep === 3 && "Technical details about your property and energy requirements"}
              {currentStep === 4 && "Upload required documents for verification"}
              {currentStep === 5 && "Review your application before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name (as per NIC)</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nic">NIC Number</Label>
                    <Input
                      id="nic"
                      placeholder="Enter your NIC number"
                      value={formData.nic}
                      onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Old format (9 digits + V/X) or new format (12 digits)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Residential Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Property Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This determines the type of solar system suitable for your property
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Property Ownership</Label>
                    <Select
                      value={formData.propertyOwnership}
                      onValueChange={(value) => setFormData({ ...formData, propertyOwnership: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ownership" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owned">Owned</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="leased">Leased</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Electricity Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter your CEB account number"
                      value={formData.electricityAccountNumber}
                      onChange={(e) => setFormData({ ...formData, electricityAccountNumber: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Found on your electricity bill</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tariff Category</Label>
                    <Select
                      value={formData.tariffCategory}
                      onValueChange={(value) => setFormData({ ...formData, tariffCategory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tariff category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic</SelectItem>
                        <SelectItem value="general_purpose">General Purpose</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-600">
                    <p className="font-medium">Why do we need this information?</p>
                    <p>
                      Your electricity account details help us verify your current consumption and determine the
                      appropriate solar system capacity for your needs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Technical Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Roof Type</Label>
                    <Select
                      value={formData.roofType}
                      onValueChange={(value) => setFormData({ ...formData, roofType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat_concrete">Flat Concrete</SelectItem>
                        <SelectItem value="sloped_tile">Sloped Tile</SelectItem>
                        <SelectItem value="metal_sheet">Metal Sheet</SelectItem>
                        <SelectItem value="asbestos">Asbestos</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">The type of roof affects the mounting system used</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roofArea">Available Roof Area (sqm)</Label>
                    <Input
                      id="roofArea"
                      type="number"
                      placeholder="Enter roof area"
                      value={formData.roofArea}
                      onChange={(e) => setFormData({ ...formData, roofArea: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Approximate area where panels can be installed</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Roof Orientation</Label>
                    <Select
                      value={formData.roofOrientation}
                      onValueChange={(value) => setFormData({ ...formData, roofOrientation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="south">South Facing</SelectItem>
                        <SelectItem value="east">East Facing</SelectItem>
                        <SelectItem value="west">West Facing</SelectItem>
                        <SelectItem value="north">North Facing</SelectItem>
                        <SelectItem value="flat">Flat Roof</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shading</Label>
                    <Select
                      value={formData.shading}
                      onValueChange={(value) => setFormData({ ...formData, shading: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shading level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Shading</SelectItem>
                        <SelectItem value="minimal">Minimal (0-25%)</SelectItem>
                        <SelectItem value="moderate">Moderate (25-50%)</SelectItem>
                        <SelectItem value="heavy">Heavy (50%+)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Trees, buildings, or other obstructions that cast shadows
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consumption">Monthly Consumption (kWh)</Label>
                    <Input
                      id="consumption"
                      type="number"
                      placeholder="e.g., 350"
                      value={formData.monthlyConsumption}
                      onChange={(e) => setFormData({ ...formData, monthlyConsumption: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Check your electricity bill</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Connection Phase</Label>
                    <Select
                      value={formData.connectionPhase}
                      onValueChange={(value) => setFormData({ ...formData, connectionPhase: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Phase</SelectItem>
                        <SelectItem value="three">Three Phase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Desired Capacity (kW)</Label>
                    <Select
                      value={formData.desiredCapacity}
                      onValueChange={(value) => setFormData({ ...formData, desiredCapacity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 kW</SelectItem>
                        <SelectItem value="3">3 kW</SelectItem>
                        <SelectItem value="5">5 kW</SelectItem>
                        <SelectItem value="10">10 kW</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-500/10 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-600">
                    <p className="font-medium">Document Requirements</p>
                    <p>
                      Please upload clear, legible copies of the following documents. Accepted formats: PDF, JPG, PNG
                      (max 5MB each).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NIC Document */}
                  <div className="space-y-2">
                    <Label>NIC Copy (Front & Back)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors">
                      {formData.nicDocument ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm text-foreground">{formData.nicDocument.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleFileChange("nicDocument", null)}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Upload a copy of your National Identity Card
                          </p>
                          <input
                            type="file"
                            className="hidden"
                            id="nic-upload"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange("nicDocument", e.target.files?.[0] || null)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => document.getElementById("nic-upload")?.click()}
                          >
                            Select File
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-2">
                    <Label>Bank Account Details</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors">
                      {formData.bankDetails ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm text-foreground">{formData.bankDetails.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleFileChange("bankDetails", null)}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">Upload bank passbook or statement copy</p>
                          <input
                            type="file"
                            className="hidden"
                            id="bank-upload"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange("bankDetails", e.target.files?.[0] || null)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => document.getElementById("bank-upload")?.click()}
                          >
                            Select File
                          </Button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Required for net metering payment deposits</p>
                  </div>

                  {/* Electricity Bill */}
                  <div className="space-y-2">
                    <Label>Recent Electricity Bill</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors">
                      {formData.electricityBill ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm text-foreground">{formData.electricityBill.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleFileChange("electricityBill", null)}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">Upload your latest electricity bill</p>
                          <input
                            type="file"
                            className="hidden"
                            id="bill-upload"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange("electricityBill", e.target.files?.[0] || null)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => document.getElementById("bill-upload")?.click()}
                          >
                            Select File
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Property Document */}
                  <div className="space-y-2">
                    <Label>Property Ownership Document</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors">
                      {formData.propertyDocument ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm text-foreground">{formData.propertyDocument.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleFileChange("propertyDocument", null)}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">Deed, title, or rental agreement</p>
                          <input
                            type="file"
                            className="hidden"
                            id="property-upload"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange("propertyDocument", e.target.files?.[0] || null)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => document.getElementById("property-upload")?.click()}
                          >
                            Select File
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Personal Information
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Full Name</span>
                        <span className="text-foreground">{formData.fullName || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NIC</span>
                        <span className="text-foreground">{formData.nic || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="text-foreground">{formData.email || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="text-foreground">{formData.phone || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Property Details
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type</span>
                        <span className="text-foreground capitalize">{formData.propertyType || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ownership</span>
                        <span className="text-foreground capitalize">
                          {formData.propertyOwnership || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Number</span>
                        <span className="text-foreground">{formData.electricityAccountNumber || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tariff</span>
                        <span className="text-foreground capitalize">{formData.tariffCategory || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Technical Information
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roof Type</span>
                        <span className="text-foreground capitalize">
                          {formData.roofType?.replace("_", " ") || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roof Area</span>
                        <span className="text-foreground">
                          {formData.roofArea ? `${formData.roofArea} sqm` : "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Usage</span>
                        <span className="text-foreground">
                          {formData.monthlyConsumption ? `${formData.monthlyConsumption} kWh` : "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desired Capacity</span>
                        <span className="text-foreground">
                          {formData.desiredCapacity ? `${formData.desiredCapacity} kW` : "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Documents
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">NIC Copy</span>
                        {formData.nicDocument ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <span className="text-amber-500 text-sm">Missing</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bank Details</span>
                        {formData.bankDetails ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <span className="text-amber-500 text-sm">Missing</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Electricity Bill</span>
                        {formData.electricityBill ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <span className="text-amber-500 text-sm">Missing</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Property Document</span>
                        {formData.propertyDocument ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <span className="text-amber-500 text-sm">Missing</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 rounded-lg">
                  <p className="text-sm text-emerald-600">
                    <strong>Note:</strong> By submitting this application, you confirm that all information provided is
                    accurate. A CEB officer will review your application and contact you for a site visit.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-border">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {currentStep < 5 ? (
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
