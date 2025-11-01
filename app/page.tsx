"use client"

import DomainForm from "@/components/domain-form"
import ResultCard from "@/components/result-card"
import DomainPricing from "@/components/domain-pricing"
import { useEffect, useMemo, useState, useCallback } from "react"
import { useRdap } from "@/hooks/use-rdap"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSearchParams, useRouter } from "next/navigation"
import { normalizeDomainInput, punycodeEncode } from "@/lib/domain-utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import RecentLookups, { type LookupItem } from "@/components/recent-lookups"
import { ResultSkeleton } from "@/components/skeleton"
import { AlertCircle } from "lucide-react"
import { HeaderControls } from "@/components/header-controls"
import { useLanguage } from "@/contexts/language-context"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qParam = searchParams.get("q") || ""

  const [submitted, setSubmitted] = useState<{ original: string; normalized: string; punycode: string } | null>(null)
  const [history, setHistory] = useLocalStorage<LookupItem[]>("recent-lookups", [])
  const [showContent, setShowContent] = useState(false)

  const rdap = useRdap(submitted?.punycode ?? null)

  // Auto-load from ?q= on first render
  useEffect(() => {
    if (!qParam) return
    ;(async () => {
      const original = qParam
      const normalized = normalizeDomainInput(original)
      const punycode = await punycodeEncode(normalized).catch(() => normalized)
      setSubmitted({ original, normalized, punycode })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // On successful fetch, add to recent lookups (dedupe, keep last 5)
  useEffect(() => {
    if (!rdap.data || !submitted) return
    setHistory((prev) => {
      const next = [
        { domain: submitted.normalized, punycode: submitted.punycode, timestamp: Date.now() },
        ...prev.filter((i) => i.punycode !== submitted.punycode),
      ].slice(0, 5)
      return next
    })
  }, [rdap.data, setHistory, submitted])

  useEffect(() => {
    if (!rdap.isLoading && (rdap.data || rdap.error)) {
      const timer = setTimeout(() => setShowContent(true), 50)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [rdap.isLoading, rdap.data, rdap.error])

  const initialFormValue = useMemo(() => qParam || "", [qParam])

  const handleLookupSubmit = useCallback(
    async (payload: { original: string; normalized: string; punycode: string }) => {
      setShowContent(false)
      setSubmitted(payload)
      router.push(`/?q=${encodeURIComponent(payload.normalized)}`)
    },
    [router],
  )

  const handleSelectRecent = useCallback(
    async (item: LookupItem) => {
      setShowContent(false)
      setSubmitted({ original: item.domain, normalized: item.domain, punycode: item.punycode })
      router.push(`/?q=${encodeURIComponent(item.domain)}`)
    },
    [router],
  )

  const handleClearHistory = useCallback(() => setHistory([]), [setHistory])

  const errorContent = useMemo(() => {
    if (!rdap.error) return null
    const message = rdap.error.message || "查询失败"
    const parts = message.split("\n")
    return {
      title: parts[0],
      suggestion: parts[1] || null,
    }
  }, [rdap.error])

  const isRegistered = useMemo(() => {
    if (rdap.isLoading) return undefined

    // If we have data with registrar or creation date, it's registered
    if (rdap.data) {
      const hasRegistrar = rdap.data.registrar && rdap.data.registrar.trim().length > 0
      const hasCreated = rdap.data.created && rdap.data.created.trim().length > 0
      const hasExpires = rdap.data.expires && rdap.data.expires.trim().length > 0

      // If any of these exist, domain is registered
      if (hasRegistrar || hasCreated || hasExpires) {
        return true
      }
    }

    // If we have an error, check if it's a "not found" error
    if (rdap.error) {
      const errorMsg = rdap.error.message?.toLowerCase() || ""

      // These indicate domain is not registered
      if (
        errorMsg.includes("not found") ||
        errorMsg.includes("未注册") ||
        errorMsg.includes("no match") ||
        errorMsg.includes("not registered")
      ) {
        return false
      }

      // Other errors (timeout, unsupported TLD, etc.) - status unknown
      return undefined
    }

    return undefined
  }, [rdap.data, rdap.error, rdap.isLoading])

  const { t } = useLanguage()

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <header>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        </header>
        <HeaderControls />
      </div>

      <section aria-labelledby="lookup-form">
        <h2 id="lookup-form" className="sr-only">
          {t("domainLabel")}
        </h2>
        <DomainForm onSubmit={handleLookupSubmit} initialValue={initialFormValue} />
      </section>

      {submitted && <DomainPricing domain={submitted.punycode} isRegistered={isRegistered} />}

      <section className="mt-8" aria-live="polite" aria-atomic="true">
        {rdap.isLoading && (
          <div className="animate-fade-in">
            <ResultSkeleton />
          </div>
        )}

        {rdap.error && !rdap.isLoading && errorContent && (
          <Alert variant="destructive" className={`mt-2 ${showContent ? "animate-fade-in" : "opacity-0"}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{errorContent.title}</AlertTitle>
            {errorContent.suggestion && (
              <AlertDescription className="mt-2 text-sm">{errorContent.suggestion}</AlertDescription>
            )}
          </Alert>
        )}

        {rdap.data && !rdap.isLoading && (
          <div className={`mt-3 ${showContent ? "animate-fade-in" : "opacity-0"}`}>
            <ResultCard data={rdap.data} />
          </div>
        )}
      </section>

      {submitted && history.length > 0 && (
        <section className="mt-8">
          <RecentLookups items={history} onSelect={handleSelectRecent} onClear={handleClearHistory} />
        </section>
      )}
    </main>
  )
}
