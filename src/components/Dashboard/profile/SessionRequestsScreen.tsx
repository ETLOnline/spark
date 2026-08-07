"use client"

import { useCallback, useEffect, useState } from "react"
import moment from "moment-timezone"
import { CalendarDays, RefreshCw, User, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetSessionRequestsForMentorByStatusAction,
  RespondToSessionRequestAction
} from "@/src/server-actions/Mentor/MentorActions"
import { toast } from "@/src/hooks/use-toast"
import { SelectSessionRequest } from "@/src/db/schema"
import { countOccurrences } from "@/src/utils/time"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import AcceptSessionRequestDialog from "./AcceptSessionRequestDialog"
import SuggestNewSlotDialog from "./SuggestNewSlotDialog"
import PaginationComponent from "@/src/components/common/Pagination"
import type { PaginationType } from "@/src/components/common/types/pagination.type"

const REQUESTS_PAGE_SIZE = 10

interface MenteeInfo {
  unique_id: string
  first_name: string
  last_name: string
  profile_url: string | null
  profile: {
    bio: string | null
    institute: string | null
    degree: string | null
  } | null
}

export type SessionRequestWithMentee = SelectSessionRequest & {
  mentee: MenteeInfo
}

type StatusTab = "pending" | "accepted" | "rejected"

function formatSlot(request: SessionRequestWithMentee) {
  const date = moment(request.session_date, "YYYY-MM-DD").format(
    "dddd, MMM D, YYYY"
  )
  const start = moment(request.start_time, "HH:mm").format("h:mm A")
  const end = moment(request.end_time, "HH:mm").format("h:mm A")
  return `${date} · ${start} – ${end}`
}

/** "Every Monday · 3 sessions · through Jul 31, 2026" — null for a one-time request. */
function formatRecurrence(request: SessionRequestWithMentee) {
  if (request.repeat_type === "none") return null
  const cadence =
    request.repeat_type === "daily"
      ? "Every day"
      : `Every ${moment(request.session_date, "YYYY-MM-DD").format("dddd")}`
  const count = countOccurrences({
    date: request.session_date,
    repeat_type: request.repeat_type,
    repeat_end_date: request.repeat_end_date
  })
  const countLabel =
    count === Infinity ? "ongoing" : `${count} session${count === 1 ? "" : "s"}`
  const untilLabel = request.repeat_end_date
    ? ` · through ${moment(request.repeat_end_date, "YYYY-MM-DD").format("MMM D, YYYY")}`
    : ""
  return `${cadence} · ${countLabel}${untilLabel}`
}

interface Props {
  mentorId: string
}

