"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export type LookupItem = {
  domain: string
  punycode: string
  timestamp: number
}

export default function RecentLookups({
  items,
  onSelect,
  onClear,
}: {
  items: LookupItem[]
  onSelect: (item: LookupItem) => void
  onClear: () => void
}) {
  const { t } = useLanguage()

  if (!items?.length) return null

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("recentLookups")}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onClear} aria-label="Clear recent lookups">
          {t("clear")}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 5).map((item) => (
          <Button
            key={`${item.punycode}-${item.timestamp}`}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onSelect(item)}
            aria-label={`Lookup ${item.domain}`}
            className="font-mono"
            title={new Date(item.timestamp).toLocaleString()}
          >
            {item.domain}
          </Button>
        ))}
      </div>
    </div>
  )
}
