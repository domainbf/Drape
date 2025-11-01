"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp } from "lucide-react"

export type DomainPriceInfo = {
  domain: string
  registrationPrice: number | null
  renewalPrice: number | null
  transferPrice: number | null
  isPremium: boolean
  currency: string
  source: string
}

export default function DomainPrice({ domain }: { domain: string }) {
  const [priceInfo, setPriceInfo] = useState<DomainPriceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!domain) return

    const fetchPrice = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/domain-price?domain=${encodeURIComponent(domain)}`)
        if (!response.ok) {
          throw new Error("Failed to fetch pricing")
        }
        const data = await response.json()
        setPriceInfo(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch pricing")
        setPriceInfo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [domain])

  if (loading) {
    return (
      <div className="animate-pulse rounded-md border border-border bg-muted p-3">
        <div className="h-3 w-24 rounded bg-muted-foreground/20"></div>
      </div>
    )
  }

  if (error || !priceInfo) {
    return null
  }

  return (
    <div className="space-y-2">
      {priceInfo.isPremium && (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            Premium
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-sm">
        {/* Registration Price */}
        {priceInfo.registrationPrice !== null && (
          <div className="rounded-md border border-border bg-background p-2">
            <div className="text-xs text-muted-foreground">Registration</div>
            <div className="mt-0.5 font-semibold">¥{priceInfo.registrationPrice.toFixed(2)}</div>
          </div>
        )}

        {/* Renewal Price */}
        {priceInfo.renewalPrice !== null && (
          <div className="rounded-md border border-border bg-background p-2">
            <div className="text-xs text-muted-foreground">Renewal</div>
            <div className="mt-0.5 font-semibold">¥{priceInfo.renewalPrice.toFixed(2)}</div>
          </div>
        )}

        {/* Transfer Price */}
        {priceInfo.transferPrice !== null && (
          <div className="rounded-md border border-border bg-background p-2">
            <div className="text-xs text-muted-foreground">Transfer</div>
            <div className="mt-0.5 font-semibold">¥{priceInfo.transferPrice.toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Data Source */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3" />
        <span>Pricing from {priceInfo.source}</span>
      </div>
    </div>
  )
}
