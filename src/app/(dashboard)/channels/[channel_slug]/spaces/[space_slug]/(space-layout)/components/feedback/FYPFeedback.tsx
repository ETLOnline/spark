"use client"

import { useEffect, useMemo, useState } from "react"
import { useAtomValue } from "jotai"
import { CheckCircle2, Clock, Send, ShieldOff } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { Checkbox } from "@/src/components/ui/checkbox"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { spaceStore } from "@/src/store/space/spaceStore"
import {
  GetMyProgramFeedbackAction,
  SubmitProgramFeedbackAction
} from "@/src/server-actions/ProgramFeedback/ProgramFeedback"
import { GetMilestonesForSpaceAction } from "@/src/server-actions/Milestone/Milestone"
import { SelectProgramFeedback } from "@/src/db/schema"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import type { SelectFypMilestone } from "@/src/db/schema"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { cn } from "@/src/lib/utils"
import {
  getFeedbackFieldsForRole,
  getFeedbackSectionsForRole,
  FeedbackField,
  FeedbackRole
} from "./constants"
import { RatingInput } from "./RatingInput"
import { FeedbackRightRail } from "./FeedbackRightRail"

type FieldValue = number | string | string[] | null

function initialAnswers(fields: FeedbackField[]): Record<string, FieldValue> {
  return Object.fromEntries(
    fields.map((f) => [
      f.key,
      f.type === "multi_choice" ? [] : f.type === "rating" ? 0 : ""
    ])
  )
}

