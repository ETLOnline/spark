import ActivityScreen from "@/src/components/Dashboard/Activity/ActivityScreen"
import { ProfileActivity } from "@/src/components/Dashboard/Activity/types/activity.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { GetContactsAction } from "@/src/server-actions/Contact/Contact"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

const ProfileActivityPage = async () => {
  const user = await AuthUserAction()
  let activities: ProfileActivity[]=[]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Activity</CardTitle>
        <CardDescription>View your recent profile interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="visits">Profile Visits</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <ActivityScreen activities={activities} />
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ProfileActivityPage
