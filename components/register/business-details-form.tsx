"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Building2 } from "lucide-react"

interface BusinessDetailsFormProps {
  onComplete: (data: BusinessData) => void
  onBack: () => void
}

interface BusinessData {
  companyName: string
  gstNumber: string
  businessAddress: string
  businessCity: string
  businessState: string
  businessPincode: string
}

export function BusinessDetailsForm({
  onComplete,
  onBack,
}: BusinessDetailsFormProps) {
  const [formData, setFormData] = useState<BusinessData>({
    companyName: "",
    gstNumber: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessPincode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }

    if (formData.gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = "Please enter a valid GST number"
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = "Business address is required"
    }

    if (!formData.businessCity.trim()) {
      newErrors.businessCity = "City is required"
    }

    if (!formData.businessState.trim()) {
      newErrors.businessState = "State is required"
    }

    if (!formData.businessPincode.trim()) {
      newErrors.businessPincode = "Pincode is required"
    } else if (!/^[1-9][0-9]{5}$/.test(formData.businessPincode)) {
      newErrors.businessPincode = "Please enter a valid 6-digit pincode"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsLoading(false)
    onComplete(formData)
  }

  const handleChange = (field: keyof BusinessData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="max-h-[90vh] overflow-y-auto">
      <CardHeader className="text-center relative sticky top-0 bg-card z-10">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Business Details</CardTitle>
        <CardDescription>
          Enter your company information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              aria-invalid={!!errors.companyName}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstNumber">GST Number (Optional)</Label>
            <Input
              id="gstNumber"
              type="text"
              placeholder="22AAAAA0000A1Z5"
              value={formData.gstNumber}
              onChange={(e) => handleChange("gstNumber", e.target.value.toUpperCase())}
              aria-invalid={!!errors.gstNumber}
            />
            {errors.gstNumber && (
              <p className="text-sm text-destructive">{errors.gstNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input
              id="businessAddress"
              type="text"
              placeholder="Enter your business address"
              value={formData.businessAddress}
              onChange={(e) => handleChange("businessAddress", e.target.value)}
              aria-invalid={!!errors.businessAddress}
            />
            {errors.businessAddress && (
              <p className="text-sm text-destructive">{errors.businessAddress}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessCity">City</Label>
              <Input
                id="businessCity"
                type="text"
                placeholder="City"
                value={formData.businessCity}
                onChange={(e) => handleChange("businessCity", e.target.value)}
                aria-invalid={!!errors.businessCity}
              />
              {errors.businessCity && (
                <p className="text-sm text-destructive">{errors.businessCity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessState">State</Label>
              <Input
                id="businessState"
                type="text"
                placeholder="State"
                value={formData.businessState}
                onChange={(e) => handleChange("businessState", e.target.value)}
                aria-invalid={!!errors.businessState}
              />
              {errors.businessState && (
                <p className="text-sm text-destructive">{errors.businessState}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPincode">Pincode</Label>
              <Input
                id="businessPincode"
                type="text"
                placeholder="000000"
                value={formData.businessPincode}
                onChange={(e) => handleChange("businessPincode", e.target.value)}
                aria-invalid={!!errors.businessPincode}
                maxLength={6}
              />
              {errors.businessPincode && (
                <p className="text-sm text-destructive">{errors.businessPincode}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue to Personal Details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