function FeedbackFieldRow({
  field,
  value,
  onChange
}: {
  field: FeedbackField
  value: FieldValue
  onChange: (value: FieldValue) => void
}) {
  if (field.type === "rating" || field.type === "single_choice") {
    return (
      <div className="py-4 border-b last:border-0 flex items-center justify-between gap-4">
        <p className="text-sm flex-1">{field.question}</p>

        {field.type === "rating" && (
          <RatingInput
            value={(value as number) ?? 0}
            onChange={(v) => onChange(v)}
          />
        )}

        {field.type === "single_choice" && (
          <div className="flex flex-wrap justify-end gap-2 shrink-0">
            {field.options?.map((opt) => (
              <Button
                key={opt}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange(opt)}
                className={cn(
                  "cursor-pointer",
                  value === opt && "border-primary bg-primary/5 text-primary"
                )}
              >
                {opt}
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="py-4 border-b last:border-0 space-y-3">
      <p className="text-sm">{field.question}</p>

      {field.type === "multi_choice" && (
        <div className="flex flex-wrap gap-3">
          {field.options?.map((opt) => {
            const selected = ((value as string[]) ?? []).includes(opt)
            return (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = (value as string[]) ?? []
                    onChange(
                      checked
                        ? [...current, opt]
                        : current.filter((o) => o !== opt)
                    )
                  }}
                />
                {opt}
              </label>
            )
          })}
        </div>
      )}

      {field.type === "text" && (
        <Textarea
          rows={3}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

function FYPFeedback() {
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const spaceId = currentSpace?.id
  const { toast } = useToast()

  // Same requirement as milestone actions: both the advisor and the student
  // must also hold the space-scoped editor/admin role for this specific
  // space, not just the matching global role — otherwise any industry_partner
  // or student user anywhere on the platform would qualify, not just the
  // advisor accepted on this space / the student who owns it.
  const { permissionChecker: globalChecker } = usePermissionChecker("global")
  const { permissionChecker: spaceChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    spaceId
  )
  const isSpaceEditor = spaceChecker?.canAccess("space.update") ?? false
  const canSubmitAsAdvisor =
    isSpaceEditor &&
    (globalChecker?.canAccess("fyp.feedback.submit_advisor") ?? false)
  const canSubmitAsStudent =
    isSpaceEditor &&
    (globalChecker?.canAccess("fyp.feedback.submit_student") ?? false)
  const role: FeedbackRole | null = canSubmitAsAdvisor
    ? "advisor"
    : canSubmitAsStudent
      ? "student"
      : null

  const roleFields = useMemo(
    () => (role ? getFeedbackFieldsForRole(role) : []),
    [role]
  )
  const roleSections = useMemo(
    () => (role ? getFeedbackSectionsForRole(role) : []),
    [role]
  )

  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState<SelectProgramFeedback | null>(
    null
  )
  const [milestones, setMilestones] = useState<SelectFypMilestone[]>([])
  const [answers, setAnswers] = useState<Record<string, FieldValue>>({})

  useEffect(() => {
    setAnswers(initialAnswers(roleFields))
  }, [roleFields])

  const [, , , getMyFeedback] = useServerAction(GetMyProgramFeedbackAction)
  const [, , , getMilestones] = useServerAction(GetMilestonesForSpaceAction)
  const [isSubmitting, , , submitFeedback] = useServerAction(
    SubmitProgramFeedbackAction
  )

  useEffect(() => {
    if (!spaceId) return
    setLoading(true)
    Promise.all([getMyFeedback(spaceId), getMilestones(spaceId)])
      .then(([feedbackRes, milestonesRes]) => {
        if (feedbackRes?.success) {
          setSubmitted(
            (feedbackRes.data as SelectProgramFeedback | null) ?? null
          )
        }
        if (milestonesRes?.success && milestonesRes.data) {
          setMilestones(milestonesRes.data as SelectFypMilestone[])
        }
      })
      .finally(() => setLoading(false))
  }, [spaceId])

  const verifiedMilestones = milestones.filter(
    (m) => m.status === MilestoneStatus.VERIFIED
  ).length

  const sections = useMemo(
    () =>
      roleSections.map((section, i) => ({
        section,
        number: i + 1,
        fields: roleFields.filter((f) => f.section === section)
      })),
    [roleSections, roleFields]
  )

  const handleChange = (key: string, value: FieldValue) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!spaceId || !role) return

    const missingRating = roleFields.some(
      (f) => f.type === "rating" && !answers[f.key]
    )
    if (missingRating) {
      toast({ title: "Please provide all ratings", variant: "destructive" })
      return
    }

    const answerSnapshot = roleFields.map((f) => ({
      key: f.key,
      question: f.question,
      type: f.type,
      value: answers[f.key]
    }))

    const partnerRating =
      role === "student"
        ? (answers.guidance_satisfaction as number)
        : (answers.team_engagement as number)

    const res = await submitFeedback(spaceId, {
      overall_program_rating: answers.overall_program_rating as number,
      spark_overall_rating: answers.spark_overall_rating as number,
      partner_rating: partnerRating,
      answers: answerSnapshot
    })

    if (res?.success && res.data) {
      setSubmitted(res.data as SelectProgramFeedback)
      toast({ title: "Feedback submitted — thank you!" })
    } else {
      toast({
        title: (res as { message?: string })?.message ?? "Failed to submit",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  if (!role) {
    return (
      <NoDataCard
        icon={<ShieldOff className="h-16 w-16 text-muted-foreground mb-4" />}
        title="No feedback form available"
        description="Only the assigned advisor and student group members can submit program feedback for this space."
      />
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <h2 className="text-base font-semibold">
          Thanks for your feedback!
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your feedback has been recorded and is reflected in the
          Recommendations section.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Program Feedback</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Your feedback helps us improve the FYP Advisory Program and the
            SPARK platform for future cohorts.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <Clock className="h-3.5 w-3.5" />
          Time to complete: ~10 min
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-2.5">
        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            All project milestones are completed.
          </p>
          <p className="text-xs text-emerald-600/80">
            We&apos;d love to hear about your experience!
          </p>
        </div>
      </div>

      <div className="flex items-start gap-5">
        <div className="rounded-xl border overflow-hidden flex-1 min-w-0">
          {sections.map(({ section, number, fields }) => (
            <div key={section} className="border-b last:border-0">
              <div className="bg-muted/40 px-4 py-2.5">
                <p className="text-sm font-semibold">
                  {number}. {section}
                </p>
              </div>
              <div className="px-4">
                {fields.map((field) => (
                  <FeedbackFieldRow
                    key={field.key}
                    field={field}
                    value={answers[field.key]}
                    onChange={(v) => handleChange(field.key, v)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3 px-4 py-4">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </div>

        <FeedbackRightRail
          totalMilestones={milestones.length}
          verifiedMilestones={verifiedMilestones}
        />
      </div>
    </div>
  )
}

export default FYPFeedback
