# Setup Guide - RDAP Domain Lookup with WHOIS Fallback

## Quick Start

### 1. Installation

\`\`\`bash
# Clone or download the project
cd rdap-domain-lookup

# Install dependencies
npm install
# or
pnpm install
\`\`\`

### 2. Environment Setup

No additional environment variables are required for basic functionality. The application works out of the box with:
- RDAP queries via public RDAP.org service
- WHOIS queries via public WHOIS APIs

### 3. Run Development Server

\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Overview

### RDAP-First Lookup
- Queries RDAP servers for structured domain data
- Supports all major TLDs
- Provides detailed registrant, admin, and tech contact information

### Automatic WHOIS Fallback
- When RDAP fails or returns no data, automatically queries WHOIS
- Supports 100+ TLDs with local server mappings
- Extracts key information from WHOIS responses

### Port 43 & CORS Solution
- Backend API proxy handles WHOIS queries
- No direct port 43 connections from browser
- Uses public WHOIS APIs as fallback
- Eliminates CORS restrictions

### Data Source Tracking
- UI clearly shows whether data came from RDAP or WHOIS
- Helps users understand data freshness and availability

## Architecture

### Frontend Components
- `app/page.tsx` - Main page with search form
- `components/domain-form.tsx` - Domain input and validation
- `components/result-card.tsx` - Results display with tabs
- `components/query-info.tsx` - Query status and source indicator
- `components/recent-lookups.tsx` - Recent search history

### Backend Services
- `app/api/rdap/route.ts` - RDAP proxy endpoint
- `app/api/whois/route.ts` - WHOIS proxy endpoint

### Libraries
- `lib/rdap.ts` - RDAP client with retry logic
- `lib/whois.ts` - WHOIS client with parsing
- `lib/whois-servers.ts` - WHOIS server database
- `lib/domain-utils.ts` - Domain normalization and punycode

### Hooks
- `hooks/use-rdap.ts` - React hook for domain lookups with fallback

## Configuration

### Adding New WHOIS Servers

Edit `lib/whois-servers.ts`:

\`\`\`typescript
export const WHOIS_SERVERS: Record<string, string> = {
  // ... existing entries ...
  "newtld": "whois.example.com",
}
\`\`\`

### Customizing Timeouts

Edit `lib/rdap.ts` and `lib/whois.ts`:

\`\`\`typescript
// RDAP timeout (default: 8000ms)
const timeoutMs = 8000

// WHOIS timeout (default: 10000ms)
const WHOIS_TIMEOUT = 10000
\`\`\`

### Customizing Retry Logic

Edit `lib/rdap.ts`:

\`\`\`typescript
async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  {
    attempts = 3,           // Number of retry attempts
    timeoutMs = 8000,       // Timeout per attempt
    jitterMs = 150,         // Random jitter
    backoffBaseMs = 400,    // Base backoff time
  }: FetchRetryOptions = {},
)
\`\`\`

## Deployment

### Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Self-Hosted

\`\`\`bash
# Build
npm run build

# Start
npm start
\`\`\`

## Performance Optimization

### Caching
- Results are cached in browser via SWR
- No repeated queries for same domain in session
- Cache is cleared on page refresh

### Lazy Loading
- Components load on demand
- Punycode library loaded dynamically
- Minimal initial bundle size

### API Optimization
- RDAP queries use direct CORS when possible
- WHOIS queries use backend proxy
- Automatic retry with exponential backoff

## Troubleshooting

### RDAP Queries Failing
1. Check internet connection
2. Verify domain is valid
3. Try a different domain
4. Check RDAP.org status

### WHOIS Queries Failing
1. Verify TLD is in supported list
2. Check if domain exists
3. Try again (server might be temporarily down)
4. Check firewall/proxy settings

### Port 43 Connection Issues
- The application uses backend proxy, not direct port 43
- If WHOIS API fails, check internet connection
- Verify firewall allows outbound HTTPS

### Punycode Conversion Issues
- Ensure domain contains valid Unicode characters
- Check browser console for errors
- Try ASCII domain as fallback

## API Endpoints

### RDAP Endpoint
\`\`\`
GET /api/rdap?domain=example.com
\`\`\`

Response:
\`\`\`json
{
  "ldhName": "example.com",
  "status": ["active"],
  "registrarName": "Example Registrar",
  "nameservers": [...],
  "entities": [...],
  ...
}
\`\`\`

### WHOIS Endpoint
\`\`\`
POST /api/whois
Content-Type: application/json

{
  "domain": "example.com",
  "server": "whois.verisign-grs.com"
}
\`\`\`

Response:
\`\`\`json
{
  "domain": "example.com",
  "server": "whois.verisign-grs.com",
  "raw": "Domain Name: EXAMPLE.COM\n...",
  "timestamp": "2024-01-01T00:00:00Z"
}
\`\`\`

## Security Considerations

1. **No Direct Port 43**: All WHOIS queries go through backend
2. **Public Data Only**: WHOIS data is publicly available
3. **No Logging**: Queries are not logged or tracked
4. **HTTPS Only**: All connections are encrypted
5. **Rate Limiting**: Consider adding rate limiting for production

## Future Enhancements

1. **Direct WHOIS Support**: Node.js-based direct WHOIS for self-hosted
2. **Redis Caching**: Cache frequently queried domains
3. **Batch Queries**: Support multiple domain lookups
4. **Export Options**: CSV/JSON export
5. **Historical Data**: Track domain changes
6. **Advanced Filtering**: Filter by registrar, status, etc.
7. **API Key Support**: Authenticated API access
8. **Webhook Support**: Real-time domain change notifications

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the WHOIS_FALLBACK_README.md
3. Check browser console for errors
4. Verify domain is valid and exists

## License

MIT License - Feel free to use and modify as needed.
