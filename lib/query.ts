export {
  rdapLookup,
  normalizeWhoisResult,
  mergeRdapAndWhois,
  RdapError,
  RdapTimeoutError,
  RdapNetworkError,
} from "./rdap"

export type { NormalizedRdap, NormalizedContact } from "./rdap"

export {
  whoisLookup,
  parseWhoisResponse,
  WhoisError,
  WhoisTimeoutError,
  WhoisNetworkError,
} from "./whois"

export type { WhoisResult } from "./whois"
