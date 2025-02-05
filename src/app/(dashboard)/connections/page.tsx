import ActivityScreen from "@/src/components/Dashboard/ProfileActivity/ActivityScreen"
import { ProfileActivity } from "@/src/components/Dashboard/ProfileActivity/types/activity.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { GetConnectionRequestsAction } from "@/src/server-actions/Contact/Contact"

const ProfileActivityPage = async () => {
  let incomingActivities: ProfileActivity[] = []
  let outgoingActivities: ProfileActivity[] = []
  
  try {
    const res = await GetConnectionRequestsAction()
    if (res.success && res.data) {
      incomingActivities = res.data.incoming
      outgoingActivities = res.data.outgoing
    } else {
      throw res.error
    }
  } catch (error) {
    throw error
  }

  return (
    <Card className="w-full max-w-[622px] mx-auto px-4 sm:px-6">
      <CardHeader className="px-0 sm:px-2 pt-4 pb-2">
        <CardTitle className="text-xl sm:text-2xl">Profile Activity</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          View your recent profile interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-2 pb-4">
        <Tabs defaultValue="all" className="w-full flex flex-col space-y-10">
          <TabsList className="w-full flex flex-wrap gap-2 h-fit">
            <TabsTrigger
              value="all"
              className="text-sm px-3 py-1 flex-1 min-w-[120px]"
            >
              All Requests
            </TabsTrigger>
            <TabsTrigger
              value="incoming"
              className="text-sm px-3 py-1 flex-1 min-w-[120px]"
            >
              Incoming
            </TabsTrigger>
            <TabsTrigger
              value="outgoing"
              className="text-sm px-3 py-1 flex-1 min-w-[120px]"
            >
              Outgoing
            </TabsTrigger>
            <TabsTrigger
              value="accepted"
              className="text-sm px-3 py-1 flex-1 min-w-[120px]"
            >
              Accepted
            </TabsTrigger>
          </TabsList>
          <ActivityScreen
            incomingActivities={incomingActivities}
            outgoingActivities={outgoingActivities}
          />
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ProfileActivityPage
