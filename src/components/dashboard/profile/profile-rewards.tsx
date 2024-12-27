"use client"

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

const ProfileRewards: React.FC = () => {
  const user = useAtomValue(userStore.Iam)

  const [rewardsLoading, rewards, rewardsError, getRewards] = useServerAction(
    GetRewardsForUserAction
  )

  useEffect(() => {
    ;(async () => {
      user && (await getRewards(user?.external_auth_id))
    })()
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards</CardTitle>
        <CardDescription>Your achievements and recognitions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {rewards &&
            rewards.data &&
            rewards.data.map((reward) => (
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
