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
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

const ProfileActivityPage = async () => {
  const user = await AuthUserAction()
  let activities: ProfileActivity[] = []
  if (user) {
    try {
      const res = await GetConnectionRequestsAction(user.unique_id)
      if (res.success && res.data) {
        activities = res.data
      } else {
        throw res.error
      }
    } catch (error) {
      throw error
    }
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
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="pending requests">Pending Requests</TabsTrigger>
            <TabsTrigger value="accepted requests">Accepted Requests</TabsTrigger>
          </TabsList>
          <ActivityScreen activities={activities} />
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ProfileActivityPage
