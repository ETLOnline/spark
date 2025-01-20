import ActivityScreen from "@/src/components/Dashboard/Activity/ActivityScreen"
import {
  ActivityType,
  ProfileActivity
} from "@/src/components/Dashboard/Activity/types/activity.types.d"
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
        console.log(res.data.contacts)
        activities = res.data.contacts.map((contact) => {
          const type = contact.is_accepted
            ? ActivityType.Connect_Accepted
            : contact.is_requested
            ? contact.contact_id === user.unique_id
              ? ActivityType.Connect_Received
              : ActivityType.Connect_Sent
            : contact.is_following
            ? ActivityType.Following
            : contact.is_followed_by
            ? ActivityType.Followed
            : contact.is_accepted
            ? ActivityType.Connect_Accepted
            : ActivityType.Null
          return {
            id: contact.user_id + contact.contact_id,
            user_id: contact.user_id,
            contact_id: contact.contact_id,
            name:
              contact.user?.first_name + " " + contact.user?.last_name || "",
            avatar: contact.user?.profile_url || "",
            timestamp: contact.created_at || "",
            type
          }
        })
      } else {
        throw res.error
      }
    } catch (error) {
      console.error(error)
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
