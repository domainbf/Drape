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

// Enhanced multi-language field patterns
const multiLanguagePatterns = {
  registrar: [
    // English
    /registrar:/i,
    /sponsoring registrar:/i,
    /registrar name:/i,
    /registrar organization:/i,
    // French
    /bureau d'enregistrement:/i,
    /registraire:/i,
    // Spanish
    /registrador:/i,
    // German
    /registrar:/i,
    /registrierungsstelle:/i,
    // Chinese
    /注册商:/,
    /注册服务机构:/,
    // Japanese
    /レジストラ:/,
    // Russian
    /регистратор:/i,
  ],
  created: [
    // English
    /created:/i,
    /creation date:/i,
    /registered:/i,
    /registration date:/i,
    /domain registration date:/i,
    // French
    /date de création:/i,
    /créé le:/i,
    // Spanish
    /fecha de creación:/i,
    /creado:/i,
    // German
    /erstellungsdatum:/i,
    /angelegt am:/i,
    // Chinese
    /创建时间:/,
    /注册时间:/,
    /注册日期:/,
    // Japanese
    /作成日:/,
    /登録日:/,
    // Russian
    /дата создания:/i,
    /создан:/i,
  ],
  nameserver: [
    // English
    /name server:/i,
    /nameserver:/i,
    /nserver:/i,
    /dns:/i,
    // French
    /serveur de noms:/i,
    // Spanish
    /servidor de nombres:/i,
    // German
    /nameserver:/i,
    // Chinese
    /域名服务器:/,
    /名称服务器:/,
    // Japanese
    /ネームサーバー:/,
    // Russian
    /сервер имен:/i,
  ],
  status: [
    // English
    /status:/i,
    /domain status:/i,
    // French
    /statut:/i,
    // Spanish
    /estado:/i,
    // German
    /status:/i,
    // Chinese
    /状态:/,
    // Japanese
    /ステータス:/,
    // Russian
    /статус:/i,
  ]
}

// Enhanced field extraction with multi-language support
function extractFieldValue(line: string, fieldPatterns: RegExp[]): string | null {
  const lowerLine = line.toLowerCase()
  
  for (const pattern of fieldPatterns) {
    const match = line.match(pattern)
    if (match) {
      // Extract value after the field name
      const value = line.substring(match[0].length).trim()
      
      // Handle cases where value might be on next line or separated by special characters
      if (!value || value === ':' || value === '') {
        return null // Value likely on next line
      }
      
      // Clean up common separators
      const cleanedValue = value
        .replace(/^[:-\s]+/, '') // Remove leading separators
        .replace(/[\s,;]+$/, '') // Remove trailing separators
      
      return cleanedValue || null
    }
  }
  
  return null
}

