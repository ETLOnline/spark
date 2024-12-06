import { Badge } from "../../ui/badge"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from "../../ui/card"
import { Recommendation } from "./types/profile-types"

type Props = {
  recommendations: Recommendation[]
  skillTags: string[]
  interests: string[]
}

const ProfileBio: React.FC<Props> = (props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bio</CardTitle>
        <CardDescription>Your professional summary and skills</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 font-semibold">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {props.skillTags.map((skill: string) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {props.interests.map((interest: string) => (
              <Badge key={interest} variant="outline">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Recommendations</h3>
          <ul className="space-y-2">
            {props.recommendations.map((recommendation: Recommendation) => (
              <li className="rounded-lg border p-3">
                <p className="text-sm">&quot;{recommendation.text}&quot;</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  - {recommendation.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileBio
