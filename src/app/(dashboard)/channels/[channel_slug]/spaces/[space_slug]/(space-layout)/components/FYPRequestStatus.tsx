"use client"

import { useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import moment from "moment"
import {
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Info,
  MessageSquare,
  XCircle
} from "lucide-react"
import { Separator } from "@/src/components/ui/separator"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/src/components/ui/accordion"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useCanRequestAdvisor } from "@/src/hooks/useCanRequestAdvisor"
import { GetLatestAdvisorRequestForSpaceAction } from "@/src/server-actions/AdvisorRequest/AdvisorRequest"
import RequestAdvisorButton from "@/src/components/Dashboard/Spaces/RequestAdvisorButton"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"
import { getStudentRequestStatus } from "@/src/utils/advisorRequest"

const STUDENT_STATUS_BADGE: Record<AdvisorRequestStatus, string> = {
  [AdvisorRequestStatus.PENDING]: "bg-slate-500/15 text-slate-500",
  [AdvisorRequestStatus.AWAITING_APPROVAL]: "bg-blue-500/15 text-blue-500",
  [AdvisorRequestStatus.ACCEPTED]: "bg-emerald-500/15 text-emerald-500",
  [AdvisorRequestStatus.REJECTED]: "bg-red-500/15 text-red-500",
  [AdvisorRequestStatus.EXPIRED]: "bg-amber-500/15 text-amber-600"
}

const STUDENT_STATUS_LABEL: Record<AdvisorRequestStatus, string> = {
  [AdvisorRequestStatus.PENDING]: "Pending",
  [AdvisorRequestStatus.AWAITING_APPROVAL]: "Awaiting Approval",
  [AdvisorRequestStatus.ACCEPTED]: "Accepted",
  [AdvisorRequestStatus.REJECTED]: "Rejected",
  [AdvisorRequestStatus.EXPIRED]: "Expired"
}

const STUDENT_STATUS_MESSAGE: Record<AdvisorRequestStatus, string> = {
  [AdvisorRequestStatus.PENDING]:
    "Your request has been submitted and is in process.",
  [AdvisorRequestStatus.AWAITING_APPROVAL]:
    "Your request has been routed to an advisor in your domain for approval. You'll be notified once they respond.",
  [AdvisorRequestStatus.ACCEPTED]:
    "An advisor has accepted your request and has been added to this space.",
  [AdvisorRequestStatus.REJECTED]:
    "Your request was not accepted by any advisor. This request is now closed.",
  [AdvisorRequestStatus.EXPIRED]:
    "No advisor responded in time and this request has expired. You can submit a new request."
}

function normalizeStatus(status: string | undefined): AdvisorRequestStatus {
  return status && status in STUDENT_STATUS_LABEL
    ? (status as AdvisorRequestStatus)
    : AdvisorRequestStatus.PENDING
}

/** The stored `status` column can lag (e.g. a deadline passing with only
 * some advisors having rejected doesn't get swept to a terminal state until
 * the next cron run), so ACCEPTED/REJECTED/EXPIRED are always derived live
 * from the request's own fields. Only the pre-resolution PENDING vs
 * AWAITING_APPROVAL distinction (cosmetic — "submitted" vs "routed to an
 * advisor") falls back to the raw column, since nothing else derives that. */
function resolveDisplayStatus(advisorRequest: {
  status: string
  accepted_by: string | null
  rejected_by: { advisor_id: string; reason: string }[] | null
  advisor_ids: string[] | null
  expiry_date: string
}): AdvisorRequestStatus {
  const computed = getStudentRequestStatus(advisorRequest)
  if (computed !== AdvisorRequestStatus.PENDING) return computed
  return normalizeStatus(advisorRequest.status)
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-"
  const date = moment(value)
  return date.isValid() ? date.format("MMM D, YYYY") : "-"
}

function formatDaysLeft(value: string | null | undefined) {
  if (!value) return null
  const deadline = moment(value).startOf("day")
  if (!deadline.isValid()) return null

  const diffDays = deadline.diff(moment().startOf("day"), "days")

  if (diffDays > 1) return `${diffDays} days left`
  if (diffDays === 1) return "1 day left"
  if (diffDays === 0) return "Due today"
  if (diffDays === -1) return "1 day ago"
  return `${Math.abs(diffDays)} days ago`
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

const STATUS_LEGEND: {
  status: AdvisorRequestStatus
  icon: typeof Clock
  color: string
  description: string
  tag: string
  tagClass: string
}[] = [
  {
    status: AdvisorRequestStatus.PENDING,
    icon: Clock,
    color: "text-slate-500",
    description: "Your request is submitted and is in process.",
    tag: "Submitted",
    tagClass: "border-slate-500/40 text-slate-500"
  },
  {
    status: AdvisorRequestStatus.AWAITING_APPROVAL,
    icon: Clock,
    color: "text-blue-500",
    description: "Your request is routed to the advisor for their response.",
    tag: "In Progress",
    tagClass: "border-blue-500/40 text-blue-500"
  },
  {
    status: AdvisorRequestStatus.ACCEPTED,
    icon: CheckCircle2,
    color: "text-emerald-500",
    description:
      "An advisor has accepted your request. Others are no longer able to respond.",
    tag: "Completed",
    tagClass: "border-emerald-500/40 text-emerald-500"
  },
  {
    status: AdvisorRequestStatus.REJECTED,
    icon: XCircle,
    color: "text-red-500",
    description:
      "All advisors have rejected, or at least one has rejected and the deadline has passed.",
    tag: "Completed",
    tagClass: "border-red-500/40 text-red-500"
  },
  {
    status: AdvisorRequestStatus.EXPIRED,
    icon: Clock,
    color: "text-amber-500",
    description:
      "The deadline has passed and no advisor responded. You can submit a new request.",
    tag: "Action Required",
    tagClass: "border-amber-500/40 text-amber-500"
  }
]

function RequestStatusLegend() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Request Statuses</h2>
      <div className="divide-y divide-foreground/8">
        {STATUS_LEGEND.map(
          ({ status, icon: Icon, color, description, tag, tagClass }) => (
            <div
              key={status}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
              <span className={`text-sm font-medium shrink-0 w-32 ${color}`}>
                {STUDENT_STATUS_LABEL[status]}
              </span>
              <span className="text-sm text-muted-foreground flex-1 min-w-0">
                {description}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded border shrink-0 ${tagClass}`}
              >
                {tag}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function FYPRequestStatus() {
  const space = useAtomValue(spaceStore.currentSpace)
  const [loading, request, , fetchLatestRequest] = useServerAction(
    GetLatestAdvisorRequestForSpaceAction
  )
  const [reasonsOpen, setReasonsOpen] = useState(false)

  const canSubmitRequest = useCanRequestAdvisor(space?.id, space?.is_FYP_enable)

  useEffect(() => {
    if (space?.id) fetchLatestRequest(space.id)
  }, [space?.id])

  if (loading || !space) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  const advisorRequest = request?.success ? request.data : null

  if (!advisorRequest) {
    return (
      <div className="space-y-6">
        <NoDataCard
          icon={
            <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
          }
          title="No Advisor Request Yet"
          description={
            canSubmitRequest
              ? "Submit your project details to request an advisor for this space."
              : "No advisor request has been submitted for this space yet."
          }
        />
        <div className="flex justify-center">
          <RequestAdvisorButton
            space={space}
            onSubmitted={() => fetchLatestRequest(space.id)}
          />
        </div>
        <Separator />
        <RequestStatusLegend />
      </div>
    )
  }

  const status = resolveDisplayStatus(advisorRequest)
  const showResubmit =
    status === AdvisorRequestStatus.REJECTED ||
    status === AdvisorRequestStatus.EXPIRED

  const rejectedReasons = advisorRequest.rejected_by ?? []
  const isFullyResolved = status === AdvisorRequestStatus.REJECTED
  const showRejectionReasonsButton =
    rejectedReasons.length > 0 &&
    status !== AdvisorRequestStatus.ACCEPTED &&
    status !== AdvisorRequestStatus.EXPIRED
  const statusMessage =
    showRejectionReasonsButton && !isFullyResolved
      ? "Some advisors have shared rejection reasons for your request. Other advisors are still reviewing, and a final decision is pending."
      : STUDENT_STATUS_MESSAGE[status]

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-foreground/8 p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">My Advisor Request</h2>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded shrink-0 ${STUDENT_STATUS_BADGE[status]}`}
            >
              {STUDENT_STATUS_LABEL[status]}
            </span>
          </div>

          <div className="space-y-2">
            <FieldRow label="FYP Title" value={advisorRequest.fyp_title} />
            <FieldRow
              label="University Supervisor"
              value={advisorRequest.supervisor_name}
            />
            <FieldRow
              label="Submitted"
              value={formatDate(advisorRequest.created_at)}
            />
            <FieldRow
              label="Response Deadline"
              value={
                formatDaysLeft(advisorRequest.expiry_date)
                  ? `${formatDate(advisorRequest.expiry_date)} (${formatDaysLeft(advisorRequest.expiry_date)})`
                  : formatDate(advisorRequest.expiry_date)
              }
            />
          </div>

          <p
            className={`text-sm rounded-lg p-3 ${
              showRejectionReasonsButton
                ? "bg-red-500/10 text-red-600"
                : "bg-muted/40 text-muted-foreground"
            }`}
          >
            {statusMessage}
          </p>

          {(showRejectionReasonsButton || showResubmit) && (
            <div className="flex justify-end gap-2">
              {showRejectionReasonsButton && (
                <Button
                  variant="outline"
                  className="border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                  onClick={() => setReasonsOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                  See Rejection Reasons
                </Button>
              )}
              {showResubmit && (
                <RequestAdvisorButton
                  space={space}
                  label="Resubmit Request"
                  showIcon={false}
                  variant="default"
                  onSubmitted={() => fetchLatestRequest(space.id)}
                />
              )}
            </div>
          )}
        </div>
        <Separator />
        <RequestStatusLegend />
      </div>

      <Dialog open={reasonsOpen} onOpenChange={setReasonsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              Rejection Reasons
            </DialogTitle>
            <DialogDescription>
              Below are the reasons shared by advisors for rejecting your
              request. Please review them and update your proposal
              accordingly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {!isFullyResolved && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 text-blue-600 p-3 text-sm">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Other advisors are still reviewing your request. You will be
                  notified once a final decision is made.
                </span>
              </div>
            )}

            <Accordion
              type="multiple"
              className="max-h-[320px] overflow-y-auto space-y-2 pr-1"
            >
              {rejectedReasons.map((r, i) => (
                <AccordionItem
                  key={i}
                  value={`reason-${i}`}
                  className="rounded-lg bg-red-500/5 border-none px-3"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <MessageSquare className="h-4 w-4 shrink-0 text-red-500" />
                      Reason {i + 1}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pl-6">
                    {r.reason}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FYPRequestStatus
