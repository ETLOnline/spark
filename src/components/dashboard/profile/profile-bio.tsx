"use client"
import { Badge } from "../../ui/badge"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader
} from "../../ui/card"
import { Recommendation, Tag } from "./types/profile-types"
import EditProfileModal from "./edit-profile-modal"
import { useState } from "react"

type Props = {
  editable?: boolean
}

const ProfileBio: React.FC<Props> = ({
  editable = true
}) => {
  const [bio, setBio] = useState<string>("hello world!")
    const [skillTags, setSkillTags] = useState<Tag[]>([
      { name: "React", id: 0 },
      { name: "Next", id: 1 }
    ])
    const [interestTags, setInterestTags] = useState<Tag[]>([
      { name: "Js", id: 0 },
      { name: "Ts", id: 1 }
    ])
    const [recommendations, setRecommendations] = useState<Recommendation[]>([
      {
        name: "Jane Doe",
        text: "An exceptional developer with a keen eye for detail."
      },
      { name: "John Smith", text: "Always delivers high-quality work on time." }
    ])

  return (
    <Card>
      <CardHeader>
        <header className="profile-section-header flex justify-between">
          <CardTitle>Bio</CardTitle>
          {editable && setSkillTags && setInterestTags && (
            <EditProfileModal
              bio={bio}
              setBio={setBio}
              skills={skillTags}
              setSkills={setSkillTags}
              interests={interestTags}
              setInterests={setInterestTags}
            />
          )}
        </header>
        <CardDescription>{bio}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <header className="profile-section-header flex justify-between">
            <h3 className="mb-2 font-semibold">Skills</h3>
          </header>
          <div className="flex flex-wrap gap-2">
            {skillTags.map((skill: Tag) => (
              <Badge key={skill.id} variant="secondary">
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="profile-section-header flex justify-between">
            <h3 className="mb-2 font-semibold">interestTags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {interestTags.map((interest: Tag) => (
              <Badge key={interest.id} variant="outline">
                {interest.name}
              </Badge>
            ))}
          </div>
        </div>
        <div>
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
      </CardContent>
    </Card>
  )
}

export default ProfileBio
