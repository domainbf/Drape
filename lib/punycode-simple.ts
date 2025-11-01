// Simple punycode implementation for browser use
// Based on RFC 3492

const base = 36
const tMin = 1
const tMax = 26
const skew = 38
const damp = 700
const initialBias = 72
const initialN = 128
const delimiter = "-"

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let k = 0
  delta = firstTime ? Math.floor(delta / damp) : delta >> 1
  delta += Math.floor(delta / numPoints)

  for (; delta > ((base - tMin) * tMax) >> 1; k += base) {
    delta = Math.floor(delta / (base - tMin))
  }

  return Math.floor(k + ((base - tMin + 1) * delta) / (delta + skew))
}

function encodeBasic(codePoint: number): string {
  if (codePoint < 26) {
    return String.fromCharCode(codePoint + 97) // a-z
  }
  return String.fromCharCode(codePoint - 26 + 48) // 0-9
}

function encode(input: string): string {
  const output: string[] = []
  const inputLength = input.length

  // Copy all basic code points to output
  let n = initialN
  let delta = 0
  let bias = initialBias
  let basicLength = 0

  for (let i = 0; i < inputLength; i++) {
    const code = input.charCodeAt(i)
    if (code < 128) {
      output.push(input[i])
      basicLength++
    }
  }

  let handledCPCount = basicLength
  const basicCount = basicLength

  if (basicCount > 0) {
    output.push(delimiter)
  }

  while (handledCPCount < inputLength) {
    let m = 0x10ffff
    for (let i = 0; i < inputLength; i++) {
      const code = input.charCodeAt(i)
      if (code >= n && code < m) {
        m = code
      }
    }

    delta += (m - n) * (handledCPCount + 1)
    n = m

    for (let i = 0; i < inputLength; i++) {
      const code = input.charCodeAt(i)

      if (code < n) {
        delta++
      }

      if (code === n) {
        let q = delta
        for (let k = base; ; k += base) {
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias
          if (q < t) break
          output.push(encodeBasic(t + ((q - t) % (base - t))))
          q = Math.floor((q - t) / (base - t))
        }

        output.push(encodeBasic(q))
        bias = adapt(delta, handledCPCount + 1, handledCPCount === basicCount)
        delta = 0
        handledCPCount++
      }
    }

    delta++
    n++
  }

  return output.join("")
}

export function toASCII(domain: string): string {
  if (!domain || domain.length === 0) {
    return ""
  }

  const labels = domain.toLowerCase().split(".")
  const encoded: string[] = []

  for (const label of labels) {
    if (!label || label.length === 0) {
      continue
    }

    // Check if label contains non-ASCII
    if (!/[^\x00-\x7F]/.test(label)) {
      encoded.push(label)
      continue
    }

    try {
      const encodedLabel = encode(label)
      encoded.push(`xn--${encodedLabel}`)
    } catch (err) {
      console.warn(`[v0] Failed to encode label "${label}":`, err)
      encoded.push(label) // Fallback to original label
    }
  }

  return encoded.join(".")
}

export function toUnicode(domain: string): string {
  // For now, just return the domain as-is
  // Full decode implementation would be needed for complete support
  return domain
}
