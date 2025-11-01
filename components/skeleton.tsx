"use client"

import { useLanguage } from "@/contexts/language-context"

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-4 w-full animate-pulse rounded bg-muted ${className}`} />
}

export function ResultSkeleton() {
  const { t } = useLanguage()

  return (
    <div className="rounded-md border p-4">
      <div className="mb-6 flex flex-col items-center justify-center gap-3 py-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{t("querying")}</p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <SkeletonLine className="h-5 w-40" />
        <div className="flex gap-2">
          <SkeletonLine className="h-8 w-20" />
          <SkeletonLine className="h-8 w-16" />
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <SkeletonLine className="h-6 w-20" />
        <SkeletonLine className="h-6 w-24" />
        <SkeletonLine className="h-6 w-16" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SkeletonLine className="h-10" />
        <SkeletonLine className="h-10" />
        <SkeletonLine className="h-10" />
        <SkeletonLine className="h-10" />
      </div>
      <div className="mt-6">
        <SkeletonLine className="mb-2 h-5 w-28" />
        <div className="space-y-2">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine />
        </div>
      </div>
    </div>
  )
}
