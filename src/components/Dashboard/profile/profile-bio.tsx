import { Card, CardContent } from "../../ui/card"
import ProfileBioClient from "./ProfileBioClient"
import { Recommendation } from "./types/profile-types.d"

type ProfileBioProps = {
  userId: string
}

const ProfileBio: React.FC<ProfileBioProps> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      name: "Jane Doe",
      text: "An exceptional developer with a keen eye for detail."
    },
    { name: "John Smith", text: "Always delivers high-quality work on time." }
  ])

  return (
    <Card>
      <CardContent className="space-y-4 pt-6 flex items-center justify-center">
        <>
          <ProfileBioClient userId={userId} />
          <div className="recommendations">
            <h3 className="mb-2 font-semibold">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((recommendation: Recommendation, i) => (
                <li key={i} className="rounded-lg border p-3">
                  <p className="text-sm">&quot;{recommendation.text}&quot;</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    - {recommendation.name}
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
