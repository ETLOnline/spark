"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
import { Progress } from "../../ui/progress"
import { CheckCircle2, Circle, Sparkles } from "lucide-react"
import { SelectProfile, SelectUser } from "@/src/db/schema"
import CompleteProfileModal from "./CompleteProfileModal"
import {
  getCompletionItems,
  getCompletionPercentage,
  SimpleTag
} from "./utils/profileCompletion"

interface Props {
  user: SelectUser
  profile?: SelectProfile | null
  skills: SimpleTag[]
  interests: SimpleTag[]
  isMentor?: boolean
  hasAvailability?: boolean
  /** Called after a successful save so the parent can refresh its own state. */
  onProfileUpdated?: (payload: { profile?: Partial<SelectProfile> }) => void
}

export default function ProfileCompletionCard({
  user,
  profile,
  skills: initialSkills,
  interests: initialInterests,
  isMentor,
  hasAvailability,
  onProfileUpdated
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  // Local snapshot so the percentage updates instantly after a save,
  // without needing a full page refresh.
  const [profileState, setProfileState] = useState<
    Partial<SelectProfile> | null | undefined
  >(profile)
  const [skills, setSkills] = useState<SimpleTag[]>(initialSkills)
  const [interests, setInterests] = useState<SimpleTag[]>(initialInterests)

  const items = useMemo(
    () =>
      getCompletionItems({
        profile: profileState,
        skills,
        interests,
        isMentor,
        hasAvailability
      }),
    [profileState, skills, interests, isMentor, hasAvailability]
  )

  console.log("ProfileCompletionCard items:", items) // Debugging log

  const percentage = getCompletionPercentage(items)

  // const handleSaved = (payload: {
  //   profile?: Partial<SelectProfile>
  //   skills?: SimpleTag[]
  //   interests?: SimpleTag[]
  // }) => {
  //   if (payload.profile)
  //     setProfileState((prev) => ({ ...prev, ...payload.profile }))
  //   if (payload.skills) setSkills(payload.skills)
  //   if (payload.interests) setInterests(payload.interests)

  //   onProfileUpdated?.({ profile: payload.profile })
  // }

  // Hide the card once the profile is fully complete. Keep it mounted while
  // the modal is open so an in-modal action (e.g. picture upload) that reaches
  // 100% doesn't unmount the modal mid-flow.
  const isComplete = percentage >= 100
  if (isComplete && !isOpen) return null

  return (
    <>
      {!isComplete && (
        <Card className=" border-primary/30">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Complete your profile
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A complete profile helps you stand out.
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary shrink-0">
                {percentage}%
              </span>
            </div>

            <Progress value={percentage} className="h-2" />

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-1.5 text-sm"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      item.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="w-full sm:w-auto"
              onClick={() => setIsOpen(true)}
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      )}

      <CompleteProfileModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user}
        profile={profileState as SelectProfile | null | undefined}
        skills={skills}
        interests={interests}
        items={items}
        // onSaved={handleSaved}
      />
    </>
  )
}
