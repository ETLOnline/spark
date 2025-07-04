import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import CommunityCard from "./CommunityCard"
import CommunitySkeletonCards from "./CommunitySkeleton"
import { SelectCommunity } from "@/src/db/schema"
import { GetCommunitiesActionResponse } from "@/src/server-actions/Community/Community"

interface CommunityListTabsProps {
  loading: boolean
  error: Error | null
  communitiesList: GetCommunitiesActionResponse | null
  onEditCommunity: (community: SelectCommunity) => void
  onDeleteCommunity: (community: SelectCommunity) => void
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
  onTabChange
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

      {/* Loading State */}
      {loading && <CommunitySkeletonCards count={6} />}

      {/* All Communities Tab Content */}
      <TabsContent value="all" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            !error &&
            allCommunities.length > 0 &&
            allCommunities.map((community: any) => (
              <CommunityCard
                key={community.id}
                community={community}
                showStar={true}
                onEdit={onEditCommunity}
                onDelete={onDeleteCommunity}
              />
            ))}
        </div>
      </TabsContent>

      {/* My Communities Tab Content */}
      <TabsContent value="my" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            !error &&
            joinedCommunities.length > 0 &&
            joinedCommunities.map((community: any) => (
              <CommunityCard
                key={community.id}
                community={community}
                showStar={true}
                onEdit={onEditCommunity}
                onDelete={onDeleteCommunity}
              />
            ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
