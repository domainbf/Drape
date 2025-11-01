# Implementation Notes - RDAP with WHOIS Fallback

## Overview

This document provides technical details about the RDAP domain lookup system with WHOIS fallback implementation.

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ app/page.tsx - Main Page                             │   │
│  │ ├─ DomainForm - Input & Validation                   │   │
│  │ ├─ QueryInfo - Status & Source Display               │   │
│  │ ├─ ResultCard - Results Display                      │   │
│  │ └─ RecentLookups - Search History                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ hooks/use-rdap.ts - Data Fetching Hook               │   │
│  │ ├─ Try RDAP First                                    │   │
│  │ └─ Fallback to WHOIS on Failure                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Next.js)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/rdap - RDAP Proxy                               │   │
│  │ └─ Forwards to RDAP.org                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/whois - WHOIS Proxy                             │   │
│  │ ├─ Queries WHOIS Servers (Port 43)                   │   │
│  │ └─ Fallback to Public WHOIS APIs                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ├─ RDAP.org - RDAP Protocol Service                        │
│  ├─ WHOIS Servers - Port 43 (via backend)                   │
│  └─ Public WHOIS APIs - Fallback Service                    │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Data Flow

### Successful RDAP Query
\`\`\`
User Input
    ↓
Normalize Domain
    ↓
Try RDAP Query
    ↓ (Success)
Parse RDAP Response
    ↓
Display Results (RDAP Badge)
\`\`\`

### RDAP Failure → WHOIS Fallback
\`\`\`
User Input
    ↓
Normalize Domain
    ↓
Try RDAP Query
    ↓ (Failure: 404, 400, Timeout, Network Error)
Try WHOIS Query
    ↓ (Success)
Parse WHOIS Response
    ↓
Normalize to RDAP Format
    ↓
Display Results (WHOIS Badge)
\`\`\`

## Key Components

### 1. WHOIS Server Database (`lib/whois-servers.ts`)

**Purpose**: Maps TLDs to authoritative WHOIS servers

**Data Structure**:
\`\`\`typescript
export const WHOIS_SERVERS: Record<string, string> = {
  "com": "whois.verisign-grs.com",
  "org": "whois.pir.org",
  // ... 100+ entries
}
\`\`\`

**Functions**:
- `getWhoisServer(domain)` - Get WHOIS server for domain
- `isWhoisSupported(domain)` - Check if WHOIS is available

### 2. WHOIS Client (`lib/whois.ts`)

**Purpose**: Handles WHOIS queries and response parsing

**Key Functions**:
- `whoisLookup(domain)` - Main WHOIS query function
- `parseWhoisResponse(response)` - Extract data from WHOIS response

**Error Handling**:
- `WhoisError` - Generic WHOIS error
- `WhoisTimeoutError` - Query timeout
- `WhoisNetworkError` - Network connectivity issue

**Parsing Logic**:
- Extracts registrar from "Registrar:" field
- Extracts dates from "Creation Date:", "Updated Date:", "Expiration Date:"
- Extracts nameservers from "Nameserver:" or "Nserver:" fields
- Extracts status from "Status:" field

### 3. RDAP Client Enhancement (`lib/rdap.ts`)

**Changes**:
- Added `source: "rdap" | "whois"` field to track data origin
- Added `normalizeWhoisResult()` function to convert WHOIS to RDAP format
- Maintains consistent data structure regardless of source

**Normalization**:
\`\`\`typescript
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
    contacts: {},
    raw: { whoisRaw: whoisData.raw },
    source: "whois",
  }
}
\`\`\`

### 4. RDAP Hook Enhancement (`hooks/use-rdap.ts`)

**Changes**:
- Implements RDAP-first strategy with WHOIS fallback
- Tracks data source for UI display
- Maintains error handling for both protocols

**Logic**:
\`\`\`typescript
try {
  // Try RDAP first
  return await rdapLookup(domainAscii)
} catch (rdapErr) {
  try {
    // Fallback to WHOIS
    const whoisData = await whoisLookup(domainAscii)
    return normalizeWhoisResult(whoisData)
  } catch (whoisErr) {
    // Both failed, throw original RDAP error
    throw rdapErr
  }
}
\`\`\`

### 5. WHOIS API Route (`app/api/whois/route.ts`)

**Purpose**: Backend proxy for WHOIS queries

**Strategies**:
1. Direct WHOIS (fails in edge runtime)
2. Public WHOIS API fallback (works everywhere)

**Supported APIs**:
- WhoisXML API (primary)
- IANA WHOIS Query (fallback)

**Response Format**:
\`\`\`json
{
  "domain": "example.com",
  "server": "whois.verisign-grs.com",
  "raw": "Domain Name: EXAMPLE.COM\n...",
  "timestamp": "2024-01-01T00:00:00Z"
}
\`\`\`

## Error Handling Strategy

### RDAP Errors
| Error | Cause | Action |
|-------|-------|--------|
| 404 Not Found | Domain not in RDAP | Try WHOIS |
| 400 Bad Request | Invalid domain format | Try WHOIS |
| 429 Too Many Requests | Rate limited | Retry with backoff |
| 5xx Server Error | Server issue | Retry with backoff |
| Timeout | Slow server | Retry with backoff |
| Network Error | Connection issue | Try WHOIS |

### WHOIS Errors
| Error | Cause | Action |
|-------|-------|--------|
| No server found | Unsupported TLD | Return error |
| Timeout | Slow server | Return error |
| Network Error | Connection issue | Try next API |
| API Error | Service unavailable | Try next API |

## Performance Considerations

### Caching
- SWR caches results in browser
- Cache key: `rdap:{domain}`
- No automatic revalidation
- Manual refresh available

### Retry Logic
- RDAP: 3 attempts with exponential backoff
- Backoff: 400ms * 2^attempt + random jitter
- Max total time: ~8 seconds per attempt

### Timeouts
- RDAP: 8 seconds per attempt
- WHOIS: 10 seconds per attempt
- Total max: ~24 seconds for RDAP + 10 seconds for WHOIS

## Security Considerations

### Port 43 Handling
- No direct browser connections to port 43
- All WHOIS queries go through backend
- Backend can implement rate limiting
- Backend can log queries if needed

### Data Privacy
- WHOIS data is public information
- No personal data is stored
- Queries are not logged by default
- HTTPS encryption for all connections

### Input Validation
- Domain normalization in `lib/domain-utils.ts`
- Punycode conversion for IDN domains
- URL parameter validation
- No SQL injection or XSS risks

## Testing Recommendations

### Unit Tests
- Domain normalization
- WHOIS response parsing
- Error handling
- Data normalization

### Integration Tests
- RDAP queries
- WHOIS queries
- Fallback logic
- API endpoints

### E2E Tests
- Full user flow
- Error scenarios
- Fallback scenarios
- UI interactions

## Deployment Considerations

### Environment Variables
- No required environment variables
- Optional: API keys for WHOIS services
- Optional: Rate limiting configuration

### Scaling
- Stateless design (no server-side state)
- Can be deployed to serverless platforms
- Consider caching layer for high traffic
- Consider rate limiting for public API

### Monitoring
- Monitor RDAP service availability
- Monitor WHOIS service availability
- Track fallback rate
- Track error rates

## Future Improvements

### Short Term
1. Add more WHOIS servers to database
2. Improve WHOIS response parsing
3. Add caching layer (Redis)
4. Add rate limiting

### Medium Term
1. Direct WHOIS support for Node.js
2. Batch query support
3. Historical data tracking
4. Advanced filtering

### Long Term
1. Machine learning for data extraction
2. Real-time change notifications
3. Webhook support
4. GraphQL API

## References

- [RDAP RFC 7480](https://tools.ietf.org/html/rfc7480)
- [WHOIS RFC 3912](https://tools.ietf.org/html/rfc3912)
- [IANA Root Zone Database](https://www.iana.org/assignments/root-zone-db/)
- [ICANN WHOIS Servers](https://www.icann.org/resources/pages/whois-2013-05-03-en)
