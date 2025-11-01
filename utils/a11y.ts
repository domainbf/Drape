let politeRegion: HTMLElement | null = null
let assertiveRegion: HTMLElement | null = null

function ensureRegions() {
  if (typeof document === "undefined") return
  if (!politeRegion) {
    politeRegion = document.createElement("div")
    politeRegion.setAttribute("aria-live", "polite")
    politeRegion.setAttribute("aria-atomic", "true")
    politeRegion.className = "sr-only"
    document.body.appendChild(politeRegion)
  }
  if (!assertiveRegion) {
    assertiveRegion = document.createElement("div")
    assertiveRegion.setAttribute("aria-live", "assertive")
    assertiveRegion.setAttribute("aria-atomic", "true")
    assertiveRegion.className = "sr-only"
    document.body.appendChild(assertiveRegion)
  }
}

export function announcePolite(message: string) {
  if (typeof document === "undefined") return
  ensureRegions()
  if (politeRegion) politeRegion.textContent = message
}

export function announceAssertive(message: string) {
  if (typeof document === "undefined") return
  ensureRegions()
  if (assertiveRegion) assertiveRegion.textContent = message
}
