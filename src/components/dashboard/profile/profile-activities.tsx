import { Activity } from "./types/profile-types"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from "../../ui/card"
import { StarIcon } from "lucide-react"

type Props = {
  activities: Activity[]
}

const ProfileActivities: React.FC<Props> = (props) => {
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
          {props.activities.map((activity, i) => (
            <li key={i} className="flex items-start space-x-3">
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
