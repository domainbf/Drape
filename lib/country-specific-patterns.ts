/**
 * Country-specific WHOIS parsing patterns
 * Handles unique formats from different registry operators
 */

export const COUNTRY_SPECIFIC_PATTERNS = {
  // China (.cn, .中国, .公司, .网络)
  CN: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /注册商\s*：\s*(.+?)(?:\n|$)/,
      /sponsor\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /registration time\s*:\s*(.+?)(?:\n|$)/i,
      /注册时间\s*：\s*(.+?)(?:\n|$)/,
      /created date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /updated date\s*:\s*(.+?)(?:\n|$)/i,
      /updated time\s*:\s*(.+?)(?:\n|$)/i,
      /更新时间\s*：\s*(.+?)(?:\n|$)/,
    ],
    expires: [
      /expiration time\s*:\s*(.+?)(?:\n|$)/i,
      /过期时间\s*：\s*(.+?)(?:\n|$)/,
      /expiry date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    status: [
      /status\s*:\s*(.+?)(?:\n|$)/i,
      /domain status\s*:\s*(.+?)(?:\n|$)/i,
      /状态\s*：\s*(.+?)(?:\n|$)/,
    ],
    nameserver: [
      /name server\s*:\s*(.+?)(?:\n|$)/i,
      /nameserver\s*:\s*(.+?)(?:\n|$)/i,
      /dns\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // Russia (.ru, .рф)
  RU: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /регистратор\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /created\s*:\s*(.+?)(?:\n|$)/i,
      /создан\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /changed\s*:\s*(.+?)(?:\n|$)/i,
      /изменен\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /paid till\s*:\s*(.+?)(?:\n|$)/i,
      /оплачен до\s*:\s*(.+?)(?:\n|$)/i,
    ],
    status: [
      /status\s*:\s*(.+?)(?:\n|$)/i,
      /статус\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // South Korea (.kr, .한국)
  KR: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /등록기관\s*:\s*(.+?)(?:\n|$)/,
    ],
    created: [
      /registered date\s*:\s*(.+?)(?:\n|$)/i,
      /등록일\s*:\s*(.+?)(?:\n|$)/,
    ],
    updated: [
      /last updated date\s*:\s*(.+?)(?:\n|$)/i,
      /최근수정일\s*:\s*(.+?)(?:\n|$)/,
    ],
    expires: [
      /expiration date\s*:\s*(.+?)(?:\n|$)/i,
      /만료일\s*:\s*(.+?)(?:\n|$)/,
    ],
  },

  // Japan (.jp, .日本)
  JP: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /名義人\s*:\s*(.+?)(?:\n|$)/,
    ],
    created: [
      /created on\s*:\s*(.+?)(?:\n|$)/i,
      /登録年月日\s*:\s*(.+?)(?:\n|$)/,
    ],
    updated: [
      /last modified on\s*:\s*(.+?)(?:\n|$)/i,
      /最終更新日時\s*:\s*(.+?)(?:\n|$)/,
    ],
    expires: [
      /expiration date\s*:\s*(.+?)(?:\n|$)/i,
      /有効期限\s*:\s*(.+?)(?:\n|$)/,
    ],
  },

  // Germany (.de)
  DE: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /registrierung\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /created\s*:\s*(.+?)(?:\n|$)/i,
      /erstellungsdatum\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /changed\s*:\s*(.+?)(?:\n|$)/i,
      /änderungsdatum\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /expire date\s*:\s*(.+?)(?:\n|$)/i,
      /ablaufdatum\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // UK (.co.uk, .org.uk, etc.)
  UK: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /registrar name\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /registered on\s*:\s*(.+?)(?:\n|$)/i,
      /created on\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /last updated\s*:\s*(.+?)(?:\n|$)/i,
      /last modified\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /expiry date\s*:\s*(.+?)(?:\n|$)/i,
      /expiration date\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // Brazil (.br)
  BR: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /registrador\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /created\s*:\s*(.+?)(?:\n|$)/i,
      /data de criação\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /last modified\s*:\s*(.+?)(?:\n|$)/i,
      /data de última modificação\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /expiration date\s*:\s*(.+?)(?:\n|$)/i,
      /data de expiração\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // Australia (.au, .com.au, etc.)
  AU: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /tech contact organisation\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /created\s*:\s*(.+?)(?:\n|$)/i,
      /created date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /last modified\s*:\s*(.+?)(?:\n|$)/i,
      /updated date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /expiry date\s*:\s*(.+?)(?:\n|$)/i,
      /renewal date\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // Mexico (.mx)
  MX: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /created by registrar\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /created\s*:\s*(.+?)(?:\n|$)/i,
      /creation date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /last modified\s*:\s*(.+?)(?:\n|$)/i,
      /modified by registrar\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /expiration date\s*:\s*(.+?)(?:\n|$)/i,
      /expire date\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // Canada (.ca)
  CA: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /sponsor\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /creation date\s*:\s*(.+?)(?:\n|$)/i,
      /created on\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /updated date\s*:\s*(.+?)(?:\n|$)/i,
      /last modified\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /expiry date\s*:\s*(.+?)(?:\n|$)/i,
      /expiration date\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // India (.in)
  IN: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /sponsoring registrar\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /created on\s*:\s*(.+?)(?:\n|$)/i,
      /registration date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /last updated on\s*:\s*(.+?)(?:\n|$)/i,
      /modified date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /expiry date\s*:\s*(.+?)(?:\n|$)/i,
      /status\s*expires\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },

  // New Zealand (.nz)
  NZ: {
    registrar: [
      /registrar\s*:\s*(.+?)(?:\n|$)/i,
      /registrar name\s*:\s*(.+?)(?:\n|$)/i,
    ],
    created: [
      /registered\s*:\s*(.+?)(?:\n|$)/i,
      /created date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    updated: [
      /last modified\s*:\s*(.+?)(?:\n|$)/i,
      /updated date\s*:\s*(.+?)(?:\n|$)/i,
    ],
    expires: [
      /registration expires\s*:\s*(.+?)(?:\n|$)/i,
      /expiration date\s*:\s*(.+?)(?:\n|$)/i,
    ],
  },
}

