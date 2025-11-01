import { isWhoisSupported } from "@/lib/whois-servers"
import useSWR from "swr"
import type { NormalizedRdap } from "@/lib/rdap"
import { rdapLookup, normalizeWhoisResult, mergeRdapAndWhois } from "@/lib/rdap"
import { whoisLookup } from "@/lib/whois"
import { classifyDomainLookupError } from "@/lib/error-classifier"

type UseRdapResult = {
  data?: NormalizedRdap
  error?: Error
  isLoading: boolean
  mutate: () => void
  source?: "rdap" | "whois" | "merged"
  loadingStage?: "rdap" | "whois" | "complete"
}

function createUserFriendlyError(
  domain: string,
  rdapError: Error | null,
  whoisError: Error | null,
  hasWhoisSupport: boolean,
): string {
  const classification = classifyDomainLookupError(domain, rdapError, whoisError, hasWhoisSupport)

  let errorMessage = classification.message

  if (classification.suggestion) {
    errorMessage += `\n${classification.suggestion}`
  }

  return errorMessage
}

export function useRdap(domainAscii?: string | null): UseRdapResult {
  const key = domainAscii ? `rdap-lookup-${domainAscii}` : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      if (!domainAscii) return undefined

      const hasWhoisSupport = isWhoisSupported(domainAscii)

      let rdapData: NormalizedRdap | null = null
      let whoisData: NormalizedRdap | null = null
      let rdapError: Error | null = null
      let whoisError: Error | null = null

      try {
        console.log(`[v0] Attempting RDAP lookup for ${domainAscii}`)
        rdapData = await Promise.race([
          rdapLookup(domainAscii),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("RDAP timeout")), 8000)),
        ])
        console.log(`[v0] RDAP successful for ${domainAscii}`)
      } catch (err: any) {
        console.warn(`[v0] RDAP failed for ${domainAscii}:`, err?.message)
        rdapError = err
      }

      // This is especially important for Chinese and IDN domains that may not have full RDAP support
      if (!rdapData && hasWhoisSupport) {
        try {
          console.log(`[v0] RDAP failed, attempting WHOIS fallback for ${domainAscii}`)
          const whoisResult = await whoisLookup(domainAscii)
          whoisData = normalizeWhoisResult(whoisResult)
          console.log(`[v0] WHOIS successful for ${domainAscii}`)
        } catch (err: any) {
          console.warn(`[v0] WHOIS failed for ${domainAscii}:`, err?.message)
          whoisError = err
        }
      } else if (rdapData && hasWhoisSupport) {
        // Do this in parallel but don't block on failure
        try {
          const whoisResult = await Promise.race([
            whoisLookup(domainAscii),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("WHOIS timeout")), 5000)),
          ])
          whoisData = normalizeWhoisResult(whoisResult)
        } catch (err: any) {
          console.warn(`[v0] Supplementary WHOIS lookup failed for ${domainAscii}`)
        }
      }

      if (rdapData && whoisData) {
        return mergeRdapAndWhois(rdapData, whoisData)
      } else if (rdapData) {
        return rdapData
      } else if (whoisData) {
        return whoisData
      } else {
        const errorMessage = createUserFriendlyError(domainAscii, rdapError, whoisError, hasWhoisSupport)
        throw new Error(errorMessage)
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 60000,
      errorRetryCount: 0,
    },
  )

  return {
    data,
    error,
    isLoading,
    mutate,
    source: data?.source as "rdap" | "whois" | "merged" | undefined,
  }
}
