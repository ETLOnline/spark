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
import { SaveUserProfileAction } from "@/src/server-actions/User/User"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { profileStore } from "@/src/store/profile/profileStore"
import useUserSkills from "./hooks/useUserSkills"
import useUserInterests from "./hooks/useUserInterests"
import { ProfileData, Tag, TagStatus } from "./types/profile-types.d"
import { useToast } from "@/src/hooks/use-toast"

const EditProfileModal: React.FC = () => {
  const [bio,setBio] = useAtom(profileStore.bio)
  const user = useAtomValue(userStore.AuthUser)

  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [editedBio, setEditedBio] = useState<string | undefined>(bio)
  const [editedSkills, setEditedSkills] = useState<Tag[]>([])
  const [editedInterests, setEditedInterests] = useState<Tag[]>([])

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

  useEffect(() => {
    setEditedInterests([...interests])
  }, [interests])

  useEffect(() => {
    setEditedSkills([...skills])
  }, [skills])

  useEffect(() => {
    if (updateProfileError) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: "Something went wrong. Please try again.",
        duration: 3000
      })
    }
  }, [updateProfileError])

  const updatedSkillsLength: number = editedSkills.filter(
    (tag) => !tag.deleted
  ).length
  const updatedInterestsLength: number = editedInterests.filter(
    (tag) => !tag.deleted
  ).length
  const skillsError: string =
    updatedSkillsLength > 20 ? "You can only add a maximum of 20 skills" : ""
  const interestsError: string =
    updatedInterestsLength > 20
      ? "You can only add a maximum of 20 interests"
      : ""
  const bioError: string =
    editedBio && editedBio?.length > 2000
      ? "Bio cannot exceed 2000 characters"
      : ""

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const deletedSkillsIds: number[] = editedSkills
        .filter((skill) => skill.deleted && skill.status === TagStatus.saved)
        .map((skill) => skill.id as number)
      const deletedInterestsIds: number[] = editedInterests
        .filter(
          (interest) => interest.deleted && interest.status === TagStatus.saved
        )
        .map((interest) => interest.id as number)
      const updatedProfileData: ProfileData = {
        userId: user?.unique_id as string,
        bio: editedBio ? editedBio : bio,
        newTags: [
          ...editedSkills
            .filter((tag) => tag.status === TagStatus.new && !tag.deleted)
            .map((tag) => {
              return { name: tag.name, type: "skill" }
            }),
          ...editedInterests
            .filter((tag) => tag.status === TagStatus.new && !tag.deleted)
            .map((tag) => {
              return { name: tag.name, type: "interest" }
            })
        ],
        existingTags: [
          ...editedSkills
            .filter((tag) => tag.status === TagStatus.selected && !tag.deleted)
            .map((tag) => {
              return { name: tag.name, id: tag.id, type: "skill" }
            }),
          ...editedInterests
            .filter((tag) => tag.status === TagStatus.selected && !tag.deleted)
            .map((tag) => {
              return { name: tag.name, id: tag.id, type: "interest" }
            })
        ],
        deletedTagsIds: [...deletedSkillsIds, ...deletedInterestsIds]
      }
      const res = await updateProfile(updatedProfileData)
      if (res?.success) {
        // remove deleted skills and update skills val in store
        setSkills(() =>
          editedSkills
            .filter(
              (tag) =>
                !deletedSkillsIds.includes(tag.id as number) && !tag.deleted
            )
            .map((tag) => ({ ...tag, status: TagStatus.saved }))
        )
        // remove deleted Interests and update interests val in store
        setInterests(() =>
          editedInterests
            .filter(
              (tag) =>
                !deletedInterestsIds.includes(tag.id as number) && !tag.deleted
            )
            .map((tag) => ({ ...tag, status: TagStatus.saved }))
        )
        if (editedBio) {
          setBio(editedBio)
        }
        setIsOpen(false)
        setEditedBio("")
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
          duration: 3000
        })
      } else {
        throw res?.error
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        duration: 3000
      })
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
                  onChange={(e) => setEditedBio(e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <p
                    className={`text-sm ${
                      editedBio && editedBio?.length > 2000
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {editedBio?.length
                      ? editedBio?.length
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
                interestsError.length > 0 ||
                updateProfileLoading
              }
              loading={updateProfileLoading}
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
