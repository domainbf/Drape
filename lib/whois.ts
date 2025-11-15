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
  const lower = value.toLowerCase().trim()
  const invalid = [
    "unsigned","signed","yes","no","active","inactive","ok","clienthold","serverhold",
    "pendingdelete","redemptionperiod","pendingrestore","clienttransferprohibited",
    "servertransferprohibited","clientdeleteprohibited","serverdeleteprohibited",
    "clientupdateprohibited","serverupdateprohibited","clientrenewprohibited","serverrenewprohibited"
  ]
  if (invalid.includes(lower) || !lower.includes(".") || lower.includes(" ")) return false
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(lower)
}

function isValidStatus(value: string): boolean {
  if (!value || value.length < 2) return false
  const lower = value.toLowerCase().trim()
  const keywords = ["ok","active","hold","lock","transfer","delete","update","renew","prohibit",
    "pending","redemption","restore","client","server","registry","registrar","autorenew","inactive"]
  return keywords.some(k => lower.includes(k))
}

function punycodeToUnicode(domain: string): string {
  try {
    return new URL(`http://${domain}`).hostname
  } catch {
    return domain
  }
}

export function parseWhoisResponse(response: string, domain: string): Partial<WhoisResult> {
  const lines = response.split("\n")
  const result: Partial<WhoisResult> = { nameservers: [], statuses: [] }
  const extractValue = (l: string) => l.includes(":") ? l.split(":").slice(1).join(":").trim() : l.trim()
  const isEmpty = (v: string) => !v || ["—","-","N/A","n/a",""].includes(v)
  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const datePatterns = {
    created: [
      /^(created?|creation|registered|registration|regdate|createdate|creationdate|registereddate|domaincreat|créé|création|dataregistro|datumregistrierung|登録日|등록일|датарегистрации|注册时间|创建时间|注册日期|registeredon|creationtime)/i,
      /reg(?:ister)?date|registrationtime|domainregistrationdate/
    ],
    updated: [
      /^(updated?|lastupdate|lastmodified|lastchanged|modified|changed|lastchange|changeddate|modifieddate|lastupdated|updatedate|recordlastupdate|lastmodification|dernièremodification|últimamodificación|letzteänderung|更新时间|最后更新|修改时间|最后修改|датаизменения|날짜업데이트|更新日時)/i,
      /lastupdatedate|updatetime|modificationdate|recordmodified/
    ],
    expires: [
      /^expir/i,
      /renewal|paidtill|expirationdate|expiredate|expire|registryexpiry|registrarexpiry|expirydate|domainexpir|dated'expiration|fechadeexpiración|ablaufdatum|datadeexpiração|registryfeedueon|validuntil|registereduntilcancelled|过期时间|到期时间|到期日期|датаистечения|만료일|満期日|期限日/
    ]
  }

  const potentialUpdates: string[] = []
  let section: "registrant"|"admin"|"tech"|null = null
  let multiLineKey = ""
  let multiLineValue = ""

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const originalLine = line
    line = line.trim()
    if (!line || line.startsWith("%") || line.startsWith("#") || line.startsWith(";") || line.startsWith("=")) continue

    // Handle multi-line continuation
    if (line.startsWith(" ") && multiLineKey) {
      multiLineValue += " " + line.trim()
      continue
    } else if (multiLineKey) {
      // Process previous multi-line
      const value = multiLineValue
      if (!isEmpty(value)) {
        if (multiLineKey === "nameserver") {
          value.split(/[\n,]/).map(s => s.trim()).filter(Boolean).forEach(ns => {
            const host = ns.split(/[\s(]/)[0].toLowerCase()
            if (isValidNameserver(host) && !result.nameservers!.includes(host)) result.nameservers!.push(host)
          })
        } else if (multiLineKey === "status") {
          value.split(/[\n,;]/).map(s => s.trim()).filter(s => s && !/prohibited/i.test(s.toLowerCase())).forEach(s => {
            if (isValidStatus(s) && !result.statuses!.includes(s.toLowerCase())) result.statuses!.push(s.toLowerCase())
          })
        }
      }
      multiLineKey = ""
      multiLineValue = ""
    }

    // Section detection
    const sec = line.match(/^\[(ADMIN_C|ADMIN|HOLDER|REGISTRANT|TECH_C|TECH|BILLING)\]/i)
    if (sec) {
      section = sec[1].toLowerCase().includes("admin") ? "admin" :
                sec[1].toLowerCase().includes("holder") || sec[1].toLowerCase().includes("registrant") ? "registrant" :
                sec[1].toLowerCase().includes("tech") ? "tech" : null
      continue
    }
    if (!line.includes(":")) section = null

    const normalized = normalizeFieldName(originalLine)
    const value = extractValue(originalLine)

    if (isEmpty(value)) continue

    // Registrar
    if (/registrar|sponsoringregistrar|bureaud'enregistrement|registrarname|registrarorganization|domainregistrar|注册商/i.test(normalized)) {
      if (!result.registrar && !/phone|email|country|url|abuse|iana/i.test(normalized)) {
        result.registrar = value.replace(/\s*\(https?:\/\/[^\)]+\)/g, "").replace(/\s*\[.*\]/g, "").trim()
      }
    }

    // Dates
    if (datePatterns.created.some(p => p.test(normalized)) && !/expir/i.test(normalized)) {
      if (!result.createdAt) {
        const d = parseDate(value)
        if (d) result.createdAt = d
      }
    }
    if (datePatterns.updated.some(p => p.test(normalized))) {
      const d = parseDate(value)
      if (d) potentialUpdates.push(d)
    }
    if (datePatterns.expires.some(p => p.test(normalized))) {
      if (!result.expiresAt) {
        const d = parseDate(value)
        if (d) result.expiresAt = d
      }
    }

    // Nameservers (multi-line)
    if (/nameserver|nserver|ns\d*|ns[a-z]*host|serveurdenoms|servidordenombres|dns(?!sec)|域名服务器/i.test(normalized)) {
      multiLineKey = "nameserver"
      multiLineValue = value
      continue
    }

    // Status (multi-line)
    if (/status|statut|estado|domainstatus|状态/i.test(normalized)) {
      multiLineKey = "status"
      multiLineValue = value
      continue
    }

    // Contacts
    const contactMap = [
      { key: "registrant", patterns: [/^registrant|^holder|^titulaire|^titular|^inhaber|^注册人/i] },
      { key: "admin", patterns: [/^admin|^administrateur|^administrador|^管理联系人/i] },
      { key: "tech", patterns: [/^tech|^technique|^técnico|^技术联系人/i] }
    ]

    if (section) {
      if (/name|nom|nombre|person|姓名/i.test(normalized) && !/domain|org/i.test(normalized)) {
        const k = `${section}Name` as const
        if (!result[k] && !isEmail(value)) result[k] = value
      }
      if (/email|courriel|correo|电子邮箱/i.test(normalized)) {
        const k = `${section}Email` as const
        if (!result[k] && isEmail(value)) result[k] = value
      }
      if (/org|organization|organisation|organización|组织机构/i.test(normalized)) {
        const k = `${section}Org` as const
        if (!result[k]) result[k] = value
      }
    } else {
      for (const type of contactMap) {
        if (type.patterns.some(p => p.test(normalized))) {
          const next = i + 1 < lines.length ? lines[i + 1].trim() : ""
          if ((/name|nom|nombre|person|姓名/i.test(normalized) || !next.includes(":")) && !/org|domain/i.test(normalized)) {
            const k = `${type.key}Name` as const
            if (!result[k] && !isEmail(value)) result[k] = value
          }
          if (/email|courriel|correo|电子邮箱/i.test(normalized)) {
            const k = `${type.key}Email` as const
            if (!result[k] && isEmail(value)) result[k] = value
          }
          if (/org|organization|organisation|organización|组织机构/i.test(normalized)) {
            const k = `${type.key}Org` as const
            if (!result[k]) result[k] = value
          }
        }
      }
    }
  }

  // Process final multi-line
  if (multiLineKey && !isEmpty(multiLineValue)) {
    if (multiLineKey === "nameserver") {
      multiLineValue.split(/[\n,]/).map(s => s.trim()).filter(Boolean).forEach(ns => {
        const host = ns.split(/[\s(]/)[0].toLowerCase()
        if (isValidNameserver(host) && !result.nameservers!.includes(host)) result.nameservers!.push(host)
      })
    } else if (multiLineKey === "status") {
      multiLineValue.split(/[\n,;]/).map(s => s.trim()).filter(s => s && !/prohibited/i.test(s.toLowerCase())).forEach(s => {
        if (isValidStatus(s) && !result.statuses!.includes(s.toLowerCase())) result.statuses!.push(s.toLowerCase())
      })
    }
  }

  if (potentialUpdates.length) result.updatedAt = potentialUpdates.sort().reverse()[0]
  return result
}

