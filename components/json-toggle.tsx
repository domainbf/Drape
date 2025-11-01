"use client"
import { Button } from "@/components/ui/button"

type Props = {
  pretty: boolean
  onToggle(pretty: boolean): void
}

export default function JsonToggle({ pretty, onToggle }: Props) {
  return (
    <div className="inline-flex rounded-md border p-1" role="group" aria-label="JSON format toggle">
      <Button
        type="button"
        variant={pretty ? "default" : "ghost"}
        size="sm"
        className="rounded-sm"
        onClick={() => onToggle(true)}
        aria-pressed={pretty}
      >
        Formatted
      </Button>
      <Button
        type="button"
        variant={!pretty ? "default" : "ghost"}
        size="sm"
        className="rounded-sm"
        onClick={() => onToggle(false)}
        aria-pressed={!pretty}
      >
        Raw
      </Button>
    </div>
  )
}
