import { Suspense } from "react"
import DomainLookup from "@/components/domain-lookup"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DomainLookup />
    </Suspense>
  )
}
