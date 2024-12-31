import { useEffect, useState } from "react"
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
import { saveUserProfileAction } from "@/src/server-actions/User/User"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { profileStore } from "@/src/store/profile/profileStore"
import useUserSkills from "./hooks/useUserSkills"
import useUserInterests from "./hooks/useUserInterests"
import { ProfileData, Tag } from "./types/profile-types"

const EditProfileModal: React.FC = () => {
  const bio = useAtomValue(profileStore.bio)
  const user = useAtomValue(userStore.user)
  const setBio = useSetAtom(profileStore.bio)

  const [isOpen, setIsOpen] = useState(false)
  const [bioError, setBioError] = useState<string>("")
  const [skillsError, setSkillsError] = useState<string>("")
  const [interestsError, setInterestsError] = useState<string>("")
  const [editedBio, seteditedBio] = useState<string>(bio)

  const [
    updateProfileLoading,
    updatedProfileData,
    updateProfileError,
    updateProfile
  ] = useServerAction(saveUserProfileAction)

  const [
    skills,
    setSkills,
    newSkills,
    setNewSkills,
    selectedSkills,
    setSelectedtedSkills,
    savedSkills,
    setSavedSkills,
    updatedSkills,
    skillSuggestions,
    searchSkillsForUserInput,
    searchSkillsLoading
  ] = useUserSkills()

  const [
    interests,
    setInterests,
    newInterests,
    setNewInterests,
    selectedInterests,
    setSelectedtedInterests,
    savedInterests,
    setSavedInterests,
    updatedInterests,
    interestSuggestions,
    searchInterestsForUserInput,
    searchInterestsLoading
  ] = useUserInterests()

  useEffect(() => {
    updatedSkills.length > 20
      ? setSkillsError("You can only add a maximum of 20 skills")
      : skillsError && setSkillsError("")
  }, [updatedSkills])

  useEffect(() => {
    updatedInterests.length > 20
      ? setInterestsError("You can only add a maximum of 20 interests")
      : interestsError && setInterestsError("")
  }, [updatedInterests])

  const getDeletedIds = (tags: Tag[], savedTags: Tag[]) => [
    ...tags
      .filter(
        (tag: Tag) => !savedTags.find((updatedTag) => tag.id === updatedTag.id)
      )
      .map((tag: Tag) => tag.id as number)
  ]

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const deletedSkillsIds: number[] = getDeletedIds(skills, savedSkills)
    const deletedInterestsIds: number[] = getDeletedIds(
      interests,
      savedInterests
    )
    const updatedProfileData: ProfileData = {
      userId: user?.external_auth_id as string,
      bio: editedBio ? editedBio : bio,
      newTags: [
        ...newSkills.map((tag) => {
          return { name: tag.name, type: "skill" }
        }),
        ...newInterests.map((tag) => {
          return { name: tag.name, type: "interest" }
        })
      ],
      existingTags: [
        ...selectedSkills.map((tag) => {
          return { name: tag.name, id: tag.id, type: "skill" }
        }),
        ...selectedInterests.map((tag) => {
          return { name: tag.name, id: tag.id, type: "skill" }
        })
      ],
      deletedTagsIds: [...deletedSkillsIds, ...deletedInterestsIds]
    }
    await updateProfile(updatedProfileData)
    setSkills((skills: Tag[]) => {
      skills = skills.filter(
        // remove deleted skills
        (tag) => !deletedSkillsIds.includes(tag.id as number)
      )
      return [...skills, ...newSkills, ...selectedSkills]
    })
    setSavedSkills([...skills])
    setSelectedtedSkills([])
    setNewSkills([])
    setInterests((interests: Tag[]) => {
      interests = interests.filter(
        // remove deleted Interests
        (tag) => !deletedInterestsIds.includes(tag.id as number)
      )
      return [...interests, ...newInterests, ...selectedInterests]
    })
    setSavedInterests([...interests])
    setNewInterests([])
    setBio(editedBio)
    setIsOpen(false)
    seteditedBio("")
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    seteditedBio(e.target.value)
    if (e.target.value.length <= 2000) {
      bioError && setBioError("")
    } else {
      setBioError("Bio cannot exceed 2000 characters")
    }
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
                  onChange={handleBioChange}
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
                  tags={updatedSkills}
                  updateSavedTags={setSavedSkills}
                  updateNewTags={setNewSkills}
                  updateSelectedTags={setSelectedtedSkills}
                  suggestions={skillSuggestions}
                  onChange={searchSkillsForUserInput}
                  loadingSuggestions={searchSkillsLoading}
                />
                <div className={"flex justify-between mt-1"}>
                  <p
                    className={`text-sm ${
                      updatedSkills?.length > 20
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {`${updatedSkills.length}/20 skills`}
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
                  tags={updatedInterests}
                  updateNewTags={setNewInterests}
                  updateSavedTags={setSavedInterests}
                  updateSelectedTags={setSelectedtedInterests}
                  suggestions={interestSuggestions}
                  onChange={searchInterestsForUserInput}
                  loadingSuggestions={searchInterestsLoading}
                />
                <div className={"flex justify-between mt-1"}>
                  <p
                    className={`text-sm ${
                      updatedInterests?.length > 20
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {`${updatedInterests.length}/20 skills`}
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
