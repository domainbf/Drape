/* RDAP client with timeout, retries, and normalization */

export class RdapError extends Error {
  code?: number
  constructor(message: string, code?: number) {
    super(message)
    this.name = "RdapError"
    this.code = code
  }
}

export class RdapTimeoutError extends RdapError {
  constructor(message = "The RDAP request timed out. Please try again.") {
    super(message)
    this.name = "RdapTimeoutError"
  }
}

export class RdapNetworkError extends RdapError {
  constructor(message = "A network error occurred while contacting the RDAP service.") {
    super(message)
    this.name = "RdapNetworkError"
  }
}

// Types
export type NormalizedContact = {
  name?: string
  organization?: string
  email?: string
  phone?: string
}

import type { WhoisResult } from "./whois"

export type NormalizedRdap = {
  domain: string
  registrar?: string
  statuses: string[]
  events: {
    createdAt?: string
    updatedAt?: string
    expiresAt?: string
  }
  nameservers: string[]
  dnssec?: boolean
  contacts: {
    registrant?: NormalizedContact
    admin?: NormalizedContact
    tech?: NormalizedContact
  }
  raw: any
  source: "rdap" | "whois"
}

type FetchRetryOptions = {
  attempts?: number
  timeoutMs?: number
  jitterMs?: number
  backoffBaseMs?: number
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  { attempts = 3, timeoutMs = 10000, jitterMs = 150, backoffBaseMs = 400 }: FetchRetryOptions = {},
): Promise<Response> {
  let lastError: unknown

  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(input, { ...init, signal: controller.signal })

      clearTimeout(timer)

      if (!res.ok) {
        if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
          throw new RdapError(`RDAP service returned ${res.status}`, res.status)
        }
        // Don't retry on other 4xx errors
        return res
      }

      return res
    } catch (err: any) {
      clearTimeout(timer)

      lastError = err?.name === "AbortError" ? new RdapTimeoutError() : err

      const retryable =
        err instanceof RdapTimeoutError ||
        err instanceof RdapNetworkError ||
        (err instanceof RdapError && err.code && err.code >= 500) ||
        err?.name === "AbortError" ||
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError") ||
        err?.message?.includes("fetch failed")

      if (i < attempts - 1 && retryable) {
        const backoff = backoffBaseMs * Math.pow(2, i) + Math.floor(Math.random() * jitterMs)
        console.log(`[v0] RDAP: Retry attempt ${i + 1} after ${backoff}ms`)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      } else {
        if (err?.name === "AbortError") {
          throw new RdapTimeoutError()
        }
        if (err instanceof TypeError && err.message.includes("fetch")) {
          throw new RdapNetworkError(err.message)
        }
        throw err
      }
    }
  }

  throw lastError ?? new RdapNetworkError()
}

function parseVCard(vcardArray: any): NormalizedContact {
  try {
    if (!Array.isArray(vcardArray) || vcardArray[0] !== "vcard") return {}
    const fields: any[] = vcardArray[1] || []

    const get = (key: string): string | undefined => {
      const item = fields.find((f) => Array.isArray(f) && f[0] === key)
      if (!Array.isArray(item) || item.length < 4) return undefined
      const value = String(item[3] ?? "").trim()
      return value || undefined
    }

    return {
      name: get("fn") || get("n"),
      organization: get("org") || get("x-organization"),
      email: get("email") || get("x-email"),
      phone: get("tel") || get("x-phone"),
    }
  } catch (err) {
    console.warn("[v0] RDAP: vCard parsing error:", err)
    return {}
  }
}

function mapContacts(entities: any[] | undefined) {
  const rolesToKey: Record<string, keyof NormalizedRdap["contacts"]> = {
    registrant: "registrant",
    administrative: "admin",
    admin: "admin",
    technical: "tech",
    tech: "tech",
  }

  const result: NormalizedRdap["contacts"] = {}

  if (!Array.isArray(entities)) return result

  for (const ent of entities) {
    const roles: string[] = ent?.roles || []
    const card = parseVCard(ent?.vcardArray)
    for (const role of roles) {
      const key = rolesToKey[role?.toLowerCase()]
      if (key && !result[key]) {
        result[key] = card
      }
    }
  }
  return result
}

function normalizeStatus(statuses: any): string[] {
  if (!Array.isArray(statuses)) return []
  return statuses.map((s) => String(s).toLowerCase()).filter(Boolean)
}

import { parseDate } from "./date-parser"

function extractEvents(events: any[]) {
  const out: NormalizedRdap["events"] = {}
  if (!Array.isArray(events)) return out

  for (const e of events) {
    const action = String(e?.eventAction || "").toLowerCase()
    const date = e?.eventDate ? String(e.eventDate) : undefined
    if (!date) continue

    const parsedDate = parseDate(date) || date

    if (action.includes("registration")) out.createdAt = parsedDate
    else if (action.includes("expiration") || action.includes("expiry")) out.expiresAt = parsedDate
    else if (action.includes("last changed") || action.includes("last update") || action.includes("update"))
      out.updatedAt = parsedDate
  }
  return out
}

