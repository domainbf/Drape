import { NextResponse } from "next/server"
import { getWhoisServers } from "@/lib/whois-servers"

export const runtime = "nodejs"

const WHOIS_PORT = 43
const CONNECT_TIMEOUT = 5000
const TOTAL_TIMEOUT = 15000
const MAX_RETRIES = 1

async function queryWhoisViaHttp(domain: string): Promise<string> {
  try {
    const response = await fetch(`https://whois.domains/api/domain/info?domain=${encodeURIComponent(domain)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`HTTP WHOIS returned ${response.status}`)
    }

    const data = await response.json()
    if (data.whois) {
      console.log(`[v0] WHOIS HTTP: Successfully retrieved data for ${domain}`)
      return data.whois
    }

    throw new Error("No WHOIS data in response")
  } catch (err: any) {
    console.warn(`[v0] WHOIS HTTP: Failed for ${domain}: ${err.message}`)
    throw err
  }
}

async function queryWhoisServerDirect(server: string, domain: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { Socket } = require("net")
    const socket = new Socket()
    let response = ""
    let completed = false

    const timeoutId = setTimeout(() => {
      if (!completed) {
        completed = true
        socket.destroy()
        reject(new Error(`Connection timeout after ${TOTAL_TIMEOUT}ms to ${server}`))
      }
    }, TOTAL_TIMEOUT)

    socket.setTimeout(TOTAL_TIMEOUT)

    socket.on("connect", () => {
      console.log(`[v0] WHOIS: Connected to ${server}`)
      socket.write(`${domain}\r\n`)
    })

    socket.on("data", (chunk: Buffer) => {
      response += chunk.toString()
    })

    socket.on("end", () => {
      if (!completed) {
        completed = true
        clearTimeout(timeoutId)
        if (response && response.length > 0) {
          console.log(`[v0] WHOIS: Received ${response.length} bytes from ${server}`)
          resolve(response)
        } else {
          reject(new Error("Empty response from WHOIS server"))
        }
      }
    })

    socket.on("error", (err: any) => {
      if (!completed) {
        completed = true
        clearTimeout(timeoutId)
        console.error(`[v0] WHOIS: Socket error from ${server}: ${err.message}`)
        reject(err)
      }
    })

    socket.on("timeout", () => {
      if (!completed) {
        completed = true
        socket.destroy()
        reject(new Error(`Socket timeout after ${TOTAL_TIMEOUT}ms`))
      }
    })

    console.log(`[v0] WHOIS: Attempting to connect to ${server}:${WHOIS_PORT}`)
    socket.connect(WHOIS_PORT, server)
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { domain, server } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'domain' parameter" }, { status: 400 })
    }

    if (!server || typeof server !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'server' parameter" }, { status: 400 })
    }

    if (!getWhoisServers(domain).includes(server)) {
      console.warn(`[v0] WHOIS API: Server ${server} not authorized for domain ${domain}`)
      return NextResponse.json({ error: "WHOIS server not authorized for this domain" }, { status: 400 })
    }

    console.log(`[v0] WHOIS API: Querying ${domain} from ${server}`)

    let raw = ""
    let lastError: Error | null = null

    // Try direct socket connection first
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        raw = await queryWhoisServerDirect(server, domain)

        if (raw && raw.length > 0) {
          console.log(`[v0] WHOIS API: Success on attempt ${attempt + 1} for ${domain} from ${server}`)
          break
        } else {
          throw new Error("Empty response from WHOIS server")
        }
      } catch (err: any) {
        lastError = err
        const delay = attempt < MAX_RETRIES ? Math.pow(2, attempt) * 300 : 0
        console.warn(`[v0] WHOIS API: Socket attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for ${server}: ${err.message}`)

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // If socket connection failed, try HTTP fallback
    if (!raw || raw.length === 0) {
      try {
        console.log(`[v0] WHOIS API: Socket failed, attempting HTTP fallback for ${domain}`)
        raw = await queryWhoisViaHttp(domain)
      } catch (err: any) {
        lastError = err
        console.warn(`[v0] WHOIS API: HTTP fallback also failed: ${err.message}`)
      }
    }

    if (!raw || raw.length === 0) {
      const errorMsg = lastError?.message || "WHOIS server returned empty response"
      console.error(`[v0] WHOIS API: All attempts failed for ${domain}: ${errorMsg}`)
      return NextResponse.json({ error: `WHOIS query failed: ${errorMsg}` }, { status: 503 })
    }

    console.log(`[v0] WHOIS API: Response length ${raw.length} bytes for ${domain}`)

    return NextResponse.json(
      {
        domain,
        server,
        raw,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      },
    )
  } catch (err: any) {
    console.error("[v0] WHOIS API Error:", err?.message || err)
    return NextResponse.json({ error: err?.message || "WHOIS query failed" }, { status: 500 })
  }
}
