import { getWhoisServers } from "./whois-servers"
import { normalizeFieldName } from "./normalize-field-name"
import { parseDate } from "./date-parser"

export class WhoisError extends Error {
  code?: number
  server?: string

  constructor(message: string, code?: number, server?: string) {
    super(message)
    this.name = "WhoisError"
    this.code = code
    this.server = server
  }
}

export class WhoisTimeoutError extends WhoisError {
  constructor(message = "The WHOIS request timed out.", server?: string) {
    super(message, undefined, server)
    this.name = "WhoisTimeoutError"
  }
}

export class WhoisNetworkError extends WhoisError {
  constructor(message = "A network error occurred while contacting the WHOIS server.", server?: string) {
    super(message, undefined, server)
    this.name = "WhoisNetworkError"
  }
}

export type WhoisResult = {
  domain: string
  raw: string
  server: string
  source: "whois"
  registrar?: string
  createdAt?: string
  updatedAt?: string
  expiresAt?: string
  nameservers: string[]
  statuses: string[]
  registrantName?: string
  registrantEmail?: string
  registrantOrg?: string
  adminName?: string
  adminEmail?: string
  adminOrg?: string
  techName?: string
  techEmail?: string
  techOrg?: string
}

function isValidNameserver(value: string): boolean {
  if (!value || value.length < 3) return false

  // Remove common non-NS values
  const lowerValue = value.toLowerCase().trim()
  const invalidValues = [
    "unsigned",
    "signed",
    "yes",
    "no",
    "active",
    "inactive",
    "ok",
    "clienthold",
    "serverhold",
    "pendingdelete",
    "redemptionperiod",
    "pendingrestore",
    "clienttransferprohibited",
    "servertransferprohibited",
    "clientdeleteprohibited",
    "serverdeleteprohibited",
    "clientupdateprohibited",
    "serverupdateprohibited",
    "clientrenewprohibited",
    "serverrenewprohibited",
  ]

  if (invalidValues.includes(lowerValue)) return false

  // Must contain at least one dot and look like a domain
  if (!lowerValue.includes(".")) return false

  // Should not contain spaces (after initial split)
  if (lowerValue.includes(" ")) return false

  // Should look like a valid domain format
  const domainPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i
  return domainPattern.test(lowerValue)
}

function isValidStatus(value: string): boolean {
  if (!value || value.length < 2) return false

  const lowerValue = value.toLowerCase().trim()

  // Common valid status keywords
  const validStatusKeywords = [
    "ok",
    "active",
    "hold",
    "lock",
    "transfer",
    "delete",
    "update",
    "renew",
    "prohibit",
    "pending",
    "redemption",
    "restore",
    "client",
    "server",
    "registry",
    "registrar",
    "autorenew",
    "inactive",
  ]

  // Check if it contains any valid status keyword
  return validStatusKeywords.some((keyword) => lowerValue.includes(keyword))
}