export function SessionRequestsScreen({ mentorId }: Props) {
  const [activeStatus, setActiveStatus] = useState<StatusTab>("pending")
  const [currentPage, setCurrentPage] = useState(1)
  const [requests, setRequests] = useState<SessionRequestWithMentee[]>([])
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: REQUESTS_PAGE_SIZE,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] =
    useState<SessionRequestWithMentee | null>(null)
  const [showWorkspaceDialog, setShowWorkspaceDialog] = useState(false)

  // Suggest slot — separate dialog
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false)

  // Reject — inline reason field directly on the list row
  const [rejectingRequest, setRejectingRequest] =
    useState<SessionRequestWithMentee | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const [, , , getRequestsByStatus] = useServerAction(
    GetSessionRequestsForMentorByStatusAction
  )
  const [responding, , , respondToRequest] = useServerAction(
    RespondToSessionRequestAction
  )

  const loadRequests = useCallback(async () => {
    setLoading(true)
    const res = await getRequestsByStatus(
      mentorId,
      activeStatus,
      currentPage,
      REQUESTS_PAGE_SIZE
    )
    if (res?.success) {
      setRequests((res.data as SessionRequestWithMentee[]) ?? [])
      if (res.pagination) setPagination(res.pagination)
    }
    setLoading(false)
  }, [mentorId, activeStatus, currentPage])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleStatusTabChange = (status: StatusTab) => {
    setActiveStatus(status)
    setCurrentPage(1)
  }

  const handleRejectClick = (request: SessionRequestWithMentee) => {
    setRejectReason("")
    setRejectingRequest(request)
  }

  const handleRejectCancel = () => {
    setRejectingRequest(null)
    setRejectReason("")
  }

  const handleRejectConfirm = async () => {
    if (!rejectingRequest) return
    const res = await respondToRequest(
      rejectingRequest.id,
      "rejected",
      undefined,
      rejectReason.trim() || undefined
    )
    if (res?.success) {
      setRejectingRequest(null)
      setRejectReason("")
      await loadRequests()
      toast({ title: "Request rejected", duration: 3000 })
    } else {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: res?.error ?? "Please try again.",
        duration: 3000
      })
    }
  }

  const handleSuggestClick = (request?: SessionRequestWithMentee) => {
    const target = request ?? selectedRequest
    if (!target) return
    setSelectedRequest(target)
    setSuggestDialogOpen(true)
  }

  const emptyMessage =
    activeStatus === "pending"
      ? "No pending session requests"
      : activeStatus === "accepted"
        ? "No accepted session requests"
        : "No rejected session requests"

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-3">
      <Tabs
        value={activeStatus}
        onValueChange={(v) => handleStatusTabChange(v as StatusTab)}
      >
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeStatus} className="flex flex-col gap-3 mt-3">
          {loading && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading requests…
            </p>
          )}

          {!loading && requests.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {emptyMessage}
            </p>
          )}

          {requests.map((request) => (
            <div
              key={request.id}
              className="text-left rounded-lg border border-foreground/8 p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={request.mentee.profile_url || ""} />
                  <AvatarFallback>{request.mentee.first_name}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {request.mentee.first_name} {request.mentee.last_name}
                    </p>
                    <span className="text-xs text-muted-foreground border border-foreground/10 rounded px-1.5 py-0.5 shrink-0 flex items-center gap-1">
                      {request.session_type === "group" ? (
                        <Users className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {request.session_type === "group" ? "Group" : "1-on-1"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {request.topic}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    {formatSlot(request)}
                  </p>
                  {formatRecurrence(request) && (
                    <p className="text-xs text-primary flex items-center gap-1 mt-1">
                      <RefreshCw className="h-3 w-3 shrink-0" />
                      {formatRecurrence(request)}
                    </p>
                  )}
                  {request.status === "slot_suggested" && (
                    <span className="inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600">
                      Suggestion Sent
                    </span>
                  )}
                  {request.status === "resubmitted" && (
                    <span className="inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500">
                      Resubmitted
                    </span>
                  )}
                  {request.status === "rejected" && request.reject_reason && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Reason: {request.reject_reason}
                    </p>
                  )}
                </div>
              </div>

              {(request.status === "pending" ||
                request.status === "resubmitted") &&
                (rejectingRequest?.id === request.id ? (
                  <div className="space-y-2 mt-3 pt-3 border-t border-foreground/8">
                    <Textarea
                      placeholder="Reason for rejecting (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={responding}
                        onClick={handleRejectCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        loading={responding}
                        onClick={handleRejectConfirm}
                      >
                        Confirm Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-foreground/8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectClick(request)}
                    >
                      Reject
                    </Button>
                    {request.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestClick(request)}
                      >
                        Suggest New Slot
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowWorkspaceDialog(true)
                      }}
                    >
                      Accept
                    </Button>
                  </div>
                ))}
            </div>
          ))}

          {!loading && pagination.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <PaginationComponent
                pagination={pagination}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SuggestNewSlotDialog
        open={suggestDialogOpen}
        onOpenChange={setSuggestDialogOpen}
        request={selectedRequest}
        mentorId={mentorId}
        onSuggested={async () => {
          setSelectedRequest(null)
          await loadRequests()
        }}
      />
      <AcceptSessionRequestDialog
        open={showWorkspaceDialog}
        onOpenChange={setShowWorkspaceDialog}
        request={selectedRequest}
        mentorId={mentorId}
        onAccepted={(requestId) => {
          setRequests((prev) => prev.filter((r) => r.id !== requestId))
          setSelectedRequest(null)
          setShowWorkspaceDialog(false)
          toast({ title: "Request accepted", duration: 3000 })
        }}
      />
    </div>
  )
}
