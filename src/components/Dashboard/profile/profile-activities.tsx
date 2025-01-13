import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader
} from "../../ui/card"
import { StarIcon } from "lucide-react"
import { GetActivitiessForUserAction } from "@/src/server-actions/Activity/Activity"

type ProfileActivitiesProps = {
  userId: string
}

const ProfileActivities: React.FC<ProfileActivitiesProps> = async ({
  userId
}) => {
  let activities

  try {
    const res = await GetActivitiessForUserAction(userId)
    if (res.success) {
      activities = res.data
    } else {
      throw res.error
    }
  } catch (error) {
    console.error(error)
  }

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