// Enhanced WHOIS response parser with better multi-language and irregular format support
export function parseWhoisResponse(response: string, domain: string): Partial<WhoisResult> {
  const lines = response.split("\n")
  const result: Partial<WhoisResult> = {
    nameservers: [],
    statuses: [],
  }

  const extractValue = (line: string): string => {
    // Enhanced extraction to handle various formats
    const colonIndex = line.indexOf(":")
    const dashIndex = line.indexOf("-")
    const spaceIndex = line.indexOf(" ")
    
    if (colonIndex !== -1) {
      return line.substring(colonIndex + 1).trim()
    } else if (dashIndex !== -1 && line.substring(0, dashIndex).trim().length < 20) {
      return line.substring(dashIndex + 1).trim()
    } else if (spaceIndex !== -1 && line.substring(0, spaceIndex).trim().length < 20) {
      return line.substring(spaceIndex + 1).trim()
    }
    
    return line.trim()
  }

  const isEmptyValue = (value: string): boolean => {
    const emptyValues = ["—", "-", "N/A", "n/a", "null", "none", "not defined", "not available", "unknown", ""]
    return !value || emptyValues.includes(value.toLowerCase().trim())
  }

  const isEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  // Enhanced date field patterns with multi-language support
  const dateFieldPatterns = {
    created: [
      // English
      /^(created|creation|registered|registration)/i,
      /domainregistrationdate/i,
      /regdate/i,
      /createdate/i,
      /creationdate/i,
      /registrationtime/i,
      /registereddate/i,
      /domaincreat/i,
      /registered on/i,
      // French
      /datede création/i,
      /créé le/i,
      /enregistré le/i,
      // Spanish
      /fechadecreación/i,
      /creado el/i,
      /registrado el/i,
      // German
      /erstellungsdatum/i,
      /angelegt am/i,
      /registriert am/i,
      // Chinese
      /注册时间/i,
      /创建时间/i,
      /注册日期/i,
      // Japanese
      /作成日/i,
      /登録日/i,
      // Russian
      /датарегистрации/i,
      /создан/i,
      // Korean
      /등록일/i,
    ],
    updated: [
      // English
      /^(updated|lastupdate|lastmodified|lastchanged|modified|changed)/i,
      /domainupdatedate/i,
      /lastchange/i,
      /changeddate/i,
      /modifieddate/i,
      /lastupdated/i,
      /updatedate/i,
      /recordlastupdate/i,
      /lastmodifieddate/i,
      /lastupdateddate/i,
      /updatetime/i,
      /modificationdate/i,
      /recordmodified/i,
      /lastmodification/i,
      // French
      /dernièremodification/i,
      /modifié le/i,
      // Spanish
      /últimamodificación/i,
      /actualizado el/i,
      // German
      /letzteänderung/i,
      /geändert am/i,
      // Chinese
      /更新时间/i,
      /最后更新/i,
      /修改时间/i,
      // Japanese
      /更新日/i,
      /最終更新/i,
      // Russian
      /датапоследнегоизменения/i,
      /обновлен/i,
    ],
    expires: [
      // English
      /^expir/i,
      /renewal/i,
      /paidtill/i,
      /expirationdate/i,
      /expiredate/i,
      /expire/i,
      /registryexpiry/i,
      /registrarexpiry/i,
      /expirydate/i,
      /domainexpir/i,
      /expires on/i,
      /valid until/i,
      // French
      /dated'expiration/i,
      /expire le/i,
      // Spanish
      /fechadeexpiración/i,
      /expira el/i,
      // German
      /ablaufdatum/i,
      /läuft ab am/i,
      // Chinese
      /过期时间/i,
      /到期时间/i,
      /到期日期/i,
      // Japanese
      /有効期限/i,
      /満了日/i,
      // Russian
      /датаистечения/i,
      /истекает/i,
    ],
  }

  const potentialUpdateDates: string[] = []
  let currentContactSection: "registrant" | "admin" | "tech" | null = null

  // Pre-process lines to handle multi-line fields
  const processedLines: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip comments and empty lines
    if (!line || line.startsWith("%") || line.startsWith("#") || line.startsWith(";") || line.startsWith("=")) {
      continue
    }

    // Handle multi-line values by combining with previous line if current line doesn't have a field marker
    if (i > 0 && !line.includes(":") && !line.includes("-") && processedLines.length > 0) {
      const lastIndex = processedLines.length - 1
      processedLines[lastIndex] += " " + line
    } else {
      processedLines.push(line)
    }
  }

  // Parse processed lines
  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i]
    if (!line) continue

    // Enhanced section detection
    const sectionMatch = line.match(/^\[(ADMIN_C|ADMIN|HOLDER|REGISTRANT|TECH_C|TECH|BILLING|OWNER|CONTACT)\]/i)
    if (sectionMatch) {
      const section = sectionMatch[1].toLowerCase()
      if (section.includes("admin")) {
        currentContactSection = "admin"
      } else if (section.includes("holder") || section.includes("registrant") || section.includes("owner")) {
        currentContactSection = "registrant"
      } else if (section.includes("tech")) {
        currentContactSection = "tech"
      } else if (section.includes("billing")) {
        currentContactSection = null // Usually not needed for basic info
      }
      continue
    }

    // Reset section context if we encounter a new top-level field
    if (line.match(/^(Domain|Registrar|Name Server|Status|Created|Updated|Expires)/i)) {
      currentContactSection = null
    }

    const normalized = normalizeFieldName(line)
    const value = extractValue(line)

    if (isEmptyValue(value)) continue

    // Enhanced registrar extraction with multi-language support
    if (!result.registrar) {
      const registrarValue = extractFieldValue(line, multiLanguagePatterns.registrar)
      if (registrarValue && !isEmptyValue(registrarValue)) {
        result.registrar = registrarValue
      } else if (
        normalized === "registrar" ||
        normalized.includes("sponsoringregistrar") ||
        normalized.includes("registrarname") ||
        normalized.includes("registrarorganization") ||
        normalized.includes("bureaud'enregistrement") ||
        normalized.includes("domainregistrar") ||
        (normalized.match(/^organization/) && i > 0 && normalizeFieldName(processedLines[i - 1]).includes("registrar"))
      ) {
        if (
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
    }

    // Enhanced date parsing
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

    // Enhanced nameserver extraction with multi-language support
    const nsValue = extractFieldValue(line, multiLanguagePatterns.nameserver)
    if (nsValue && !isEmptyValue(nsValue)) {
      const cleanNsValue = nsValue.split(/[\s(]/)[0].toLowerCase().trim()
      if (isValidNameserver(cleanNsValue) && !result.nameservers!.includes(cleanNsValue)) {
        result.nameservers!.push(cleanNsValue)
      }
    } else if (
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

    // Enhanced status extraction with multi-language support
    const statusValue = extractFieldValue(line, multiLanguagePatterns.status)
    if (statusValue && !isEmptyValue(statusValue)) {
      const statusParts = statusValue
        .split(/[,;]/)
        .map((s) => s.trim())
        .map((s) => s.replace(/^https?:\/\/.*?\//i, "").trim())
        .filter((s) => s && s !== "—" && s !== "-" && isValidStatus(s))

      for (const status of statusParts) {
        if (!result.statuses!.includes(status)) {
          result.statuses!.push(status)
        }
      }
    } else if (
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

    // Enhanced contact information extraction
    const contactTypes = [
      { 
        key: "registrant", 
        patterns: [
          /^registrant/i, /^holder/i, /^titulaire/i, /^titular/i, /^inhaber/i, /^owner/i,
          /^domain holder/i, /^domain owner/i
        ] 
      },
      { 
        key: "admin", 
        patterns: [
          /^admin/i, /^administrateur/i, /^administrador/i, /^administrative/i,
          /^admin contact/i
        ] 
      },
      { 
        key: "tech", 
        patterns: [
          /^tech/i, /^technique/i, /^técnico/i, /^technical/i,
          /^tech contact/i, /^technical contact/i
        ] 
      },
    ]

    // Use current section context if available
    if (currentContactSection) {
      if (
        normalized === "nom" ||
        normalized === "name" ||
        normalized === "nombre" ||
        normalized.includes("name") ||
        normalized.includes("nom") ||
        normalized.includes("full name") ||
        normalized.includes("contact name")
      ) {
        const contactKey = `${currentContactSection}Name` as const
        if (!result[contactKey] && !isEmail(value) && !normalized.includes("domain")) {
          result[contactKey] = value
        }
      }

      if (
        normalized === "email" || 
        normalized === "courriel" || 
        normalized.includes("email") ||
        normalized.includes("e-mail") ||
        normalized.includes("mail")
      ) {
        const contactKey = `${currentContactSection}Email` as const
        if (!result[contactKey] && isEmail(value)) {
          result[contactKey] = value
        }
      }

      if (
        normalized === "organization" ||
        normalized === "organisation" ||
        normalized === "organización" ||
        normalized.includes("org") ||
        normalized.includes("company") ||
        normalized.includes("organization")
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
          const nextLine = i + 1 < processedLines.length ? processedLines[i + 1].trim() : ""

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

          if (
            normalized.includes("email") || 
            normalized.includes("courriel") || 
            normalized.includes("emailaddress") ||
            normalized.includes("e-mail")
          ) {
            const contactKey = `${contactType.key}Email` as const
            if (!result[contactKey] && isEmail(value)) {
              result[contactKey] = value
            }
          }

          if (
            normalized.includes("org") ||
            normalized.includes("organization") ||
            normalized.includes("organisation") ||
            normalized.includes("organización") ||
            normalized.includes("company")
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

  // Handle special cases for .gg domains and similar formats
  if (!result.registrar) {
    // Try to extract registrar from free-form text
    const registrarMatch = response.match(/Registrar:\s*([^\n\r]+)/i)
    if (registrarMatch) {
      result.registrar = registrarMatch[1].trim()
    }
  }

  if (!result.createdAt) {
    // Try to extract creation date from free-form text like "Registered on 30th June 2003"
    const createdMatch = response.match(/Registered on\s*([^\n\r]+?)(?:\s+at|$)/i)
    if (createdMatch) {
      const parsed = parseDate(createdMatch[1].trim())
      if (parsed) result.createdAt = parsed
    }
  }

  if (!result.nameservers || result.nameservers.length === 0) {
    // Try to extract nameservers from free-form text
    const nsMatches = response.matchAll(/ns[0-9]?\.[^\s,\r\n]+/gi)
    for (const match of nsMatches) {
      const ns = match[0].toLowerCase().trim()
      if (isValidNameserver(ns) && !result.nameservers.includes(ns)) {
        result.nameservers.push(ns)
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

      console.log(`[v0] WHOIS: Successfully retrieved data from ${server}`, {
        registrar: parsed.registrar,
        nameservers: parsed.nameservers?.length,
        createdAt: parsed.createdAt,
        statuses: parsed.statuses?.length
      })

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
