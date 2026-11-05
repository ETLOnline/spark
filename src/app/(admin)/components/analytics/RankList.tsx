"use client"

import Link from "next/link"
import { cn } from "@/src/lib/utils"
import { SnapshotUnavailable } from "./AnalyticsPage"

export interface RankListItem {
  initials: string
  name: string
  value: number | string
  avatarColor?: string
}

interface RankListProps {
  title: string
  subtitle: string
  items: RankListItem[]
  valueLabel?: string
  linkHref?: string
  linkLabel?: string
  className?: string
}

export function RankList({
  title,
  subtitle,
  items,
  valueLabel,
  linkHref,
  linkLabel = "View all →",
  className
}: RankListProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border bg-card p-4 sm:p-5 shadow-sm flex flex-col gap-4",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
        <div className="min-w-0">
          <h2 className="font-semibold text-sm">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {valueLabel && (
          <span className="text-xs text-muted-foreground text-right">
            {valueLabel}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <SnapshotUnavailable />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={item.name} className="flex min-w-0 items-center gap-3">
              <span className="text-sm text-muted-foreground w-4 flex-shrink-0">
                {i + 1}
              </span>
              <span
                className={cn(
                  "w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0",
                  item.avatarColor ?? "bg-primary/10 text-primary"
                )}
              >
                {item.initials}
              </span>
              <span
                className="text-sm flex-1 min-w-0 truncate"
                title={item.name}
              >
                {item.name}
              </span>
              <span className="text-sm font-semibold flex-shrink-0 tabular-nums">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {linkHref && (
        <Link
          href={linkHref}
          className="text-xs text-primary hover:underline mt-1"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
