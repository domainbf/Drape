// Tian.hu API client for domain pricing, DNS, stats, and translation

const TIANHU_BASE_URL = "https://api.tian.hu"

export interface TianhuPricing {
  premium: boolean
  register: number
  renew: number
  register_usd: number
  renew_usd: number
  cached: boolean
}

export async function getTianhuPricing(domain: string): Promise<TianhuPricing | null> {
  try {
    const response = await fetch(`${TIANHU_BASE_URL}/pricing/${encodeURIComponent(domain)}`, {
      headers: {
        lang: "zh",
      },
    })

    if (!response.ok) {
      console.warn(`[v0] Tianhu pricing failed: ${response.status}`)
      return null
    }

    const json = await response.json()
    if (json.code === 200 && json.data) {
      return json.data
    }
    return null
  } catch (err) {
    console.error("[v0] Tianhu pricing error:", err)
    return null
  }
}
