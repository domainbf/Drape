import { redirect } from "next/navigation"

export default function DomainPage({ params }: { params: { domain: string } }) {
  // Redirect to home with query parameter for client-side handling
  redirect(`/?q=${encodeURIComponent(params.domain)}`)
}
