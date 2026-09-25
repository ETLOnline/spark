"use client"

import React, { useEffect, useState } from "react"
import { GetCommunityIdBySlugAction } from "@/src/server-actions/Communities/CommunityRanking"
import FacultyDashboardView from "@/src/components/Fyp/FacultyDashboardView"
import { Skeleton } from "@/src/components/ui/skeleton"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"

interface FacultyDashboardPageProps {
  params: Promise<{ "community-slug": string }>
}

export default function FacultyDashboardPage({
  params
}: FacultyDashboardPageProps) {
  const [communityId, setCommunityId] = useState<string | null>(null)
  const [communitySlug, setCommunitySlug] = useState<string | null>(null)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const resolveCommunity = async () => {
      const { "community-slug": slug } = await params
      setCommunitySlug(slug)
      const res = await GetCommunityIdBySlugAction(slug)
      setCommunityId(res?.success && res.data ? res.data : null)
      setResolved(true)
    }
    resolveCommunity()
  }, [params])

  if (!resolved) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!communityId) {
    return <NoDataCard title="Community not found" />
  }

  return (
    <FacultyDashboardView
      communityId={communityId}
      backHref={`/communities/${encodeURIComponent(communitySlug ?? "")}`}
    />
  )
}
