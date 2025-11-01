import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Props = {
  status: string
  className?: string
}

// Map EPP statuses to user-friendly labels
function prettify(status: string) {
  const s = status.toLowerCase()
  // Common EPP codes cleanup
  return s
    .replace(/^client|^server/, "") // remove client/server prefixes for display
    .replace(/transfer/, "transfer")
    .replace(/prohibited/, " prohibited")
    .replace(/hold/, " hold")
    .replace(/inactive/, "inactive")
    .replace(/ok/, "ok")
    .replace(/pending/, "pending")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
}

// Categorize for color
function category(status: string): "green" | "yellow" | "red" | "orange" | "gray" {
  const s = status.toLowerCase()
  if (/(^|-)ok$|active/.test(s)) return "green"
  if (/pending|transfer/.test(s)) return "yellow"
  if (/expired|inactive|delete/.test(s)) return "red"
  if (/locked|lock|hold|prohibited/.test(s)) return "orange"
  return "gray"
}

export default function StatusBadge({ status, className }: Props) {
  const cat = category(status)
  const styles =
    cat === "green"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : cat === "yellow"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
        : cat === "red"
          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
          : cat === "orange"
            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
            : "bg-muted text-muted-foreground"

  return (
    <Badge className={cn("capitalize", styles, className)} variant="outline" aria-label={`Status: ${prettify(status)}`}>
      {prettify(status)}
    </Badge>
  )
}
