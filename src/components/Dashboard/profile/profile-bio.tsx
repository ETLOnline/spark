import { GetUserRecommendationsAction } from "@/src/server-actions/Recommendations/Recommendations"
import { Card, CardContent } from "../../ui/card"
import ProfileBioClient from "./ProfileBioClient"

type ProfileBioProps = {
  userId: string
  userBio: string
  editable?: boolean
}

const ProfileBio: React.FC<ProfileBioProps> = async ({ userId, userBio, editable }) => {
  const recommendations = await GetUserRecommendationsAction(userId)

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <>
          <ProfileBioClient userId={userId} userBio={userBio} editable={editable} />
          <div className="recommendations">
            <h3 className="mb-2 font-semibold">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((recommendation, i) => (
                <li key={i} className="rounded-lg border p-3">
                  <p className="text-sm">
                    &quot;{recommendation.content}&quot;
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    - {recommendation.recommender_full_name}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      </CardContent>
    </Card>
  )
}

export default ProfileBio
