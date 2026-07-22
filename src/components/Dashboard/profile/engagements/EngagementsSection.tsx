"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Engagement } from "./types"
import { StatusPill } from "./StatusPill"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetEngagementsAction } from "@/src/server-actions/Mentor/MentorActions"
import moment from "moment"

// ── Single row ────────────────────────────────────────────────────────────────

function EngagementRow({ e }: { e: Engagement }) {
  const dateLabel = `${e.counterpart.name} · ${moment(e.sessionDate).format("ddd MMM D")} · ${e.sessionType}`
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-foreground/5 last:border-b-0",
        e.status === "overdue" && "bg-red-500/[0.03]"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold",
          e.status === "overdue"
            ? "bg-red-100 text-red-700"
            : e.status === "upcoming"
              ? "bg-blue-100 text-blue-700"
              : "bg-emerald-100 text-emerald-700"
        )}
      >
        {e.counterpart.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{e.topic}</p>
        <p className="text-xs text-muted-foreground truncate">{dateLabel}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusPill status={e.status} />
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

export function EngagementsSection() {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [total, setTotal] = useState(0)
  const [loading, , , fetchEngagements] = useServerAction(GetEngagementsAction)

  useEffect(() => {
    const load = async () => {
      const res = await fetchEngagements()
      if (res?.success && res.data) {
        setTotal(res.data.length)
        setEngagements(res.data.slice(0, 2))
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-foreground/8 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-foreground/5">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5"
          >
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-40 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!loading && engagements.length === 0) return null

  return (
    <div className="rounded-xl border border-foreground/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">My Engagements</h3>
          <span className="text-xs text-muted-foreground bg-foreground/5 rounded-full px-2 py-0.5">
            {total} total
          </span>
        </div>
      </div>

      {engagements.map((e) => (
        <EngagementRow key={e.id} e={e} />
      ))}

      <Link
        href="/profile/engagements"
        className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02] transition-colors border-t border-foreground/5"
      >
        View All Engagements
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
