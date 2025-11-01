import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain")

  if (!domain) {
    return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 })
  }

  try {
    // Call the Tian.hu API to get domain pricing information
    const apiUrl = `https://api.tian.hu/whois.php?domain=${encodeURIComponent(domain)}&action=checkPrice`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch pricing: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Parse the response and extract pricing information
    const priceInfo = {
      domain,
      registrationPrice: data.register_price || null,
      renewalPrice: data.renew_price || null,
      transferPrice: data.transfer_price || null,
      isPremium: data.is_premium === true || data.is_premium === "1",
      currency: "CNY",
      source: "tian.hu",
    }

    return NextResponse.json(priceInfo)
  } catch (error: any) {
    console.error("[v0] Domain price API error:", error)
    return NextResponse.json({ error: "Failed to fetch domain pricing information" }, { status: 500 })
  }
}
