"use client"

import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader
} from "../../ui/card"
import { TrophyIcon } from "lucide-react"
import { SelectReward } from "@/src/db/schema"

type ProfileActivitiesProps = {
  rewards: SelectReward[]
}

const ProfileRewards: React.FC<ProfileActivitiesProps> = ({ rewards }) => {
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
