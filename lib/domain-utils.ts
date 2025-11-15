import type { ZodError } from "zod"
import { toASCII, toUnicode } from "./punycode-simple"

export function normalizeDomainInput(input: string): string {
  let v = input.trim().toLowerCase()

  // Strip scheme
  v = v.replace(/^https?:\/\//i, "")

  // Remove path/query/fragment if user pasted a full URL
  const slash = v.indexOf("/")
  if (slash !== -1) v = v.slice(0, slash)
  const qm = v.indexOf("?")
  if (qm !== -1) v = v.slice(0, qm)
  const hash = v.indexOf("#")
  if (hash !== -1) v = v.slice(0, hash)

  // Remove credentials if any (user:pass@domain)
  const at = v.lastIndexOf("@")
  if (at !== -1) v = v.slice(at + 1)

  // Remove default 'www.' prefix to keep canonical form
  v = v.replace(/^www\./, "")

  // Remove surrounding dots (rare copy/paste issue)
  v = v.replace(/^\.+|\.+$/g, "")

  // Don't replace underscores in non-ASCII domains to preserve original input
  const hasNonAscii = /[^\x00-\x7F]/.test(v)
  if (!hasNonAscii) {
    // Only normalize ASCII domains
    v = v.replace(/_/g, "-")
  }

  return v
}

export function ValidationErrorMap(error: ZodError): string {
  // Return first useful message
  const first = error.issues?.[0]
  if (!first) return "Invalid domain."
  return first.message || "Invalid domain."
}

export function isValidDomainStructure(domain: string): boolean {
  // Split domain into parts
  const parts = domain.split(".")

  // Must have at least 2 parts (domain.tld)
  if (parts.length < 2) return false

  // Get TLD (last part)
  const tld = parts[parts.length - 1]

  // TLD validation:
  // - Must be 2+ characters
  // - Can contain letters, numbers, hyphens
  // - Can be punycode (xn--)
  // - Support new gTLDs (can be longer than 3 chars)
  // - Support Chinese/IDN TLDs
  if (tld.length < 2) return false
  if (!/^[a-z0-9-\u4e00-\u9fff]+$/i.test(tld)) return false
  if (tld.startsWith("-") || tld.endsWith("-")) return false

  // Validate each label (domain parts)
  for (const part of parts) {
    // Each label must be 1-63 characters (note: Chinese characters count differently in punycode)
    if (part.length < 1 || part.length > 63) return false

    // Must contain only alphanumeric, hyphens, or Chinese characters
    if (!/^[a-z0-9-\u4e00-\u9fff]+$/i.test(part)) return false

    // Cannot start or end with hyphen (except xn-- for punycode)
    if (!part.startsWith("xn--")) {
      if (part.startsWith("-") || part.endsWith("-")) return false
    }
  }

  return true
}

export async function punycodeEncode(domain: string): Promise<string> {
  try {
    // Check if domain contains non-ASCII characters
    const hasNonAscii = /[^\x00-\x7F]/.test(domain)

    if (!hasNonAscii) {
      // Already ASCII, return as-is
      return domain
    }

    // Check if it's a Chinese domain (most common IDN)
    const hasChineseChars = /[\u4e00-\u9fff]/.test(domain)
    if (hasChineseChars) {
      console.log(`[v0] Detected Chinese domain: ${domain}`)
    }

    const encoded = toASCII(domain)

    if (!encoded || encoded.length === 0) {
      console.warn(`[v0] Empty result encoding domain "${domain}"`)
      return domain
    }

    if (!/^[a-z0-9.-]+$/i.test(encoded)) {
      console.warn(`[v0] Invalid punycode result for domain "${domain}": ${encoded}`)
      return domain
    }

    console.log(`[v0] Encoded "${domain}" to "${encoded}" (${hasChineseChars ? "Chinese IDN" : "International domain"})`)
    return encoded
  } catch (err) {
    console.error("[v0] Punycode encoding failed:", err)
    // Return original domain if encoding completely fails
    return domain
  }
}

export async function punycodeDecode(domain: string): Promise<string> {
  try {
    // Check if domain contains punycode (xn--)
    if (!domain.includes("xn--")) {
      return domain
    }

    const decoded = toUnicode(domain)
    
    // Verify the decoded result contains valid characters
    if (decoded && decoded.length > 0) {
      console.log(`[v0] Decoded "${domain}" to "${decoded}"`)
      return decoded
    }
    
    return domain
  } catch (err) {
    console.error("[v0] Punycode decoding failed:", err)
    return domain
  }
}

export function isChineseDomain(domain: string): boolean {
  // Check for CJK Unified Ideographs (Chinese characters)
  // Also includes CJK Unified Ideographs Extension A-F for comprehensive coverage
  return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(domain)
}

export function isIDN(domain: string): boolean {
  // Check for non-ASCII characters (covers all international domains)
  // or punycode prefix (xn--)
  // Includes: Chinese, Arabic, Cyrillic, Greek, Korean, Japanese, etc.
  return /[^\x00-\x7F]/.test(domain) || domain.includes("xn--")
}

export function detectDomainScript(domain: string): "ascii" | "chinese" | "latin-extended" | "cyrillic" | "arabic" | "other" {
  if (/[\u4e00-\u9fff]/.test(domain)) return "chinese"
  if (/[\u0400-\u04ff]/.test(domain)) return "cyrillic"
  if (/[\u0600-\u06ff]/.test(domain)) return "arabic"
  if (/[\u00c0-\u017f]/.test(domain)) return "latin-extended"
  if (/[^\x00-\x7F]/.test(domain)) return "other"
  return "ascii"
}

export const DOMAIN_CACHE: Map<string, { result: any; timestamp: number }> = new Map()

export const CACHE_TTL = 1 * 60 * 60 * 1000 // 1 hour cache TTL

export function getCachedDomain(domain: string): any | null {
  const cached = DOMAIN_CACHE.get(domain)
  if (!cached) return null
  
  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    DOMAIN_CACHE.delete(domain)
    return null
  }
  
  return cached.result
}

export function setCachedDomain(domain: string, result: any): void {
  DOMAIN_CACHE.set(domain, { result, timestamp: Date.now() })
  
  // Keep cache size under control (max 100 entries)
  if (DOMAIN_CACHE.size > 100) {
    const firstKey = DOMAIN_CACHE.keys().next().value
    if (firstKey) DOMAIN_CACHE.delete(firstKey)
  }
}