export function parseWhoisResponse(response: string, domain: string): Partial<WhoisResult> {
  const lines = response.split("\n")
  const result: Partial<WhoisResult> = {
    nameservers: [],
    statuses: [],
  }

  const extractValue = (line: string): string => {
    const colonIndex = line.indexOf(":")
    if (colonIndex === -1) return line.trim()
    return line.substring(colonIndex + 1).trim()
  }

  const isEmptyValue = (value: string): boolean => {
    return !value || value === "—" || value === "-" || value === "N/A" || value === "n/a" || value === ""
  }

  const isEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const dateFieldPatterns = {
    created: [
      /^(created|creation|registered|registration)/,
      /domainregistrationdate/,
      /regdate/,
      /createdate/,
      /creationdate/,
      /registrationtime/,
      /registereddate/,
      /domaincreat/,
      /datede création/,
      /fechadecreación/,
      /erstellungsdatum/,
      /datacriação/,
      /注册时间/,
      /创建时间/,
    ],
    updated: [
      /^(updated|lastupdate|lastmodified|lastchanged|modified|changed)/,
      /domainupdatedate/,
      /lastchange/,
      /changeddate/,
      /modifieddate/,
      /lastupdated/,
      /updatedate/,
      /recordlastupdate/,
      /lastmodifieddate/,
      /lastupdateddate/,
      /updatetime/,
      /modificationdate/,
      /lastupdate/,
      /recordmodified/,
      /lastmodification/,
      /dernièremodification/,
      /últimamodificación/,
      /letzteänderung/,
      /últimamodificação/,
      /更新时间/,
      /最后更新/,
      /修改时间/,
      /recordupdate/,
      /domainlastupdate/,
    ],
    expires: [
      /^expir/,
      /renewal/,
      /paidtill/,
      /expirationdate/,
      /expiredate/,
      /expire/,
      /registryexpiry/,
      /registrarexpiry/,
      /expirydate/,
      /domainexpir/,
      /dated'expiration/,
      /fechadeexpiración/,
      /ablaufdatum/,
      /datadeexpiração/,
      /过期时间/,
      /到期时间/,
    ],
  }

  const potentialUpdateDates: string[] = []

  let currentContactSection: "registrant" | "admin" | "tech" | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith("%") || line.startsWith("#") || line.startsWith(";") || line.startsWith("=")) continue

    const sectionMatch = line.match(/^\[(ADMIN_C|ADMIN|HOLDER|REGISTRANT|TECH_C|TECH|BILLING)\]/i)
    if (sectionMatch) {
      const section = sectionMatch[1].toLowerCase()
      if (section.includes("admin")) {
        currentContactSection = "admin"
      } else if (section.includes("holder") || section.includes("registrant")) {
        currentContactSection = "registrant"
      } else if (section.includes("tech")) {
        currentContactSection = "tech"
      }
      continue
    }

    // Reset contact section on empty line or new section
    if (!line.includes(":")) {
      currentContactSection = null
    }

    const normalized = normalizeFieldName(line)
    const value = extractValue(line)

    if (isEmptyValue(value)) continue

    if (
      normalized === "registrar" ||
      normalized.includes("sponsoringregistrar") ||
      normalized.includes("registrarname") ||
      normalized.includes("registrarorganization") ||
      normalized.includes("bureaud'enregistrement") ||
      (normalized.match(/^organization/) && i > 0 && normalizeFieldName(lines[i - 1]).includes("registrar"))
    ) {
      if (
        !result.registrar &&
        !normalized.includes("phone") &&
        !normalized.includes("email") &&
        !normalized.includes("country") &&
        !normalized.includes("url") &&
        !normalized.includes("whois") &&
        !normalized.includes("abuse") &&
        !normalized.includes("iana")
      ) {
        result.registrar = value
      }
    }

    if (dateFieldPatterns.created.some((pattern) => normalized.match(pattern)) && !normalized.includes("expir")) {
      if (!result.createdAt) {
        const parsed = parseDate(value)
        if (parsed) result.createdAt = parsed
      }
    }

    if (dateFieldPatterns.updated.some((pattern) => normalized.match(pattern))) {
      const parsed = parseDate(value)
      if (parsed) {
        potentialUpdateDates.push(parsed)
      }
    }

    if (dateFieldPatterns.expires.some((pattern) => normalized.match(pattern))) {
      if (!result.expiresAt) {
        const parsed = parseDate(value)
        if (parsed) result.expiresAt = parsed
      }
    }

    if (
      normalized === "nameserver" ||
      normalized.match(/^nameserver/) ||
      normalized.match(/^nserver/) ||
      normalized.match(/^ns\d*$/) ||
      normalized.match(/^ns[a-z]*host/) ||
      normalized.includes("serveurdenoms") ||
      normalized.includes("servidordenombres") ||
      (normalized.includes("dns") && !normalized.includes("dnssec"))
    ) {
      const nsValue = value.split(/[\s(]/)[0].toLowerCase().trim()

      if (isValidNameserver(nsValue) && !result.nameservers!.includes(nsValue)) {
        result.nameservers!.push(nsValue)
      }
    }

    if (
      normalized === "status" ||
      normalized === "statut" ||
      normalized === "estado" ||
      (normalized.includes("status") && !normalized.includes("nameserverstatus") && !normalized.includes("dnssec"))
    ) {
      const statusParts = value
        .split(/[,;]/)
        .map((s) => s.trim())
        .map((s) => s.replace(/^https?:\/\/.*?\//i, "").trim())
        .filter((s) => s && s !== "—" && s !== "-" && isValidStatus(s))

      for (const status of statusParts) {
        if (!result.statuses!.includes(status)) {
          result.statuses!.push(status)
        }
      }
    }

    const contactTypes = [
      { key: "registrant", patterns: [/^registrant/, /^holder/, /^titulaire/, /^titular/, /^inhaber/] },
      { key: "admin", patterns: [/^admin/, /^administrateur/, /^administrador/] },
      { key: "tech", patterns: [/^tech/, /^technique/, /^técnico/] },
    ]

    // Use current section context if available
    if (currentContactSection) {
      if (
        normalized === "nom" ||
        normalized === "name" ||
        normalized === "nombre" ||
        normalized.includes("name") ||
        normalized.includes("nom")
      ) {
        const contactKey = `${currentContactSection}Name` as const
        if (!result[contactKey] && !isEmail(value) && !normalized.includes("domain")) {
          result[contactKey] = value
        }
      }

      if (normalized === "email" || normalized === "courriel" || normalized.includes("email")) {
        const contactKey = `${currentContactSection}Email` as const
        if (!result[contactKey] && isEmail(value)) {
          result[contactKey] = value
        }
      }

      if (
        normalized === "organization" ||
        normalized === "organisation" ||
        normalized === "organización" ||
        normalized.includes("org")
      ) {
        const contactKey = `${currentContactSection}Org` as const
        if (!result[contactKey]) {
          result[contactKey] = value
        }
      }
    } else {
      // Fallback to pattern matching if no section context
      for (const contactType of contactTypes) {
        if (contactType.patterns.some((pattern) => normalized.match(pattern))) {
          const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ""

          if (
            (normalized.includes("name") ||
              normalized.includes("nom") ||
              normalized.includes("nombre") ||
              normalized.includes("person") ||
              !nextLine.includes(":")) &&
            !normalized.includes("org") &&
            !normalized.includes("domain")
          ) {
            const contactKey = `${contactType.key}Name` as const
            if (!result[contactKey] && !isEmail(value)) {
              result[contactKey] = value
            }
          }

          if (normalized.includes("email") || normalized.includes("courriel") || normalized.includes("emailaddress")) {
            const contactKey = `${contactType.key}Email` as const
            if (!result[contactKey] && isEmail(value)) {
              result[contactKey] = value
            }
          }

          if (
            normalized.includes("org") ||
            normalized.includes("organization") ||
            normalized.includes("organisation") ||
            normalized.includes("organización")
          ) {
            const contactKey = `${contactType.key}Org` as const
            if (!result[contactKey]) {
              result[contactKey] = value
            }
          }
        }
      }
    }
  }

  if (potentialUpdateDates.length > 0) {
    result.updatedAt = potentialUpdateDates.sort().reverse()[0]
  }

  return result
}

function validateWhoisDomain(response: string, queriedDomain: string): boolean {
  const lines = response.split("\n")
  const queriedLower = queriedDomain.toLowerCase()

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()
    if (
      trimmed.includes(`domain name: ${queriedLower}`) ||
      trimmed.includes(`domain: ${queriedLower}`) ||
      (trimmed.includes(`domain name:`) && trimmed.includes(queriedLower)) ||
      trimmed.startsWith(`${queriedLower}`) ||
      trimmed === queriedLower
    ) {
      return true
    }
  }

  const domainPattern = /domain\s*name?\s*:\s*([^\s]+)/gi
  const matches = response.match(domainPattern)
  if (matches && matches.length > 0) {
    for (const match of matches) {
      const extractedDomain = match.split(":")[1]?.trim().toLowerCase()
      if (extractedDomain && extractedDomain !== queriedLower) {
        return false
      }
    }
  }

  return true
}

