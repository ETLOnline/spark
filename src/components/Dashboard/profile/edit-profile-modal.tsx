import { useEffect, useState } from "react"
import { Input } from "../../ui/input"
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
import { ProfileData } from "./types/profile-types"
import { useToast } from "@/src/hooks/use-toast"
import { MultiSelectOption } from "../../ui/multi-select"
import useUserProfile from "./hooks/useUserProfile"
import TagSelect from "../../TagsInput/tags"
import { ScrollArea } from "../../ui/scroll-area"
import { useAuthUser } from "@/src/hooks/useAuthUser"
import { useUser } from "@clerk/nextjs"
import { UnsavedChangesDialog } from "../../common/unsavedChangesDialog"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"

const EditProfileModal: React.FC = () => {
  const bio = useAtomValue(profileStore.bio)
  const user = useAtomValue(userStore.AuthUser)
  const setBio = useSetAtom(profileStore.bio)
  const setUser = useSetAtom(userStore.AuthUser)
  const [firstName, setFirstName] = useState<string>(user?.first_name || "")
  const [lastName, setLastName] = useState<string>(user?.last_name || "")
  const { toast } = useToast()
  const { refreshAuthUser } = useAuthUser()
  const { user: clerkUser } = useUser()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [editedBio, setEditedBio] = useState<string | undefined>(bio)

  const [selectedSkillTags, setSelectedSkillTags] = useState<
    MultiSelectOption[]
  >([])
  const [selectedInterestTags, setSelectedInterestTags] = useState<
    MultiSelectOption[]
  >([])

  const [setUserBio, setUserSkills, setUserInterests, skills, interests] =
    useUserProfile()

  const [
    updateProfileLoading,
    updatedProfileData,
    updateProfileError,
    updateProfile
  ] = useServerAction(SaveUserProfileAction)

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

  useEffect(() => {
    if (bio) {
      setEditedBio(bio)
    }
  }, [bio])

  // Update first and last name state when user changes
  useEffect(() => {
    if (user?.first_name) {
      setFirstName(user.first_name)
    }
    if (user?.last_name) {
      setLastName(user.last_name)
    }
  }, [user?.first_name, user?.last_name])

  // set user skills in tagsInput
  useEffect(() => {
    setSelectedSkillTags(
      skills.map((s) => ({
        label: s.name,
        value: s.id.toString()
      }))
    )
  }, [skills])

  // set user interest in tagsInput
  useEffect(() => {
    setSelectedInterestTags(
      interests.map((i) => ({
        label: i.name,
        value: i.id.toString()
      }))
    )
  }, [interests])

  const firstNameError: string =
    firstName && firstName?.length > 30
      ? "First Name cannot exceed 30 characters"
      : firstName?.length === 0
        ? "First name required"
        : ""

  const lastNameError: string =
    lastName && lastName?.length > 30
      ? "Last Name cannot exceed 30 characters"
      : lastName?.length === 0
        ? "Last name required"
        : ""
  const skillsError: string =
    selectedSkillTags.length > 20
      ? "You can only add a maximum of 20 skills"
      : selectedSkillTags.length === 0
        ? "Please add at least one skill"
        : ""

  const interestsError: string =
    selectedInterestTags.length > 20
      ? "You can only add a maximum of 20 interests"
      : selectedInterestTags.length === 0
        ? "Please add at least one interest"
        : ""

  const bioError: string =
    editedBio && editedBio?.length > 2000
      ? "Bio cannot exceed 2000 characters"
      : editedBio?.length === 0
        ? "Bio required"
        : ""

  const saveProfileChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (
        firstNameError ||
        lastNameError ||
        bioError ||
        skillsError ||
        interestsError
      ) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fix the errors before saving.",
          duration: 3000
        })
        return
      }
      const payload: ProfileData = {
        userId: user?.unique_id || "",
        first_name: firstName,
        last_name: lastName,
        bio: editedBio || "",
        skills: selectedSkillTags.map((s) => Number(s.value)),
        interests: selectedInterestTags.map((i) => Number(i.value))
      }
      const res = await updateProfile(payload)
      if (res?.success) {
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
          duration: 2000
        })
        setIsOpen(false)
        setBio(editedBio ?? "")

        // Update the user state with new first and last name
        if (user) {
          setUser({
            ...user,
            first_name: firstName,
            last_name: lastName
          })
        }

        // Reload Clerk user to sync the updated names
        await clerkUser?.reload()

        // Refresh auth user to get latest data from database
        await refreshAuthUser()

        setUserInterests(
          selectedInterestTags.map((tag) => ({
            name: tag.label,
            id: Number(tag.value),
            updated_at: null,
            created_at: null,
            deleted_at: null,
            type: "interest",
            count: 1
          }))
        )
        setUserSkills(
          selectedSkillTags.map((tag) => ({
            name: tag.label,
            id: Number(tag.value),
            updated_at: null,
            created_at: null,
            deleted_at: null,
            type: "skill",
            count: 1
          }))
        )
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

  const handleUnsavedChanges = () => {
    const skillIds = selectedSkillTags.map((s) => s.value)
    const originalSkillIds = skills.map((s) => s.id.toString())

    const interestIds = selectedInterestTags.map((i) => i.value)
    const originalInterestIds = interests.map((i) => i.id.toString())

    return (
      firstName !== user?.first_name ||
      lastName !== user?.last_name ||
      bio !== editedBio ||
      !skillIds.every((id, idx) => id === originalSkillIds[idx]) ||
      !interestIds.every((id, idx) => id === originalInterestIds[idx])
    )
  }

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: handleUnsavedChanges(),
      onClose: () => setIsOpen(false)
    })

  useEffect(() => {
    if (!isOpen) {
      setEditedBio(bio)
      setFirstName(user?.first_name || "")
      setLastName(user?.last_name || "")
      setUserBio(bio || "")
      setSelectedSkillTags(
        skills.map((s) => ({
          label: s.name,
          value: s.id.toString()
        }))
      )
      setSelectedInterestTags(
        interests.map((i) => ({
          label: i.name,
          value: i.id.toString()
        }))
      )
    }
  }, [isOpen])

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setIsOpen(true)
    } else {
      handleClose(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogChange} modal={false}>
        <DialogTrigger asChild>
          <Button variant="edit" size={"sm"} onClick={() => setIsOpen(true)}>
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[78vh] overflow-auto">
            <form
              onSubmit={saveProfileChanges}
              className="edit-profile-form pr-3"
            >
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-y-7">
                  <div className="edit-names w-full flex gap-4">
                    <div className="w-1/2">
                      <Label htmlFor="firstName" className="edit-label">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                      />
                      {firstNameError && (
                        <p className="text-sm text-red-500">{firstNameError}</p>
                      )}
                    </div>
                    <div className="w-1/2">
                      <Label htmlFor="lastName" className="edit-label">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                      />
                      {lastNameError && (
                        <p className="text-sm text-red-500">{lastNameError}</p>
                      )}
                    </div>
                  </div>
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
                    <TagSelect
                      type="skill"
                      selected={selectedSkillTags}
                      setSelected={setSelectedSkillTags}
                    />
                    <div className={"flex justify-between mt-1"}>
                      <p
                        className={`text-sm ${
                          selectedSkillTags.length > 20
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {`${selectedSkillTags.length}/20 skills`}
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
                    <TagSelect
                      type="interest"
                      selected={selectedInterestTags}
                      setSelected={setSelectedInterestTags}
                    />
                    <div className={"flex justify-between mt-1"}>
                      <p
                        className={`text-sm ${
                          selectedInterestTags.length > 20
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {`${selectedInterestTags.length}/20 skills`}
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
                    firstNameError.length > 0 ||
                    lastNameError.length > 0 ||
                    updateProfileLoading
                  }
                  loading={updateProfileLoading}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={setIsOpen}
      />
    </>
  )
}

export default EditProfileModal
