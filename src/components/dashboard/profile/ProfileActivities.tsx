import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader
} from "../../ui/card"
import { StarIcon } from "lucide-react"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { GetActivitiessForUserAction } from "@/src/server-actions/Activity/Activity"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useEffect } from "react"

const ProfileActivities: React.FC = () => {
  const user = useAtomValue(userStore.Iam)

  const [activitiesLoading, activities, activitiesError, getActivities] =
    useServerAction(GetActivitiessForUserAction)

  useEffect(() => {
    ;(async () => {
      user && (getActivities(user?.external_auth_id))
    })()
  }, [user])

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
          {activities &&
            activities.data &&
            activities?.data.map((activity) => (
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
