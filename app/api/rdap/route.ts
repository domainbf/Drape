import { NextResponse } from "next/server"
import { getRdapUrl, getRdapServers, isRdapSupported } from "@/lib/rdap-servers"
import { getWhoisServers } from "@/lib/whois-servers"

const RDAP_TIMEOUT = 15000

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get("domain")?.trim()

  if (!domain) {
    return NextResponse.json({ error: "Missing 'domain' query parameter." }, { status: 400 })
  }

  if (!/^[a-z0-9.-]+$/i.test(domain)) {
    return NextResponse.json({ error: "Invalid domain format." }, { status: 400 })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), RDAP_TIMEOUT)

  try {
    console.log(`[v0] RDAP API: Querying ${domain}`)

    const isSupported = isRdapSupported(domain)
    console.log(`[v0] RDAP API: RDAP support for ${domain}: ${isSupported}`)

    const rdapServers = getRdapServers(domain)
    const rdapUrl = getRdapUrl(domain)

    console.log(`[v0] RDAP API: Primary RDAP URL: ${rdapUrl}`)
    if (rdapServers.length > 0) {
      console.log(`[v0] RDAP API: Found ${rdapServers.length} RDAP server(s) for TLD`)
    }

    const rdapSources = rdapServers.map((url, idx) => ({ 
      name: idx === 0 ? "primary" : `fallback-${idx}`, 
      url: url.endsWith("/") ? url : `${url}/` 
    }))

    let lastError: any
    let rdapSuccess = false

    for (const source of rdapSources) {
      if (!source.url || source.url.includes("rdap.org")) {
        console.log(`[v0] RDAP API: Skipping invalid or rdap.org fallback for ${domain}`)
        continue
      }

      try {
        console.log(`[v0] RDAP API: Trying ${source.name} for ${domain}`)

        const upstreamUrl = `${source.url}domain/${encodeURIComponent(domain)}`
        
        const upstream = await fetch(upstreamUrl, {
          method: "GET",
          headers: {
            accept: "application/rdap+json, application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RDAP-Domain-Lookup/1.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        })

        if (!upstream.ok) {
          console.warn(`[v0] RDAP API: ${source.name} returned ${upstream.status} for ${domain}`)

          if (upstream.status === 404) {
            continue
          }
          if (upstream.status === 429) {
            return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
          }
          if (upstream.status === 501) {
            console.warn(`[v0] RDAP API: ${source.name} does not implement RDAP for ${domain}`)
            continue
          }
          if (upstream.status >= 500) {
            const responseText = await upstream.text().catch(() => "")
            console.warn(`[v0] RDAP API: ${source.name} server error (${upstream.status}): ${responseText.substring(0, 200)}`)
            continue
          }
        }

        const text = await upstream.text()

        let jsonData: any
        try {
          jsonData = JSON.parse(text)
        } catch (parseErr) {
          console.warn(`[v0] RDAP API: Failed to parse JSON from ${source.name}, response preview: ${text.substring(0, 100)}`)
          lastError = parseErr
          continue
        }

        if (!jsonData || typeof jsonData !== "object") {
          console.warn(`[v0] RDAP API: Invalid response format from ${source.name}`)
          lastError = new Error("Invalid RDAP response format")
          continue
        }

        if (!jsonData.ldhName && !jsonData.unicodeName && !jsonData.handle) {
          console.warn(`[v0] RDAP API: Response lacks domain identifiers from ${source.name}`)
          lastError = new Error("RDAP response missing domain identifiers")
          continue
        }

        console.log(`[v0] RDAP API: Success via ${source.name} for ${domain}`)
        rdapSuccess = true

        const contentType = upstream.headers.get("content-type") || "application/json; charset=utf-8"

        return new NextResponse(JSON.stringify(jsonData), {
          status: 200,
          headers: {
            "content-type": contentType,
            "cache-control": "public, max-age=300",
          },
        })
      } catch (err: any) {
        console.warn(`[v0] RDAP API: ${source.name} failed: ${err.message}`)
        lastError = err
        continue
      }
    }

    const whoisServers = getWhoisServers(domain)
    const hasWhoisSupport = whoisServers.length > 0

    console.log(`[v0] RDAP API: RDAP not available for ${domain}, WHOIS support: ${hasWhoisSupport}`)

    return NextResponse.json(
      {
        error: "Domain not found in RDAP registry.",
        whoisAvailable: hasWhoisSupport,
        rdapError: lastError?.message,
      },
      { status: hasWhoisSupport ? 404 : 502 },
    )
  } catch (err: any) {
    console.error(`[v0] RDAP API Error for ${domain}:`, err?.message || err)

    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "RDAP request timeout. The server took too long to respond." }, { status: 504 })
    }

    if (err?.message?.includes("fetch failed") || err?.message?.includes("network")) {
      return NextResponse.json({ error: "Network error connecting to RDAP service." }, { status: 502 })
    }

    return NextResponse.json({ error: "Failed to retrieve RDAP data." }, { status: 502 })
  } finally {
    clearTimeout(timeoutId)
  }
}
