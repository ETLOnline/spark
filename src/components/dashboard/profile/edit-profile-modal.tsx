import { useState } from "react"
import { Button } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import TagsInput from "@/src/components/TagsInput/TagsInput"
import { SaveUserProfileAction } from "@/src/server-actions/User/User"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { profileStore } from "@/src/store/profile/profileStore"
import useUserSkills from "./hooks/useUserSkills"
import useUserInterests from "./hooks/useUserInterests"
import { ProfileData, Tag, TagStatus } from "./types/profile-types.d"

const EditProfileModal: React.FC = () => {
  const bio = useAtomValue(profileStore.bio)
  const user = useAtomValue(userStore.user)
  const setBio = useSetAtom(profileStore.bio)

  const [isOpen, setIsOpen] = useState(false)
  const [editedBio, setEditedBio] = useState<string>(bio)

  const [
    updateProfileLoading,
    updatedProfileData,
    updateProfileError,
    updateProfile
  ] = useServerAction(SaveUserProfileAction)

  const [
    skills,
    setSkills,
    skillSuggestions,
    searchSkills,
    searchSkillsLoading
  ] = useUserSkills()

  const [
    interests,
    setInterests,
    interestSuggestions,
    searchInterests,
    searchInterestsLoading
  ] = useUserInterests()

  const updatedSkillsLength: number = skills.filter(
    (tag) => !tag.deleted
  ).length
  const updatedInterestsLength: number = interests.filter(
    (tag) => !tag.deleted
  ).length
  const skillsError: string =
    updatedSkillsLength > 20 ? "You can only add a maximum of 20 skills" : ""
  const interestsError: string =
    updatedInterestsLength > 20
      ? "You can only add a maximum of 20 interests"
      : ""
  const bioError: string =
    editedBio.length > 2000 ? "Bio cannot exceed 2000 characters" : ""

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const deletedSkillsIds: number[] = skills
      .filter((skill) => skill.deleted && skill.status === TagStatus[1])
      .map((skill) => skill.id as number)
    const deletedInterestsIds: number[] = interests
      .filter(
        (interest) => interest.deleted && interest.status === TagStatus[1]
      )
      .map((interest) => interest.id as number)
    const updatedProfileData: ProfileData = {
      userId: user?.external_auth_id as string,
      bio: editedBio ? editedBio : bio,
      newTags: [
        ...skills
          .filter((tag) => tag.status === TagStatus[3])
          .map((tag) => {
            return { name: tag.name, type: "skill" }
          }),
        ...interests
          .filter((tag) => tag.status === TagStatus[3])
          .map((tag) => {
            return { name: tag.name, type: "interest" }
          })
      ],
      existingTags: [
        ...skills
          .filter((tag) => tag.status === TagStatus[2])
          .map((tag) => {
            return { name: tag.name, id: tag.id, type: "skill" }
          }),
        ...interests
          .filter((tag) => tag.status === TagStatus[2])
          .map((tag) => {
            return { name: tag.name, id: tag.id, type: "interest" }
          })
      ],
      deletedTagsIds: [...deletedSkillsIds, ...deletedInterestsIds]
    }
    await updateProfile(updatedProfileData)
    // remove deleted skills
    setSkills((skills: Tag[]) =>
      skills.filter(
        (tag) => !deletedSkillsIds.includes(tag.id as number) && !tag.deleted
      )
    )
    // remove deleted Interests
    setInterests((interests: Tag[]) =>
      interests.filter(
        (tag) => !deletedInterestsIds.includes(tag.id as number) && !tag.deleted
      )
    )
    editedBio && setBio(editedBio)
    setIsOpen(false)
    setEditedBio("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="edit" size={"sm"} onClick={() => setIsOpen(true)}>
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={saveProfileChanges} className="edit-profile-form">
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-y-7">
              <div className="edit-bio w-full">
                <Label htmlFor="bio" className="edit-label">
                  Bio
                </Label>
                <Textarea
                  id={"bio"}
                  defaultValue={bio}
                  className="min-h-[100px] w-full"
                  onChange={(e) => setEditedBio(e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <p
                    className={`text-sm ${
                      editedBio?.length > 2000
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {editedBio?.length
                      ? editedBio.length
                      : bio?.length
                      ? bio.length
                      : 0}
                    /2000 characters
                  </p>
                  {bioError && (
                    <p className="text-sm text-red-500">{bioError}</p>
                  )}
                </div>
              </div>
              <div className="edit-skills w-full">
                <Label htmlFor="skills" className="edit-label">
                  Skills
                </Label>
                <TagsInput
                  tags={skills}
                  updateTags={setSkills}
                  suggestions={skillSuggestions}
                  onChange={searchSkills}
                  loadingSuggestions={searchSkillsLoading}
                />
                <div className={"flex justify-between mt-1"}>
                  <p
                    className={`text-sm ${
                      updatedSkillsLength > 20
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {`${updatedSkillsLength}/20 skills`}
                  </p>
                  {skillsError && (
                    <p className="text-sm text-red-500">{skillsError}</p>
                  )}
                </div>
              </div>
              <div className="edit-interests w-full">
                <Label htmlFor="interests" className="edit-label">
                  Interests
                </Label>
                <TagsInput
                  tags={interests}
                  updateTags={setInterests}
                  suggestions={interestSuggestions}
                  onChange={searchInterests}
                  loadingSuggestions={searchInterestsLoading}
                />
                <div className={"flex justify-between mt-1"}>
                  <p
                    className={`text-sm ${
                      updatedInterestsLength > 20
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {`${updatedInterestsLength}/20 skills`}
                  </p>
                  {interestsError && (
                    <p className="text-sm text-red-500">{interestsError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                bioError.length > 0 ||
                skillsError.length > 0 ||
                interestsError.length > 0
              }
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditProfileModal
