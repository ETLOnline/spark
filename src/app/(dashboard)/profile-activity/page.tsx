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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Activity</CardTitle>
        <CardDescription>View your recent profile interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-fit mb-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing Requests</TabsTrigger>
            <TabsTrigger value="accepted">Accepted Requests</TabsTrigger>
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