export async function whoisLookup(domain: string): Promise<WhoisResult> {
  const servers = getWhoisServers(domain)

  if (servers.length === 0) {
    throw new WhoisError(`No WHOIS server found for domain: ${domain}`)
  }

  console.log(`[v0] WHOIS: Looking up ${domain} using servers:`, servers)

  let lastError: WhoisError | null = null

  for (let i = 0; i < servers.length; i++) {
    const server = servers[i]

    try {
      console.log(`[v0] WHOIS: Trying server ${server} (${i + 1}/${servers.length})`)

      const response = await fetch("/api/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, server }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        const errorMsg = error.error || `WHOIS query failed: ${response.statusText}`
        lastError = new WhoisError(errorMsg, response.status, server)
        console.warn(`[v0] WHOIS: Server ${server} returned ${response.status}: ${errorMsg}`)
        continue
      }

      const data = await response.json()

      if (!data.raw || data.raw.length === 0) {
        lastError = new WhoisError(`WHOIS server returned empty response for ${domain}`, undefined, server)
        console.warn(`[v0] WHOIS: Server ${server} returned empty response`)
        continue
      }

      if (!validateWhoisDomain(data.raw, domain)) {
        console.warn(`[v0] WHOIS: Domain validation failed for ${server}`)
      }

      const parsed = parseWhoisResponse(data.raw, domain)

      console.log(`[v0] WHOIS: Successfully retrieved data from ${server}`)

      return {
        domain,
        raw: data.raw,
        server,
        source: "whois",
        registrar: parsed.registrar,
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
        expiresAt: parsed.expiresAt,
        nameservers: parsed.nameservers || [],
        statuses: parsed.statuses || [],
        registrantName: parsed.registrantName,
        registrantEmail: parsed.registrantEmail,
        registrantOrg: parsed.registrantOrg,
        adminName: parsed.adminName,
        adminEmail: parsed.adminEmail,
        adminOrg: parsed.adminOrg,
        techName: parsed.techName,
        techEmail: parsed.techEmail,
        techOrg: parsed.techOrg,
      }
    } catch (err: any) {
      if (err instanceof WhoisError) {
        lastError = err
      } else {
        lastError = new WhoisError(err?.message || "Unknown error", undefined, server)
      }
      console.warn(`[v0] WHOIS: Error with server ${server}:`, err?.message)
    }
  }

  const errorMsg = lastError ? lastError.message : "All WHOIS servers failed"
  throw new WhoisError(`WHOIS lookup failed for ${domain}: ${errorMsg}`)
}
