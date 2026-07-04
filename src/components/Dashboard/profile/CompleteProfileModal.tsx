"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { ScrollArea } from "../../ui/scroll-area"
import { Separator } from "../../ui/separator"
import { CalendarDays } from "lucide-react"
import moment from "moment"
import Link from "next/link"
import { SelectProfile, SelectUser } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { SaveUserProfileAction } from "@/src/server-actions/User/User"
import {
  updateUserProfileAction,
  userProfileCompletionAction
} from "@/src/server-actions/profile/profile"
import { MultiSelectOption } from "../../ui/multi-select"
import TagSelect from "../../TagsInput/tags"
import {
  CompletionItem,
  getCompletionItems,
  getCompletionPercentage,
  SimpleTag
} from "./utils/profileCompletion"

interface Props {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  user: SelectUser
  profile?: SelectProfile | null
  skills: SimpleTag[]
  interests: SimpleTag[]
  items: CompletionItem[]
  onSaved?: (payload: {
    profile?: Partial<SelectProfile>
    skills?: SimpleTag[]
    interests?: SimpleTag[]
  }) => void
}

type Errors = Record<string, string>

const tagsToOptions = (tags: SimpleTag[]): MultiSelectOption[] =>
  tags.map((t) => ({ label: t.name, value: String(t.id) }))

const optionsToTags = (options: MultiSelectOption[]): SimpleTag[] =>
  options.map((o) => ({ id: Number(o.value), name: o.label }))

export default function CompleteProfileModal({
  isOpen,
  setIsOpen,
  user,
  profile,
  skills,
  interests,
  items,
  onSaved
}: Props) {
  const { toast } = useToast()

  const isMissing = (key: CompletionItem["key"]) =>
    items.some((i) => i.key === key && !i.completed)

  const showBio = isMissing("bio")
  const showSkills = isMissing("skills")
  const showInterests = isMissing("interests")
  const showEducation = isMissing("education")
  const showAvailability = isMissing("availability")
  const hasEditableFields =
    showBio || showSkills || showInterests || showEducation

  const [bio, setBio] = useState(profile?.bio || "")
  const [degree, setDegree] = useState(profile?.degree || "")
  const [institute, setInstitute] = useState(profile?.institute || "")
  const [eduFrom, setEduFrom] = useState(profile?.education_start_date || "")
  const [eduTo, setEduTo] = useState(profile?.education_end_date || "")

  // Always initialise from existing tags so calling SaveUserProfileAction
  // (which replaces all user tags) never wipes tags that were already set.
  const [selectedSkillTags, setSelectedSkillTags] = useState<
    MultiSelectOption[]
  >(tagsToOptions(skills))
  const [selectedInterestTags, setSelectedInterestTags] = useState<
    MultiSelectOption[]
  >(tagsToOptions(interests))

  const [errors, setErrors] = useState<Errors>({})

  // Re-sync state whenever the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setBio(profile?.bio || "")
      setDegree(profile?.degree || "")
      setInstitute(profile?.institute || "")
      setEduFrom(profile?.education_start_date || "")
      setEduTo(profile?.education_end_date || "")
      setSelectedSkillTags(tagsToOptions(skills))
      setSelectedInterestTags(tagsToOptions(interests))
      setErrors({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[530px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>
            Fill in the remaining details to complete your profile.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] overflow-auto">
          <div className="space-y-5 pr-3">
            {/* Bio */}
            {showBio && (
              <div className="space-y-1">
                <Label htmlFor="cp-bio" className="font-semibold">
                  Bio
                </Label>
                <Textarea
                  id="cp-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add Your Bio..."
                  className="min-h-[100px] w-full"
                  maxLength={2000}
                />
                {errors.bio && (
                  <span className="text-red-500 text-sm">{errors.bio}</span>
                )}
              </div>
            )}

            {/* Interests */}
            {showInterests && (
              <div className="space-y-2">
                <Label className="font-semibold">Interests</Label>
                <TagSelect
                  type="interest"
                  selected={selectedInterestTags}
                  setSelected={setSelectedInterestTags}
                />
                {errors.interests && (
                  <span className="text-red-500 text-sm">
                    {errors.interests}
                  </span>
                )}
              </div>
            )}

            {/* Skills */}
            {showSkills && (
              <div className="space-y-2">
                <Label className="font-semibold">Skills</Label>
                <TagSelect
                  type="skill"
                  selected={selectedSkillTags}
                  setSelected={setSelectedSkillTags}
                />
                {errors.skills && (
                  <span className="text-red-500 text-sm">{errors.skills}</span>
                )}
              </div>
            )}

            {/* Education */}
            {showEducation && (
              <div className="space-y-3">
                <Separator />
                <Label className="font-semibold">Education</Label>
                <div className="space-y-1">
                  <Input
                    placeholder="Degree e.g. BS Computer Science"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                  {errors.degree && (
                    <span className="text-red-500 text-sm">
                      {errors.degree}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Institute e.g. Stanford University"
                    value={institute}
                    onChange={(e) => setInstitute(e.target.value)}
                  />
                  {errors.institute && (
                    <span className="text-red-500 text-sm">
                      {errors.institute}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6 space-y-1">
                    <Input
                      placeholder="From (YYYY)"
                      value={eduFrom}
                      onChange={(e) => setEduFrom(e.target.value)}
                    />
                    {errors.eduFrom && (
                      <span className="text-red-500 text-sm">
                        {errors.eduFrom}
                      </span>
                    )}
                  </div>
                  <div className="col-span-6 space-y-1">
                    <Input
                      placeholder="To (YYYY)"
                      value={eduTo}
                      onChange={(e) => setEduTo(e.target.value)}
                    />
                    {errors.eduTo && (
                      <span className="text-red-500 text-sm">
                        {errors.eduTo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Availability — not editable here, managed on its own page */}
            {showAvailability && (
              <div className="space-y-3">
                <Separator />
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <Label className="font-semibold">Availability</Label>
                    <p className="text-sm text-muted-foreground">
                      Set your mentor availability so mentees know when they can
                      book sessions with you.
                    </p>
                    <Link href="/profile/availability">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                      >
                        Set Availability
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          {/* {hasEditableFields && (
            <Button
              type="button"
              loading={saving || profileCompletionLoading}
              disabled={saving || profileCompletionLoading}
            >
              Save
            </Button>
          )} */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
