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
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"

const editProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name required")
    .max(30, "Maximum 30 characters allowed"),
  last_name: z
    .string()
    .min(1, "Last name required")
    .max(30, "Maximum 30 characters allowed"),
  bio: z
    .string()
    .trim()
    .min(1, "Bio required")
    .max(2000, "Maximum 2000 characters allowed"),
  skill: z
    .array(z.string().min(1, "required"))
    .min(1, "At least one skill is required"),
  interest: z
    .array(z.string().min(1, "required"))
    .min(1, "At least one interest is required")
})

const EditProfileModal: React.FC = () => {
  const bio = useAtomValue(profileStore.bio)
  const user = useAtomValue(userStore.AuthUser)
  const setUser = useSetAtom(userStore.AuthUser)
  const { toast } = useToast()
  const { refreshAuthUser } = useAuthUser()
  const { user: clerkUser } = useUser()

  const [isOpen, setIsOpen] = useState<boolean>(false)

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

  type ProfileFormValues = z.infer<typeof editProfileSchema>
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      bio: bio || "",
      skill: skills.map((s) => s.name),
      interest: interests.map((i) => i.name)
    }
  })

  const formError = form.formState.errors

  const saveProfileChanges: SubmitHandler<ProfileFormValues> = async (data) => {
    try {
      const payload: ProfileData = {
        userId: user?.unique_id || "",
        first_name: data?.first_name,
        last_name: data?.last_name,
        bio: data?.bio || "",
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

        // Update the user state with new first and last name
        if (user) {
          const updatedUser = {
            ...user,
            first_name: data.first_name,
            last_name: data.last_name
          }
          setUser(updatedUser)
        }
        setUserBio(data.bio)
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
    const values = form.getValues()
    const skillIds = selectedSkillTags.map((s) => s.value)
    const originalSkillIds = skills.map((s) => s.id.toString())

    const interestIds = selectedInterestTags.map((i) => i.value)
    const originalInterestIds = interests.map((i) => i.id.toString())

    return (
      values.first_name !== user?.first_name ||
      values.last_name !== user?.last_name ||
      values.bio !== bio ||
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
    if (isOpen) {
      // Reset form fields
      form.reset({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        bio: bio || "",
        skill: skills.map((s) => s.name),
        interest: interests.map((i) => i.name)
      })

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
  }, [isOpen, user, bio, skills, interests])

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setIsOpen(true)
    } else {
      handleClose(false)
    }
  }

  const first_name = form.watch("first_name")
  const last_name = form.watch("last_name")
  const form_bio = form.watch("bio")
  useEffect(() => {
    form.trigger(["first_name", "last_name", "bio"])
  }, [first_name, last_name, form_bio])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button variant="edit" size={"sm"} onClick={() => setIsOpen(true)}>
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[530px]  "
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[78vh] overflow-auto ">
            <form
              className="edit-profile-form pr-3"
              onSubmit={form.handleSubmit(saveProfileChanges)}
            >
              {/* Full Name */}
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-6">
                  <Label htmlFor="first_name" className="font-semibold">
                    First Name
                  </Label>
                  <Controller
                    name="first_name"
                    control={form.control}
                    render={({ field }) => {
                      const charCount = field.value?.length || 0
                      const maxChars = 30
                      return (
                        <>
                          <Input
                            id="first_name"
                            {...field}
                            maxLength={maxChars}
                          />
                          <div className="flex justify-between items-center text-sm text-muted-foreground ">
                            {formError.first_name && (
                              <span className="text-red-500 text-sm">
                                {String(formError.first_name.message)}
                              </span>
                            )}
                            <span className="ml-auto">
                              {/* characters */}
                              {charCount}/{maxChars} characters
                            </span>
                          </div>
                        </>
                      )
                    }}
                  />
                </div>
                <div className="col-span-6">
                  <Label htmlFor="last_name" className="font-semibold">
                    Last Name
                  </Label>
                  <Controller
                    name="last_name"
                    control={form.control}
                    render={({ field }) => {
                      const charCount = field.value?.length || 0
                      const maxChars = 30
                      return (
                        <>
                          <Input
                            id="last_name"
                            {...field}
                            maxLength={maxChars}
                          />
                          <div className="flex justify-between items-center text-sm text-muted-foreground ">
                            {formError.last_name && (
                              <span className="text-red-500 text-sm">
                                {String(formError.last_name.message)}
                              </span>
                            )}
                            <span className="ml-auto">
                              {charCount}/{maxChars} characters
                            </span>
                          </div>
                        </>
                      )
                    }}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="mb-2">
                <Label htmlFor="bio" className="font-semibold">
                  Bio
                </Label>
                <Controller
                  name="bio"
                  control={form.control}
                  render={({ field }) => {
                    const charCount = field.value?.length || 0
                    const maxChars = 2000
                    return (
                      <>
                        <Textarea
                          id={"bio"}
                          {...field}
                          placeholder="Add Your Bio..."
                          className="min-h-[100px] w-full"
                          maxLength={maxChars}
                        />
                        <div className="flex justify-between items-center text-sm text-muted-foreground ">
                          {formError.bio && (
                            <span className="text-red-500 text-sm">
                              {String(formError.bio.message)}
                            </span>
                          )}
                          <span className="ml-auto">
                            {charCount}/{maxChars} characters
                          </span>
                        </div>
                      </>
                    )
                  }}
                />
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label htmlFor="interests" className="font-semibold">
                  Interests
                </Label>

                <Controller
                  name="interest"
                  control={form.control}
                  render={({ field }) => (
                    <TagSelect
                      selected={selectedInterestTags}
                      setSelected={(tags) => {
                        const newTags = tags as MultiSelectOption[]
                        setSelectedInterestTags(newTags)
                        form.setValue(
                          "interest",
                          newTags.map((t) => t.label),
                          { shouldValidate: true }
                        )
                      }}
                      type="interest"
                      control={form.control}
                      {...field}
                    />
                  )}
                />
                {formError.interest && (
                  <span className="text-red-500 text-sm">
                    {String(formError.interest.message)}
                  </span>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills" className="font-semibold">
                  Skills
                </Label>
                <Controller
                  name="skill"
                  control={form.control}
                  render={({ field }) => (
                    <TagSelect
                      selected={selectedSkillTags}
                      setSelected={(tags) => {
                        const newTags = tags as MultiSelectOption[]
                        setSelectedSkillTags(newTags)
                        form.setValue(
                          "skill",
                          newTags.map((t) => t.label),
                          { shouldValidate: true }
                        )
                      }}
                      type="skill"
                      control={form.control}
                      {...field}
                    />
                  )}
                />

                {formError.skill && (
                  <span className="text-red-500 text-sm">
                    {String(formError.skill.message)}
                  </span>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t mt-4">
                <Button
                  type="submit"
                  loading={updateProfileLoading}
                  disabled={updateProfileLoading}
                >
                  Save Changes
                </Button>
              </div>
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
