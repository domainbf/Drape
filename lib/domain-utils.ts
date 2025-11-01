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
  if (tld.length < 2) return false
  if (!/^[a-z0-9-]+$/.test(tld)) return false
  if (tld.startsWith("-") || tld.endsWith("-")) return false

  // Validate each label (domain parts)
  for (const part of parts) {
    // Each label must be 1-63 characters
    if (part.length < 1 || part.length > 63) return false

    // Must contain only alphanumeric and hyphens
    if (!/^[a-z0-9-]+$/.test(part)) return false

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

    const encoded = toASCII(domain)

    if (!encoded || encoded.length === 0) {
      console.warn(`[v0] Empty result encoding domain "${domain}"`)
      return domain
    }

    if (!/^[a-z0-9.-]+$/i.test(encoded)) {
      console.warn(`[v0] Invalid punycode result for domain "${domain}": ${encoded}`)
      return domain
    }

    console.log(`[v0] Encoded "${domain}" to "${encoded}"`)
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
    return decoded
  } catch (err) {
    console.error("[v0] Punycode decoding failed:", err)
    return domain
  }
}

export function isChineseDomain(domain: string): boolean {
  // Check for Chinese characters (CJK Unified Ideographs)
  return /[\u4e00-\u9fff]/.test(domain)
}

export function isIDN(domain: string): boolean {
  // Check for non-ASCII characters or punycode prefix
  return /[^\x00-\x7F]/.test(domain) || domain.includes("xn--")
}