function validateWhoisDomain(response: string, queriedDomain: string): boolean {
  const unicode = punycodeToUnicode(queriedDomain)
  const puny = queriedDomain.toLowerCase()
  const lowerResp = response.toLowerCase()
  return lowerResp.includes(unicode.toLowerCase()) || lowerResp.includes(puny) || /domain\s*name?\s*:\s*[^\s]+/i.test(response)
}

export async function whoisLookup(domain: string): Promise<WhoisResult> {
  // Convert IDN to Punycode for WHOIS server lookup
  let lookupDomain = domain
  try {
    const url = new URL(`http://${domain}`)
    lookupDomain = url.hostname
  } catch {}
  
  const servers = getWhoisServers(lookupDomain)
  if (!servers.length) throw new WhoisError(`No WHOIS server for ${domain}`)

  let lastError: WhoisError | null = null
  for (let i = 0; i < servers.length; i++) {
    const server = servers[i]
    try {
      const res = await fetch("/api/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: lookupDomain, server })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        lastError = new WhoisError(err.error || res.statusText, res.status, server)
        continue
      }
      const data = await res.json()
      if (!data.raw) {
        lastError = new WhoisError("Empty response", undefined, server)
        continue
      }
      if (!validateWhoisDomain(data.raw, domain)) continue

      const parsed = parseWhoisResponse(data.raw, domain)
      return {
        domain, raw: data.raw, server, source: "whois",
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
        techOrg: parsed.techOrg
      }
    } catch (e: any) {
      lastError = e instanceof WhoisError ? e : new WhoisError(e.message || "Unknown", undefined, server)
    }
  }
  throw new WhoisError(`WHOIS failed: ${lastError?.message || "All servers failed"}`)
}
