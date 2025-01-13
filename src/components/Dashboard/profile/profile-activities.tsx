import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader
} from "../../ui/card"
import { StarIcon } from "lucide-react"
// import { GetActivitiesForUserAction } from "@/src/server-actions/Activity/Activity"
// import { Activity } from "./types/profile-types"
import { SelectActivity } from "@/src/db/schema"

type ProfileActivitiesProps = {
  activities: SelectActivity[]
}

const ProfileActivities: React.FC<ProfileActivitiesProps> = async ({
  activities
}) => {
  // let activities

  // try {
  //   const res = await GetActivitiesForUserAction(userId)
  //   if (res.success) {
  //     activities = res.data
  //   } else {
  //     throw res.error
  //   }
  // } catch (error) {
  //   console.error(error)
  // }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>
          Your recent activities and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities?.map((activity) => (
            <li key={activity.id} className="flex items-start space-x-3">
              <StarIcon className="mt-0.5 h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default ProfileActivities
