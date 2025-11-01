"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import * as React from "react"

type Props = {
  value: string
  label?: string
  size?: "sm" | "default"
  className?: string
}

export default function CopyButton({ value, label = "Copy", size = "sm", className }: Props) {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        // Fallback
        const ta = document.createElement("textarea")
        ta.value = value
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      }
      setCopied(true)
      toast({ description: "Copied to clipboard." })
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast({ description: "Unable to copy.", variant: "destructive" })
    }
  }

  return (
    <Button type="button" variant="secondary" size={size} onClick={handleCopy} className={className} aria-live="polite">
      {copied ? "Copied" : label}
    </Button>
  )
}
