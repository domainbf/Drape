"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface QueryInfoProps {
  domain: string
  punycode: string
  source?: "rdap" | "whois"
  isLoading?: boolean
  error?: boolean
}

export default function QueryInfo({ domain, punycode, source, isLoading, error }: QueryInfoProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          {error && <AlertCircle className="h-4 w-4 text-red-600" />}
          {!isLoading && !error && source && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          <span className="text-sm font-medium text-gray-700">
            {isLoading ? "Looking up..." : "Domain Information"}
          </span>
        </div>
        {source && (
          <Badge variant={source === "rdap" ? "default" : "secondary"} className="text-xs">
            {source === "rdap" ? "RDAP" : "WHOIS Fallback"}
          </Badge>
        )}
      </div>
      <div className="text-xs text-gray-600">
        <span className="font-mono">{domain}</span>
        {punycode !== domain && (
          <>
            {" "}
            <span className="text-gray-500">→</span> <span className="font-mono">{punycode}</span>
          </>
        )}
      </div>
    </div>
  )
}
