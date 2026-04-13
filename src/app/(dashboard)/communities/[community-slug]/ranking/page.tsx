import React, { Suspense } from "react"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { CommunityRankingsData } from "@/src/components/Dashboard/profile/trust-engine/Constant"
import LeaderboardCard from "@/src/components/communities/LeaderboardCard"
import RankingCard from "@/src/components/communities/RankingCard"

interface CommunityRankingPageProps {
  params: Promise<{
    "community-slug": string
  }>
}

export default async function CommunityRankingPage({
  params
}: CommunityRankingPageProps) {
  const { "community-slug": slug } = await params

  return (
    <Suspense fallback={<Loader size={LoaderSizes.xl} />}>
      <RankingCard
        currentUserRank={CommunityRankingsData.find((r) => r.isCurrentUser)}
        communityTitle={slug}
      />
      <LeaderboardCard data={CommunityRankingsData} />
    </Suspense>
  )
}
