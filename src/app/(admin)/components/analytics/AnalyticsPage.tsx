"use client"

import { ReactNode } from "react"
import { cn } from "@/src/lib/utils"

interface PageHeaderProps {
  title: string
  description?: ReactNode
  /** Optional element aligned to the right of the title on sm+ (e.g. a snapshot badge) */
  aside?: ReactNode
}

export function PageHeader({ title, description, aside }: PageHeaderProps) {
  const heading = (
    <div className="min-w-0">
      <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )

  if (!aside) return heading

  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
      {heading}
      {aside}
    </div>
  )
}

/** Shown when the snapshot row doesn't exist yet or a module failed during collection (stored as null). */
export function SnapshotUnavailable({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground",
        className
      )}
    >
      This data isn&apos;t available in the latest report snapshot yet.
    </div>
  )
}

interface AnalyticsPageProps extends PageHeaderProps {
  children: ReactNode
  className?: string
}

/** Page shell for the admin analytics pages: responsive padding, vertical rhythm and header. */
export function AnalyticsPage({
  children,
  className,
  ...header
}: AnalyticsPageProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:gap-6 p-1 py-4 sm:p-4 lg:p-6 w-full min-w-0",
        className
      )}
    >
      <PageHeader {...header} />
      {children}
    </div>
  )
}
