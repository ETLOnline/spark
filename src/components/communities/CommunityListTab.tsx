import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { Shield } from "lucide-react"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import CommunityCard from "./CommunityCard"
import { Skeleton } from "../ui/skeleton"
import CommunitySkeletonCards from "./CommunitySkeleton"
import { SelectCommunity } from "@/src/db/schema"

interface CommunityListTabsProps {
  loading: boolean
  error: Error | null
  communitiesList: { communities: any[]; joinedCommunities: any[] } | null
  onEditCommunity: (community: SelectCommunity) => void
  onDeleteCommunity: (community: SelectCommunity) => void
}

export default function CommunityListTabs({
  loading,
  error,
  communitiesList,
  onEditCommunity,
  onDeleteCommunity
}: CommunityListTabsProps) {
  console.log(communitiesList, "communitiesListcommunitiesListcommunitiesList")
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Communities</TabsTrigger>
        <TabsTrigger value="my">
          My Communities
          <Badge variant="secondary" className="ml-2">
            {communitiesList?.joinedCommunities?.length || 0}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* Loading State */}
      {loading && <CommunitySkeletonCards count={6} />}

      {/* Error State */}
      {error && (
        <div className="mt-6 text-center text-red-500">
          <p>Error loading communities: {error.message}</p>
        </div>
      )}

      {/* All Communities Tab Content */}
      <TabsContent value="all" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
          !error &&
          communitiesList &&
          communitiesList.communities.length > 0
            ? communitiesList.communities.map((community: any) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  showStar={true}
                  onEdit={onEditCommunity}
                  onDelete={onDeleteCommunity}
                />
              ))
            : !loading &&
              !error &&
              communitiesList &&
              communitiesList.communities.length === 0 && (
                <NoDataCard
                  icon={
                    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  }
                  title="No communities found"
                  description="Adjust your filters or try a different search term."
                />
              )}
        </div>
      </TabsContent>

      {/* My Communities Tab Content */}
      <TabsContent value="my" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
          !error &&
          communitiesList &&
          communitiesList.joinedCommunities.length > 0
            ? communitiesList.joinedCommunities.map((community: any) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  showStar={true}
                  onEdit={onEditCommunity}
                  onDelete={onDeleteCommunity}
                />
              ))
            : !loading &&
              !error &&
              communitiesList &&
              communitiesList.joinedCommunities.length === 0 && (
                <NoDataCard
                  icon={
                    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  }
                  title="No joined communities found"
                  description="You haven't joined any communities yet. Discover some in the 'All Communities' tab!"
                />
              )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
