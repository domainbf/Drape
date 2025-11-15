import { isWhoisSupported } from "@/lib/whois-servers"
import useSWR from "swr"
import type { NormalizedRdap } from "@/lib/rdap"
import { rdapLookup, normalizeWhoisResult, mergeRdapAndWhois } from "@/lib/rdap"
import { whoisLookup } from "@/lib/whois"
import { classifyDomainLookupError } from "@/lib/error-classifier"
import { getCachedDomain, setCachedDomain } from "@/lib/domain-utils"

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

      const cached = getCachedDomain(domainAscii)
      if (cached) {
        console.log(`[v0] Cache hit for ${domainAscii}`)
        return cached
      }

      const hasWhoisSupport = isWhoisSupported(domainAscii)

      let rdapData: NormalizedRdap | null = null
      let whoisData: NormalizedRdap | null = null
      let rdapError: Error | null = null
      let whoisError: Error | null = null

      try {
        console.log(`[v0] Attempting RDAP lookup for ${domainAscii}`)
        
        rdapData = await Promise.race([
          rdapLookup(domainAscii),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("RDAP timeout after 8s")), 8000)
          ),
        ])
        console.log(`[v0] RDAP successful for ${domainAscii}`)
      } catch (err: any) {
        console.warn(`[v0] RDAP failed for ${domainAscii}:`, err?.message)
        rdapError = err
      }

      // Some domains may not be in our WHOIS_SERVERS config but still have working WHOIS servers
      if (!rdapData) {
        try {
          console.log(`[v0] RDAP failed, attempting WHOIS fallback for ${domainAscii}`)
          const whoisResult = await Promise.race([
            whoisLookup(domainAscii),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error("WHOIS timeout after 10s")), 10000)
            ),
          ])
          whoisData = normalizeWhoisResult(whoisResult)
          console.log(`[v0] WHOIS successful for ${domainAscii}`)
        } catch (err: any) {
          console.warn(`[v0] WHOIS failed for ${domainAscii}:`, err?.message)
          whoisError = err
        }
      } else if (hasWhoisSupport) {
        whoisLookup(domainAscii)
          .then((whoisResult) => {
            whoisData = normalizeWhoisResult(whoisResult)
            console.log(`[v0] Supplementary WHOIS retrieved for ${domainAscii}`)
          })
          .catch((err: any) => {
            console.log(`[v0] Supplementary WHOIS skipped for ${domainAscii}: ${err?.message}`)
          })
          .finally(() => {
            // Non-blocking operation, no cache update needed
          })
      }

      let finalResult: NormalizedRdap | undefined

      if (rdapData && whoisData) {
        console.log(`[v0] Returning merged data for ${domainAscii}`)
        finalResult = mergeRdapAndWhois(rdapData, whoisData)
      } else if (rdapData) {
        console.log(`[v0] Returning RDAP data for ${domainAscii}`)
        finalResult = rdapData
      } else if (whoisData) {
        console.log(`[v0] Returning WHOIS data for ${domainAscii}`)
        finalResult = whoisData
      } else {
        const errorMessage = createUserFriendlyError(domainAscii, rdapError, whoisError, hasWhoisSupport)
        console.error(`[v0] Both lookups failed for ${domainAscii}: ${errorMessage}`)
        throw new Error(errorMessage)
      }

      if (finalResult) {
        setCachedDomain(domainAscii, finalResult)
      }

      return finalResult
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
