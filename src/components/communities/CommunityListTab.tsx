import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import CommunityCard from "./CommunityCard"
import CommunitySkeletonCards from "./CommunitySkeleton" // Assuming this exists
import { SelectCommunity } from "@/src/db/schema"
import { GetCommunitiesActionResponse } from "@/src/server-actions/Community/Community"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard" // Make sure to import this
import { Group } from "lucide-react" // Make sure to import this icon

interface CommunityListTabsProps {
  loading: boolean
  error: Error | null
  communitiesList: GetCommunitiesActionResponse | null
  onEditCommunity: (community: SelectCommunity) => void
  onDeleteCommunity: (community: SelectCommunity) => void
  onJoinCommunity: () => void
  activeTab: "all" | "my"
  onTabChange: (tabValue: string) => void
}

export default function CommunityListTabs({
  loading,
  error,
  communitiesList,
  onEditCommunity,
  onDeleteCommunity,
  activeTab,
  onTabChange,
  onJoinCommunity
}: CommunityListTabsProps) {
  const allCommunities = communitiesList?.communities || []
  const joinedCommunities = communitiesList?.joinedCommunities || []
  const totalMyCommunities =
    communitiesList?.joinedCommunitiesPagination?.total || 0
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Communities</TabsTrigger>
        <TabsTrigger value="my">
          My Communities
          <Badge variant="secondary" className="ml-2">
            {totalMyCommunities || 0}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* All Communities Tab Content */}
      <TabsContent value="all" className="space-y-6">
        {loading ? (
          <CommunitySkeletonCards count={6} />
        ) : error ? (
          <NoDataCard
            icon={<Group className="h-16 w-16 text-destructive mb-4" />}
            title="Error Loading Communities"
            description="There was an issue fetching communities. Please try again later."
          />
        ) : allCommunities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allCommunities.map((community: any) => (
              <CommunityCard
                key={community.id}
                community={community}
                showStar={true}
                onEdit={onEditCommunity}
                onDelete={onDeleteCommunity}
                onJoin={onJoinCommunity}
              />
            ))}
          </div>
        ) : (
          <NoDataCard
            icon={<Group className="h-16 w-16 text-muted-foreground mb-4" />}
            title="No communities found"
            description="Adjust your filters or try a different search term."
          />
        )}
      </TabsContent>

      {/* My Communities Tab Content */}
      <TabsContent value="my" className="space-y-6">
        {loading ? (
          <CommunitySkeletonCards count={6} />
        ) : error ? (
          <NoDataCard
            icon={<Group className="h-16 w-16 text-destructive mb-4" />}
            title="Error Loading Communities"
            description="There was an issue fetching your communities. Please try again later."
          />
        ) : joinedCommunities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {joinedCommunities.map((community: any) => (
              <CommunityCard
                key={community.id}
                community={community}
                showStar={true}
                onEdit={onEditCommunity}
                onDelete={onDeleteCommunity}
                onJoin={onJoinCommunity}
                forceJoined={true}
              />
            ))}
          </div>
        ) : (
          <NoDataCard
            icon={<Group className="h-16 w-16 text-muted-foreground mb-4" />}
            title="No joined communities found"
            description="You haven't joined any communities yet."
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
