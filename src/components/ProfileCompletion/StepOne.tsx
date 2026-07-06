"use client"

import type React from "react"
import {
  Dispatch,
  SetStateAction,
  use,
  useEffect,
  useRef,
  useState
} from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Upload, User } from "lucide-react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SelectUser } from "@/src/db/schema"
import { ProfileData } from "../Dashboard/profile/types/profile-types"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetUserProfileAction,
  SaveUserProfileAction,
  UpdateUserProfilePictureAction
} from "@/src/server-actions/User/User"
import { useToast } from "@/src/hooks/use-toast"
import { MultiSelectOption } from "../ui/multi-select"
import TagSelect from "../TagsInput/tags"
import { useUser } from "@clerk/nextjs"

interface StepOneProps {
  step: number
  setStep: Dispatch<SetStateAction<number>>
  user: SelectUser
  setUser: Dispatch<SetStateAction<SelectUser | undefined>>
  isMentor?: boolean
}

const baseProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, "First Name Required")
    .max(30, "Maximum 30 characters allowed"),
  last_name: z
    .string()
    .min(1, "Last Name Required")
    .max(30, "Maximum 30 characters allowed"),
  bio: z
    .string()
    .min(1, "Bio Required")
    .max(2000, "Maximum 2000 characters allowed"),
  skill: z
    .array(z.string().min(1, "required"))
    .min(1, "At least one skill is required"),
  interest: z
    .array(z.string().min(1, "required"))
    .min(1, "At least one interest is required")
})

// Mentors also supply professional title + company on this step
const mentorProfileSchema = baseProfileSchema.extend({
  professional_title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Maximum 100 characters"),
  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Maximum 100 characters")
})

export function StepOne({
  step,
  setStep,
  user,
  setUser,
  isMentor = false
}: StepOneProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user: clerkUser } = useUser()

  const [selectedSkillTags, setSelectedSkillTags] = useState<
    MultiSelectOption[]
  >([])
  const [selectedInterestTags, setSelectedInterestTags] = useState<
    MultiSelectOption[]
  >([])
  const [currentImageUrl, setCurrentImageUrl] = useState(user?.profile_url)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [
    updateProfileLoading,
    updatedProfileData,
    updateProfileError,
    updateProfile
  ] = useServerAction(SaveUserProfileAction)

  const [loading, userData, error, updateUserProfile] = useServerAction(
    UpdateUserProfilePictureAction
  )

  const schema = isMentor ? mentorProfileSchema : baseProfileSchema
  type ProfileFormValues = z.infer<typeof schema>

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      bio: "",
      skill: [],
      interest: [],
      professional_title: "",
      company: ""
    } as any
  })

  const formError = form.formState.errors

  useEffect(() => {
    if (user) {
      form.setValue("first_name", user.first_name)
      form.setValue("last_name", user.last_name)
    }
  }, [user])

  useEffect(() => {
    if (user.profile?.bio) {
      form.setValue("bio", user.profile?.bio)
    }
    if (isMentor && user.profile) {
      const profile = user.profile as any
      if (profile.professional_title)
        form.setValue("professional_title" as any, profile.professional_title)
      if (profile.company) form.setValue("company" as any, profile.company)
    }
  }, [user.profile?.bio])

  useEffect(() => {
    const getUserProfile = async () => {
      const res = await GetUserProfileAction(user.unique_id)
      if (res.success && res.data) {
        const skill = res.data.tags.filter((s) => s.type === "skill")
        setSelectedSkillTags(
          skill.map((s) => ({ label: s.name, value: String(s.id) }))
        )

        const interest = res.data.tags.filter((s) => s.type === "interest")
        setSelectedInterestTags(
          interest.map((s) => ({ label: s.name, value: String(s.id) }))
        )
      }
    }
    getUserProfile()
  }, [user])

  useEffect(() => {
    if (selectedSkillTags) {
      form.setValue(
        "skill",
        selectedSkillTags.map((tag) => tag.value),
        { shouldDirty: true }
      )
      if (form.formState.errors.skill) {
        form.trigger("skill")
      }
    }

    if (selectedInterestTags) {
      form.setValue(
        "interest",
        selectedInterestTags.map((tag) => tag.value),
        { shouldDirty: true }
      )
      if (form.formState.errors.interest) {
        form.trigger("interest")
      }
    }
  }, [selectedSkillTags, selectedInterestTags])

  const handlePrevious = () => {
    setStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const saveProfileChanges = async (data: any) => {
    try {
      setIsTransitioning(true)
      const payload: ProfileData = {
        ...data,
        userId: user.unique_id,
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        skills: data.skill,
        interests: data.interest,
        ...(isMentor && {
          professional_title: data.professional_title,
          company: data.company
        })
      }
      const res = await updateProfile(payload)
      await clerkUser?.reload()
      if (res?.success) {
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
          duration: 2000
        })

        setStep((prev) => prev + 1)
        window.scrollTo(0, 0)
      } else {
        setIsTransitioning(false)
      }
    } catch {
      toast({
        title: "Failed to update profile",
        description: "Please try again later.",
        variant: "destructive",
        duration: 2000
      })
      setIsTransitioning(false)
    }
  }

  const handleUploadProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        const res = await updateUserProfile(file.name, base64, file.type)
        if (res?.success && res.data) {
          setCurrentImageUrl(res.data.profile_picture_url)
          toast({
            title: "Profile picture updated!",
            description: "Your profile picture has been successfully updated.",
            duration: 3000
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: res?.error || "Failed to update profile picture",
            duration: 3000
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong",
          duration: 3000
        })
      }
    }
    reader.readAsDataURL(file)
  }
  const first_name = form.watch("first_name")
  const last_name = form.watch("last_name")
  useEffect(() => {
    form.trigger(["first_name", "last_name"])
  }, [first_name, last_name])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Tell us about yourself</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Picture */}
        <div className="space-y-3">
          <Label>Profile Picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentImageUrl || ""} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              loading={loading}
              disabled={loading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {currentImageUrl ? "Change Picture" : "Upload Picture"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleUploadProfile}
            />
          </div>
        </div>

        <form onSubmit={form.handleSubmit(saveProfileChanges)}>
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
                      <Input id="first_name" {...field} maxLength={maxChars} />
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
                      <Input id="last_name" {...field} maxLength={maxChars} />
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
                  setSelected={setSelectedInterestTags}
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
                  setSelected={setSelectedSkillTags}
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

          {/* Professional Title + Company — shown for mentors only */}
          {isMentor && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Mentor Details</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Shown on your public mentor profile
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="professional_title" className="font-semibold">
                    Professional Title
                  </Label>
                  <Controller
                    name={"professional_title" as any}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="professional_title"
                        placeholder="e.g. Senior Engineer"
                        {...field}
                      />
                    )}
                  />
                  {(formError as any).professional_title && (
                    <span className="text-red-500 text-xs">
                      {String((formError as any).professional_title.message)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="company" className="font-semibold">
                    Company / Organisation
                  </Label>
                  <Controller
                    name={"company" as any}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="company"
                        placeholder="e.g. Google"
                        {...field}
                      />
                    )}
                  />
                  {(formError as any).company && (
                    <span className="text-red-500 text-xs">
                      {String((formError as any).company.message)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="flex justify-between pt-6 border-t mt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button
                type="submit"
                loading={updateProfileLoading}
                disabled={isTransitioning}
              >
                Next
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
