"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Progress } from "@/src/components/ui/progress"

export interface CommunityRow {
  name: string
  members: number
  posts: number
}

interface TopCommunitiesCardProps {
  communities: CommunityRow[]
  showLink?: boolean
  title?: string
}

export function TopCommunitiesCard({
  communities,
  showLink = true,
  title = "Top communities"
}: TopCommunitiesCardProps) {
  const [mode, setMode] = useState<"members" | "posts">("members")

  const getValue = (c: CommunityRow) =>
    mode === "members" ? c.members : c.posts
  const maxVal = Math.max(...communities.map(getValue))
  const subtitle =
    mode === "members" ? "Ranked by total members" : "Ranked by total posts"

  return (
    <div className="min-w-0 rounded-xl border bg-card p-4 sm:p-5 shadow-sm flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-sm">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {/* Members / Posts toggle */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <TabsList className="h-8 flex-shrink-0">
            <TabsTrigger value="members" className="text-xs">
              Members
            </TabsTrigger>
            <TabsTrigger value="posts" className="text-xs">
              Posts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-3">
        {communities.map((c, i) => (
          <div key={c.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-sm text-muted-foreground w-4 flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm font-medium truncate" title={c.name}>
                  {c.name}
                </span>
              </div>
              <span className="text-sm font-semibold flex-shrink-0 tabular-nums">
                {getValue(c).toLocaleString()}
              </span>
            </div>
            <Progress
              value={(getValue(c) / maxVal) * 100}
              className="h-1.5 bg-muted"
              indicatorClassName="rounded-full duration-500"
            />
          </div>
        ))}
      </div>

      {showLink && (
        <Link
          href="/admin/analytics/communities"
          className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
        >
          View community analytics <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}