// Mapping of country codes to TLD prefixes
export const COUNTRY_TLD_MAP: Record<string, string[]> = {
  CN: ["cn", "中国", "公司", "网络"],
  RU: ["ru", "рф"],
  KR: ["kr", "한국"],
  JP: ["jp", "日本"],
  DE: ["de"],
  UK: ["uk", "co.uk", "org.uk"],
  BR: ["br"],
  AU: ["au", "com.au"],
  MX: ["mx"],
  CA: ["ca"],
  IN: ["in"],
  NZ: ["nz"],
}

export function detectCountry(domain: string): string | null {
  const parts = domain.split(".")
  if (parts.length === 0) return null

  const tld = parts[parts.length - 1]
  const secondLevelTld = parts.length > 1 ? `${parts[parts.length - 2]}.${tld}` : ""

  // Check second-level TLDs first (e.g., co.uk)
  if (secondLevelTld) {
    for (const [country, tlds] of Object.entries(COUNTRY_TLD_MAP)) {
      if (tlds.includes(secondLevelTld)) {
        return country
      }
    }
  }

  // Check TLD
  for (const [country, tlds] of Object.entries(COUNTRY_TLD_MAP)) {
    if (tlds.includes(tld)) {
      return country
    }
  }

  return null
}

export function getCountryPatterns(
  domain: string,
): Record<string, RegExp[]> | null {
  const country = detectCountry(domain)
  if (!country) return null
  return COUNTRY_SPECIFIC_PATTERNS[country as keyof typeof COUNTRY_SPECIFIC_PATTERNS] || null
}

/**
 * Enhanced pattern matching for country-specific WHOIS responses
 */
export function parseWithCountryPatterns(
  response: string,
  domain: string,
): Record<string, string | null> {
  const patterns = getCountryPatterns(domain)
  if (!patterns) return {}

  const result: Record<string, string | null> = {}

  // Try each field type
  for (const [fieldType, patternList] of Object.entries(patterns)) {
    if (!Array.isArray(patternList)) continue

    for (const pattern of patternList) {
      const match = response.match(pattern)
      if (match && match[1]) {
        result[fieldType] = match[1].trim()
        break // Found a match, move to next field type
      }
    }
  }

  return result
}
