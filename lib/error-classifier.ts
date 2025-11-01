export type ErrorType =
  | "unsupported_tld"
  | "invalid_domain"
  | "not_registered"
  | "timeout"
  | "rate_limit"
  | "network_error"
  | "unknown"

export type ErrorClassification = {
  type: ErrorType
  message: string
  suggestion?: string
}

/**
 * Classifies errors from RDAP and WHOIS lookups into user-friendly categories
 */
export function classifyDomainLookupError(
  domain: string,
  rdapError: Error | null,
  whoisError: Error | null,
  hasWhoisSupport: boolean,
): ErrorClassification {
  // Check for invalid domain format first
  if (!isValidDomainFormat(domain)) {
    return {
      type: "invalid_domain",
      message: "请输入正确的域名格式",
      suggestion: "域名格式应为：example.com 或 subdomain.example.com",
    }
  }

  // Check if TLD is unsupported (both RDAP and WHOIS failed, and no WHOIS support)
  if (!hasWhoisSupport && rdapError && whoisError) {
    const tld = extractTLD(domain)
    return {
      type: "unsupported_tld",
      message: `抱歉，暂时不支持 .${tld} 后缀的查询`,
      suggestion: "请尝试查询其他常见后缀的域名，如 .com、.net、.org 等",
    }
  }

  // Check for timeout errors
  if (isTimeoutError(rdapError) || isTimeoutError(whoisError)) {
    return {
      type: "timeout",
      message: "查询超时，请稍后重试",
      suggestion: "服务器响应时间过长，请检查网络连接或稍后再试",
    }
  }

  // Check for rate limiting
  if (isRateLimitError(rdapError) || isRateLimitError(whoisError)) {
    return {
      type: "rate_limit",
      message: "查询次数过多，请稍后再试",
      suggestion: "为了保护服务器资源，请等待几分钟后再进行查询",
    }
  }

  // Check for domain not found (404 or "not found" messages)
  if (isDomainNotFoundError(rdapError, whoisError)) {
    return {
      type: "not_registered",
      message: "该域名未注册",
      suggestion: "此域名可能尚未被注册，或已过期被删除",
    }
  }

  // Check for network errors
  if (isNetworkError(rdapError) || isNetworkError(whoisError)) {
    return {
      type: "network_error",
      message: "网络连接失败，请检查网络后重试",
      suggestion: "无法连接到查询服务器，请检查您的网络连接",
    }
  }

  // Generic error with more details
  return {
    type: "unknown",
    message: "查询失败，无法获取域名信息",
    suggestion: "该域名可能不存在、服务暂时不可用，或查询服务出现问题",
  }
}

function isValidDomainFormat(domain: string): boolean {
  // Basic domain validation
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i
  return domainRegex.test(domain) && domain.length <= 253
}

function extractTLD(domain: string): string {
  const parts = domain.toLowerCase().split(".")
  return parts[parts.length - 1] || ""
}

function isTimeoutError(error: Error | null): boolean {
  if (!error) return false
  const msg = error.message.toLowerCase()
  return (
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("time out") ||
    error.name === "TimeoutError" ||
    error.name === "RdapTimeoutError" ||
    error.name === "WhoisTimeoutError"
  )
}

function isRateLimitError(error: Error | null): boolean {
  if (!error) return false
  const msg = error.message.toLowerCase()
  return msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("429")
}

function isDomainNotFoundError(rdapError: Error | null, whoisError: Error | null): boolean {
  const checkError = (error: Error | null): boolean => {
    if (!error) return false
    const msg = error.message.toLowerCase()
    return (
      msg.includes("domain not found") ||
      msg.includes("not found") ||
      msg.includes("no match") ||
      msg.includes("404") ||
      msg.includes("no data") ||
      msg.includes("no entries found") ||
      msg.includes("object does not exist")
    )
  }

  return checkError(rdapError) || checkError(whoisError)
}

function isNetworkError(error: Error | null): boolean {
  if (!error) return false
  const msg = error.message.toLowerCase()
  return (
    msg.includes("network") ||
    msg.includes("fetch failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("connection") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound") ||
    error.name === "NetworkError" ||
    error.name === "RdapNetworkError" ||
    error.name === "WhoisNetworkError"
  )
}
