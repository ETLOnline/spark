import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader
} from "../../ui/card"
import { TrophyIcon } from "lucide-react"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetRewardsForUserAction } from "@/src/server-actions/Reward/Reward"
import { useEffect } from "react"

type ProfileActivitiesProps = {
  userId: string
}

const ProfileRewards: React.FC<ProfileActivitiesProps> = async ({ userId }) => {
  let rewards
  
  try {
    const res = await GetRewardsForUserAction(userId)
    if (res.success) {
      rewards = res.data
    } else {
      throw res.error
    }
  } catch (error) {
    console.error(error)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards</CardTitle>
        <CardDescription>Your achievements and recognitions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {rewards?.map((reward) => (
            <li key={reward.id} className="flex items-start space-x-3">
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
