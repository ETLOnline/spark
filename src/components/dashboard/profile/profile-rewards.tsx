import { Reward } from "./types/profile-types"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from "../../ui/card"
import { TrophyIcon } from "lucide-react"

type Props = {
  rewards: Reward[]
}

const ProfileRewards: React.FC<Props> = (props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards</CardTitle>
        <CardDescription>Your achievements and recognitions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {props.rewards.map((reward: Reward) => (
            <li className="flex items-start space-x-3">
              <TrophyIcon className="mt-0.5 h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-semibold">{reward.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {reward.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default ProfileRewards
