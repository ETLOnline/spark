import { useRef, useState } from "react"
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
import { UpdateBioForUser } from "@/src/server-actions/User/User"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { profileStore } from "@/src/store/profile/profileStore"
import useUserSkills from "./hooks/useUserSkills"
import useUserInterests from "./hooks/useUserInterests"

const EditProfileModal: React.FC = () => {
  const bio = useAtomValue(profileStore.bio)
  const user = useAtomValue(userStore.user)
  const setBio = useSetAtom(profileStore.bio)

  const [isOpen, setIsOpen] = useState(false)

  const editedBio = useRef<string>(bio)

  const [updateBioLoading, updatedBioData, updateBioError, updateBio] =
    useServerAction(UpdateBioForUser)

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
    searchSkillsLoading,
    updateSkills
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
    searchInterestsLoading,
    updateInterests
  ] = useUserInterests()

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editedBio.current.length && editedBio.current !== bio && user) {
      await updateBio(user.external_auth_id, editedBio.current)
      setBio(editedBio.current)
    }
    updatedSkills.length && (await updateSkills())
    updatedInterests.length &&
      (await updateInterests())
    setIsOpen(false)
    editedBio.current = ""
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    (editedBio.current = e.target.value)
                  }
                />
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
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditProfileModal
