// ... existing code up to 'me' entry ...

const WHOIS_SERVERS = {
  // ... existing entries ...

  me: ["whois.nic.me", "whois.meregistry.net", "whois.iana.org"],
  
  bn: ["whois.bnnic.bn", "whois.bn", "whois.iana.org"],

  // ... existing entries ...
}

export function getWhoisServers(domain: string): string[] {
  const parts = domain.toLowerCase().split(".")
  if (parts.length < 2) return []

  const tld = parts[parts.length - 1]

  // Direct lookup for ASCII TLDs
  let servers = WHOIS_SERVERS[tld as keyof typeof WHOIS_SERVERS]
  if (servers && servers.length > 0) {
    return servers
  }

  // For punycode TLDs (xn--*), try direct lookup
  if (tld.startsWith("xn--")) {
    servers = WHOIS_SERVERS[tld as keyof typeof WHOIS_SERVERS]
    if (servers && servers.length > 0) {
      return servers
    }
  }

  return []
}

export function isWhoisSupported(domain: string): boolean {
  return getWhoisServers(domain).length > 0
}
