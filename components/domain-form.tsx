"use client"

import * as React from "react"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { normalizeDomainInput, punycodeEncode, ValidationErrorMap, isValidDomainStructure } from "@/lib/domain-utils"
import { announcePolite, announceAssertive } from "@/utils/a11y"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"

type SubmitPayload = {
  original: string
  normalized: string
  punycode: string
}

export default function DomainForm({
  onSubmit,
  className,
  initialValue,
}: {
  onSubmit: (payload: SubmitPayload) => void
  className?: string
  initialValue?: string
}) {
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>(null)

  const { t } = useLanguage()

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  React.useEffect(() => {
    if (typeof initialValue === "string" && initialValue.length > 0) {
      setValue(initialValue)
    }
  }, [initialValue])

  const schema = React.useMemo(
    () =>
      z
        .string()
        .transform((v) => v.trim())
        .refine((v) => v.length > 0, { message: "Please enter a domain." })
        .refine((v) => !/\s/.test(v), {
          message: "Domain names cannot contain spaces.",
        })
        .refine((v) => v.length <= 253, {
          message: "Domain is too long (max 253 characters).",
        })
        .transform((v) => normalizeDomainInput(v))
        .refine(
          (v) => {
            // Check if domain contains non-ASCII (Chinese, IDN, etc.)
            const hasNonAscii = /[^\x00-\x7F]/.test(v)

            if (hasNonAscii) {
              // For non-ASCII domains, just check basic structure
              const parts = v.split(".")
              if (parts.length < 2) return false

              // Each part should have reasonable length
              return parts.every((p) => p.length >= 1 && p.length <= 63)
            }

            // For ASCII domains, use standard validation
            return isValidDomainStructure(v)
          },
          { message: "Please include a valid top-level domain (e.g., example.com)." },
        ),
    [],
  )

  function getSmartMessage(raw: string): string | null {
    // Context-aware tips for common mistakes
    if (/^https?:\/\//i.test(raw)) {
      return "Looks like you pasted a URL; I only need the domain."
    }
    if (/\s/.test(raw)) {
      return "Domain names cannot contain spaces."
    }
    if (!raw.includes(".")) {
      return "Please include the top-level domain (e.g., .com, .org)."
    }
    return null
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    announcePolite("Validating domain")

    const original = value
    const smart = getSmartMessage(original)
    if (smart) {
      setError(smart)
      announceAssertive(smart)
      return
    }

    const parsed = schema.safeParse(original)
    if (!parsed.success) {
      const message = ValidationErrorMap(parsed.error)
      setError(message)
      announceAssertive(message)
      return
    }

    const normalized = parsed.data
    setIsLoading(true)

    try {
      const punycode = await punycodeEncode(normalized).catch(() => normalized)
      onSubmit({ original, normalized, punycode })
      announcePolite("Domain valid. Proceeding.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-3", className)}
      role="search"
      aria-label="RDAP domain lookup"
    >
      <label htmlFor="domain-input" className="text-sm font-medium">
        {t("domainLabel")}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="domain-input"
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          placeholder="e.g., example.com or münich.de"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={!!error}
          aria-describedby={error ? "domain-error" : undefined}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit()
            }
          }}
          className="text-ellipsis"
        />
        <Button type="submit" disabled={isLoading} aria-live="polite">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
              />
              {t("checking")}
            </span>
          ) : (
            t("lookupButton")
          )}
        </Button>
      </div>

      <div className="min-h-5" aria-live="assertive" aria-atomic="true">
        {error && (
          <p id="domain-error" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </form>
  )
}
