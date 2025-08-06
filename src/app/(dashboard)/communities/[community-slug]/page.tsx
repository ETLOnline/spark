import React, { Suspense } from "react"
import { GetCommunityDetailsAction } from "@/src/server-actions/Community/Community"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import CommunityDetailsClient from "@/src/components/communities/CommunityDetailsClient"

interface CommunityPageProps {
  params: Promise<{
    "community-slug": string
  }>
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const communitySlug = await params
  const communitySlugValue = communitySlug["community-slug"]
  const DecodedCommunitySlug = decodeURIComponent(communitySlugValue)
  const community = await GetCommunityDetailsAction(DecodedCommunitySlug)

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground">
        <p className="text-lg">Community not found.</p>
        <Button className="mt-4">
          <Link href="/communities">Go back to communities</Link>
        </Button>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader size={LoaderSizes.xl} />
        </div>
      }
    >
      <CommunityDetailsClient community={community} />
    </Suspense>
  )
}
