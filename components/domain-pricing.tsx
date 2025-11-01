"use client"

import * as React from "react"
import { getTianhuPricing, type TianhuPricing } from "@/lib/tianhu-api"
import { useLanguage } from "@/contexts/language-context"

interface DomainPricingProps {
  domain: string
  isRegistered?: boolean
}

export default function DomainPricing({ domain, isRegistered }: DomainPricingProps) {
  const [pricing, setPricing] = React.useState<TianhuPricing | null>(null)
  const [loading, setLoading] = React.useState(false)

  const { t } = useLanguage()

  React.useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true)
      const data = await getTianhuPricing(domain)
      setPricing(data)
      setLoading(false)
    }

    const timer = setTimeout(fetchPricing, 300)
    return () => clearTimeout(timer)
  }, [domain])

  if (loading) {
    return (
      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground pb-2">
        <span>{t("querying")}</span>
      </div>
    )
  }

  if (!pricing) {
    return null
  }

  const isPremium = pricing.premium === true

  const statusLabel = isRegistered === undefined ? t("checking") : isRegistered ? t("registered") : t("notRegistered")
  const statusColor =
    isRegistered === undefined ? "text-muted-foreground" : isRegistered ? "text-muted-foreground" : "text-green-600"

  return (
    <div className="mt-1 flex flex-wrap items-center gap-4 sm:gap-8 text-sm pb-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t("premium")}:</span>
        <span className={isPremium ? "text-red-600 font-semibold" : "font-semibold"}>
          {isPremium ? t("yes") : t("no")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t("registration")}:</span>
        <span className="font-semibold">¥{pricing.register.toFixed(0)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t("renewal")}:</span>
        <span className="font-semibold">¥{pricing.renew.toFixed(0)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t("status")}:</span>
        <span className={`${statusColor} font-medium`}>{statusLabel}</span>
      </div>
    </div>
  )
}
