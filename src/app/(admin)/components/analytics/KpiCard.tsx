"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Card } from "@/src/components/ui/card"

export interface KpiItem {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
}

const COLUMN_CLASSES = {
  /** Fluid: as many ≥12.5rem cards per row as fit (5 across on wide screens) */
  auto: "grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))]",
  2: "grid-cols-1 sm:grid-cols-2",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
} as const

/**
 * Icon background + foreground colour palette.
 * Uses opacity-based classes so they render correctly in both light and dark mode
 * without needing separate dark: overrides.
 */
const ICON_PALETTE = [
  "bg-primary/10 text-primary", // teal  (brand)
  "bg-blue-500/10 text-blue-500", // blue
  "bg-violet-500/10 text-violet-500", // violet
  "bg-amber-500/10 text-amber-500", // amber
  "bg-orange-500/10 text-orange-500", // orange
  "bg-pink-500/10 text-pink-500" // pink
] as const

interface KpiCardProps {
  items: KpiItem[]
  columns?: keyof typeof COLUMN_CLASSES
  /**
   * "default" – uppercase label, large value (Overview, Communities, Mentorship, Leaderboards)
   * "compact" – sentence-case label, slightly smaller value and larger icon tile (Users page)
   */
  variant?: "default" | "compact"
  className?: string
}

/** Responsive row of KPI cards used at the top of every analytics page. */
export function KpiCard({
  items,
  columns = "auto",
  variant = "default",
  className
}: KpiCardProps) {
  const compact = variant === "compact"

  return (
    <div
      className={cn("grid gap-3 sm:gap-4", COLUMN_CLASSES[columns], className)}
    >
      {items.map(({ label, value, sub, icon: Icon }, idx) => (
        <Card
          key={label}
          className={
            compact
              ? "min-w-0 p-4 flex flex-col gap-2"
              : "min-w-0 rounded-xl border bg-card p-4 sm:p-5 shadow-sm flex flex-col gap-1"
          }
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                "min-w-0 text-muted-foreground [overflow-wrap:anywhere]",
                compact
                  ? "text-sm"
                  : "text-xs font-medium uppercase tracking-wide"
              )}
            >
              {label}
            </span>
            {Icon && (
              <span
                className={cn(
                  "rounded-lg flex items-center justify-center flex-shrink-0",
                  compact ? "w-8 h-8" : "w-7 h-7",
                  ICON_PALETTE[idx % ICON_PALETTE.length]
                )}
              >
                <Icon className="w-4 h-4" />
              </span>
            )}
          </div>
          <span
            className={cn(
              "font-bold tracking-tight [overflow-wrap:anywhere]",
              compact ? "text-2xl" : "text-2xl sm:text-3xl"
            )}
          >
            {value}
          </span>
          {sub && (
            <span
              className={cn(
                "text-xs text-muted-foreground",
                !compact && "[overflow-wrap:anywhere]"
              )}
            >
              {sub}
            </span>
          )}
        </Card>
      ))}
    </div>
  )
}