async function fetchRdapJson(url: string) {
  const res = await fetchWithRetry(url, {
    method: "GET",
    headers: {
      accept: "application/rdap+json, application/json",
      "User-Agent": "RDAP-Domain-Lookup/1.0",
    },
  })

  if (!res.ok) {
    if (res.status === 404) throw new RdapError("Domain not found in RDAP.", 404)
    if (res.status === 400) throw new RdapError("Invalid domain format for RDAP.", 400)
    if (res.status === 429) throw new RdapError("Rate limit exceeded.", 429)
    throw new RdapError(`RDAP error: ${res.statusText}`, res.status)
  }

  try {
    const json = await res.json()
    return json
  } catch (err) {
    console.error("[v0] RDAP: JSON parse error:", err)
    throw new RdapError("Failed to parse RDAP response.")
  }
}

export async function rdapLookup(domainAscii: string): Promise<NormalizedRdap> {
  const proxyUrl = `/api/rdap?domain=${encodeURIComponent(domainAscii)}`
  let data: any

  try {
    console.log(`[v0] RDAP: Looking up ${domainAscii} via proxy`)
    data = await fetchRdapJson(proxyUrl)
    console.log(`[v0] RDAP: Successfully retrieved data for ${domainAscii}`)
  } catch (err) {
    console.error(`[v0] RDAP: Lookup failed for ${domainAscii}:`, err)
    throw err
  }

  const domainName: string = data?.ldhName || data?.unicodeName || domainAscii
  const statuses = normalizeStatus(data?.status)
  const entities = data?.entities
  const ns = Array.isArray(data?.nameservers)
    ? data.nameservers
        .map((n: any) => n?.ldhName || n?.unicodeName)
        .filter(Boolean)
        .map((n: string) => n.toLowerCase())
    : []

  const dnssec =
    String(data?.secureDNS?.zoneSigned || data?.secureDNS?.delegationSigned || "").toLowerCase() === "true" ||
    data?.secureDNS?.zoneSigned === true ||
    data?.secureDNS?.delegationSigned === true

  const registrar =
    data?.registrarName ||
    data?.port43 ||
    data?.entities
      ?.find((e: any) => e?.roles?.includes("registrar"))
      ?.vcardArray?.[1]?.find((f: any) => f[0] === "fn")?.[3] ||
    undefined

  const events = extractEvents(data?.events || [])
  const contacts = mapContacts(entities)

  return {
    domain: domainName,
    registrar,
    statuses,
    events,
    nameservers: ns,
    dnssec,
    contacts,
    raw: data,
    source: "rdap",
  }
}

export function normalizeWhoisResult(whoisData: WhoisResult): NormalizedRdap {
  return {
    domain: whoisData.domain,
    registrar: whoisData.registrar,
    statuses: whoisData.statuses,
    events: {
      createdAt: whoisData.createdAt,
      updatedAt: whoisData.updatedAt,
      expiresAt: whoisData.expiresAt,
    },
    nameservers: whoisData.nameservers,
    dnssec: undefined,
    contacts: {
      registrant: whoisData.registrantName
        ? { name: whoisData.registrantName, email: whoisData.registrantEmail, organization: whoisData.registrantOrg }
        : undefined,
      admin: whoisData.adminName
        ? { name: whoisData.adminName, email: whoisData.adminEmail, organization: whoisData.adminOrg }
        : undefined,
      tech: whoisData.techName
        ? { name: whoisData.techName, email: whoisData.techEmail, organization: whoisData.techOrg }
        : undefined,
    },
    raw: { whoisRaw: whoisData.raw },
    source: "whois",
  }
}

export function mergeRdapAndWhois(rdapData: NormalizedRdap, whoisData: NormalizedRdap): NormalizedRdap {
  return {
    domain: rdapData.domain || whoisData.domain,
    registrar: rdapData.registrar || whoisData.registrar,
    statuses: [...new Set([...rdapData.statuses, ...whoisData.statuses])],
    events: {
      createdAt: rdapData.events.createdAt || whoisData.events.createdAt,
      updatedAt: rdapData.events.updatedAt || whoisData.events.updatedAt,
      expiresAt: rdapData.events.expiresAt || whoisData.events.expiresAt,
    },
    nameservers: [...new Set([...rdapData.nameservers, ...whoisData.nameservers])],
    dnssec: rdapData.dnssec !== undefined ? rdapData.dnssec : whoisData.dnssec,
    contacts: {
      registrant: rdapData.contacts.registrant || whoisData.contacts.registrant,
      admin: rdapData.contacts.admin || whoisData.contacts.admin,
      tech: rdapData.contacts.tech || whoisData.contacts.tech,
    },
    raw: {
      rdap: rdapData.raw,
      whois: whoisData.raw,
    },
    source: "rdap",
  }
}
