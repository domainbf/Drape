/**
 * Comprehensive date parser that handles:
 * - ISO 8601 formats
 * - English month names (January, Jan, etc.)
 * - French month names (janvier, janv, etc.)
 * - Spanish month names (enero, ene, etc.)
 * - German month names (Januar, Jan, etc.)
 * - Various date formats from different WHOIS servers
 */

const MONTH_NAMES: Record<string, number> = {
  // English
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,

  // French
  janvier: 1,
  janv: 1,
  février: 2,
  fevrier: 2,
  fév: 2,
  fev: 2,
  mars: 3,
  avril: 4,
  avr: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  juil: 7,
  août: 8,
  aout: 8,
  septembre: 9,
  sept: 9,
  octobre: 10,
  novembre: 11,
  décembre: 12,
  decembre: 12,
  déc: 12,
  dec: 12,

  // Spanish
  enero: 1,
  ene: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  abr: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  ago: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
  dic: 12,

  // German
  januar: 1,
  jän: 1,
  jaen: 1,
  februar: 2,
  märz: 3,
  maerz: 3,
  mär: 3,
  maer: 3,
  juni: 6,
  juli: 7,
  oktober: 10,
  okt: 10,
  dezember: 12,
  dez: 12,

  // Portuguese
  janeiro: 1,
  fevereiro: 2,
  março: 3,
  marco: 3,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  set: 9,
  outubro: 10,
  out: 10,
  novembro: 11,
  dezembro: 12,
  dez: 12,
}

export function parseDate(dateString: string): string | undefined {
  if (!dateString || typeof dateString !== "string") return undefined

  const cleaned = dateString.trim()
  if (!cleaned) return undefined

  const isoWithMicroseconds = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d+)Z?$/)
  if (isoWithMicroseconds) {
    const [, year, month, day, hour, minute, second] = isoWithMicroseconds
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`)
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  // Try ISO 8601 format first (most common in RDAP)
  const isoMatch = cleaned.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:Z|([+-]\d{2}:\d{2}))?)?/,
  )
  if (isoMatch) {
    const [, year, month, day, hour, minute, second] = isoMatch
    const date = new Date(`${year}-${month}-${day}T${hour || "00"}:${minute || "00"}:${second || "00"}Z`)
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const chineseDateFormat = cleaned.match(/(\d{4})年(\d{1,2})月(\d{1,2})日(?:\s*(\d{2}):(\d{2}):(\d{2}))?/)
  if (chineseDateFormat) {
    const [, year, month, day, hour, minute, second] = chineseDateFormat
    const date = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
      Number.parseInt(hour || "0"),
      Number.parseInt(minute || "0"),
      Number.parseInt(second || "0"),
    )
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const yyyyMmDdHhMmSs = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/)
  if (yyyyMmDdHhMmSs) {
    const [, year, month, day, hour, minute, second] = yyyyMmDdHhMmSs
    const date = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
      Number.parseInt(hour),
      Number.parseInt(minute),
      Number.parseInt(second),
    )
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const cnTFormat = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:Z)?$/)
  if (cnTFormat) {
    const [, year, month, day, hour, minute, second] = cnTFormat
    const date = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
      Number.parseInt(hour),
      Number.parseInt(minute),
      Number.parseInt(second),
    )
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const ddMonYyyyHhMmSs = cleaned.match(/^(\d{1,2})-([a-zéèêàâôûç]+)-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/i)
  if (ddMonYyyyHhMmSs) {
    const [, day, monthName, year, hour, minute, second] = ddMonYyyyHhMmSs
    const month = MONTH_NAMES[monthName.toLowerCase()]
    if (month) {
      const date = new Date(
        Number.parseInt(year),
        month - 1,
        Number.parseInt(day),
        Number.parseInt(hour),
        Number.parseInt(minute),
        Number.parseInt(second),
      )
      if (!isNaN(date.getTime())) {
        return formatDate(date)
      }
    }
  }

  const ddMmmYyyy = cleaned.match(/^(\d{1,2})[-/\s]([a-zéèêàâôûç]+)[-/\s](\d{4})/i)
  if (ddMmmYyyy) {
    const [, day, monthName, year] = ddMmmYyyy
    const month = MONTH_NAMES[monthName.toLowerCase()]
    if (month) {
      const date = new Date(Number.parseInt(year), month - 1, Number.parseInt(day))
      if (!isNaN(date.getTime())) {
        return formatDate(date)
      }
    }
  }

  const mmmDdYyyy = cleaned.match(/^([a-zéèêàâôûç]+)[\s,]+(\d{1,2})[\s,]+(\d{4})/i)
  if (mmmDdYyyy) {
    const [, monthName, day, year] = mmmDdYyyy
    const month = MONTH_NAMES[monthName.toLowerCase()]
    if (month) {
      const date = new Date(Number.parseInt(year), month - 1, Number.parseInt(day))
      if (!isNaN(date.getTime())) {
        return formatDate(date)
      }
    }
  }

  const ddMmYyyyHhMmSs = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/)
  if (ddMmYyyyHhMmSs) {
    const [, day, month, year, hour, minute, second] = ddMmYyyyHhMmSs
    const date = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
      Number.parseInt(hour),
      Number.parseInt(minute),
      Number.parseInt(second),
    )
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const ddMmYyyy = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (ddMmYyyy) {
    const [, day, month, year] = ddMmYyyy
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const yyyyMmDdHhMmSsAlt = cleaned.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})/)
  if (yyyyMmDdHhMmSsAlt) {
    const [, year, month, day, hour, minute, second] = yyyyMmDdHhMmSsAlt
    const date = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
      Number.parseInt(hour),
      Number.parseInt(minute),
      Number.parseInt(second),
    )
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const yyyyMmDd = cleaned.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/)
  if (yyyyMmDd) {
    const [, year, month, day] = yyyyMmDd
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const yyyymmddhhmmss = cleaned.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/)
  if (yyyymmddhhmmss) {
    const [, year, month, day, hour, minute, second] = yyyymmddhhmmss
    const date = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
      Number.parseInt(hour),
      Number.parseInt(minute),
      Number.parseInt(second),
    )
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const yyyymmdd = cleaned.match(/^(\d{4})(\d{2})(\d{2})/)
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  const slashFormat = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashFormat) {
    const [, first, second, year] = slashFormat
    // Try DD/MM/YYYY first (more common internationally)
    let date = new Date(Number.parseInt(year), Number.parseInt(second) - 1, Number.parseInt(first))
    if (!isNaN(date.getTime()) && date.getDate() === Number.parseInt(first)) {
      return formatDate(date)
    }
    // Try MM/DD/YYYY
    date = new Date(Number.parseInt(year), Number.parseInt(first) - 1, Number.parseInt(second))
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
  }

  // Try parsing with Date constructor as last resort
  try {
    const date = new Date(cleaned)
    if (!isNaN(date.getTime()) && date.getFullYear() > 1990 && date.getFullYear() < 2100) {
      return formatDate(date)
    }
  } catch (e) {
    // Ignore parsing errors
  }

  // If all parsing fails, return undefined
  return undefined
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return "—"

  const parsed = parseDate(dateString)
  if (!parsed) return dateString // Return original if parsing fails

  // Return full date-time (YYYY-MM-DD HH:MM:SS)
  return parsed
}
