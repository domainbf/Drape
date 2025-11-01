"use client"

import * as React from "react"
import type { NormalizedRdap } from "@/lib/rdap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import StatusBadge from "@/components/status-badge"
import CopyButton from "@/components/copy-button"
import { downloadText } from "@/lib/download"
import { Badge } from "@/components/ui/badge"
import { translateStatuses } from "@/lib/status-mapping"
import { formatDateShort } from "@/lib/date-parser"
import { Info, Shield, Server, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ResultCard({ data }: { data: NormalizedRdap }) {
  const [tab, setTab] = React.useState<"overview" | "raw">("overview")
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  const { t } = useLanguage()

  const handleTabChange = (newTab: "overview" | "raw") => {
    if (newTab === tab) return
    setIsTransitioning(true)
    setTimeout(() => {
      setTab(newTab)
      setIsTransitioning(false)
    }, 150)
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap min-w-0 flex-1">
            <CardTitle className="text-balance text-lg break-all line-clamp-2">{data.domain}</CardTitle>
            {data.source && (
              <Badge variant="default" className="text-xs bg-primary text-primary-foreground flex-shrink-0">
                {data.source === "rdap" ? "RDAP" : "WHOIS"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              type="button"
              variant={tab === "overview" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTabChange("overview")}
              aria-pressed={tab === "overview"}
              className="h-8 px-3 text-xs transition-all hover:scale-105"
            >
              {t("overview")}
            </Button>
            <Button
              type="button"
              variant={tab === "raw" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTabChange("raw")}
              aria-pressed={tab === "raw"}
              className="h-8 px-3 text-xs transition-all hover:scale-105"
            >
              {t("rawData")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div
          className={
            isTransitioning
              ? "opacity-0 transition-opacity duration-150"
              : "opacity-100 transition-opacity duration-300"
          }
        >
          {tab === "overview" ? <Overview data={data} /> : <RawView data={data} />}
        </div>
      </CardContent>
    </Card>
  )
}

function Overview({ data }: { data: NormalizedRdap }) {
  const translatedStatuses = React.useMemo(() => translateStatuses(data.statuses || []), [data.statuses])

  const hasContacts = !!(data.contacts.registrant || data.contacts.admin || data.contacts.tech)

  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="domain-info">
        <h3 id="domain-info" className="mb-2 text-sm font-semibold flex items-center gap-2">
          <Info className="h-4 w-4" />
          {t("domainInfo")}
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <InfoRow label={t("registrar")} value={data.registrar || "—"} />
          <InfoRow label={t("dnssec")} value={data.dnssec ? t("enabled") : t("notEnabled")} />
          <InfoRow label={t("created")} value={formatDateShort(data.events.createdAt)} />
          <InfoRow label={t("updated")} value={formatDateShort(data.events.updatedAt)} />
          <InfoRow label={t("expires")} value={formatDateShort(data.events.expiresAt)} />
        </div>
      </section>

      <section aria-labelledby="domain-status">
        <h3 id="domain-status" className="mb-2 text-sm font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {t("domainStatus")}
        </h3>
        {translatedStatuses?.length ? (
          <div className="flex flex-wrap gap-2">
            {translatedStatuses.map((s, i) => (
              <StatusBadge status={s} key={`${s}-${i}`} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">{t("noStatus")}</div>
        )}
      </section>

      <section aria-labelledby="nameservers">
        <h3 id="nameservers" className="mb-2 text-sm font-semibold flex items-center gap-2">
          <Server className="h-4 w-4" />
          {t("nameservers")}
        </h3>
        {data.nameservers.length ? (
          <ul className="divide-y rounded-md border text-sm">
            {data.nameservers.map((ns, index) => (
              <li key={ns} className="flex items-center justify-between gap-2 p-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-muted-foreground font-medium text-xs flex-shrink-0">NS{index + 1}:</span>
                  <span className="font-mono text-xs md:text-sm truncate">{ns}</span>
                </div>
                <CopyButton value={ns} label={t("copy")} size="sm" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">{t("noNameservers")}</div>
        )}
      </section>

      {hasContacts && (
        <section aria-labelledby="contacts">
          <h3 id="contacts" className="mb-2 text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("contacts")}
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ContactCard title={t("registrant")} contact={data.contacts.registrant} />
            <ContactCard title={t("admin")} contact={data.contacts.admin} />
            <ContactCard title={t("tech")} contact={data.contacts.tech} />
          </div>
        </section>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-2">
      <span className="w-20 flex-shrink-0 text-muted-foreground text-xs font-medium">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  )
}

function ContactCard({
  title,
  contact,
}: {
  title: string
  contact?: { name?: string; organization?: string; email?: string; phone?: string }
}) {
  const { t } = useLanguage()

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {contact ? (
        <div className="space-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">{t("name")}:</span> {contact.name || "—"}
          </div>
          <div>
            <span className="text-muted-foreground">{t("org")}:</span> {contact.organization || "—"}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="truncate">
              <span className="text-muted-foreground">{t("email")}:</span> {contact.email || "—"}
            </span>
            {contact.email ? <CopyButton value={contact.email} label={t("copy")} size="sm" /> : null}
          </div>
          <div>
            <span className="text-muted-foreground">{t("phone")}:</span> {contact.phone || "—"}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">{t("noContacts")}</div>
      )}
    </div>
  )
}

function RawView({ data }: { data: NormalizedRdap }) {
  const { t } = useLanguage()
  const rawText = typeof data.raw === "string" ? data.raw : JSON.stringify(data.raw, null, 2)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <CopyButton value={rawText} label={t("copy")} />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => downloadText(`${data.domain.replace(/\s+/g, "_")}_raw.txt`, rawText)}
        >
          {t("download")}
        </Button>
      </div>
      <div className="rounded-md border bg-muted/30">
        <pre className="max-h-96 overflow-auto p-4 text-xs leading-relaxed whitespace-pre-wrap break-words">
          <code>{rawText}</code>
        </pre>
      </div>
    </div>
  )
}
