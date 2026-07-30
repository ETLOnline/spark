"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import moment from "moment-timezone"
import {
  CalendarDays,
  MessageSquare,
  RefreshCw,
  Users,
  Video
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetMentorSuggestableSlotsAction,
  GetSessionRequestsForMentorByStatusAction,
  RespondToSessionRequestAction,
  SuggestNewSlotAction,
  type SlotOccurrence
} from "@/src/server-actions/Mentor/MentorActions"
import { toast } from "@/src/hooks/use-toast"
import { cn } from "@/src/lib/utils"
import { SelectSessionRequest } from "@/src/db/schema"
import { countOccurrences } from "@/src/utils/time"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import AcceptSessionRequestDialog from "./AcceptSessionRequestDialog"
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

function formatOccurrence(occ: SlotOccurrence) {
  const date = moment(occ.displayDate, "YYYY-MM-DD").format("ddd, MMM D, YYYY")
  const start = moment(occ.start_time, "HH:mm").format("h:mm A")
  const end = moment(occ.end_time, "HH:mm").format("h:mm A")
  return `${date} · ${start} – ${end}`
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
  const [slotOccurrences, setSlotOccurrences] = useState<SlotOccurrence[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedOccurrenceKeys, setSelectedOccurrenceKeys] = useState<
    string[]
  >([])
  const [suggestionMessage, setSuggestionMessage] = useState("")

  const [, , , getRequestsByStatus] = useServerAction(
    GetSessionRequestsForMentorByStatusAction
  )
  const [responding, , , respondToRequest] = useServerAction(
    RespondToSessionRequestAction
  )
  const [, , , getSuggestableSlots] = useServerAction(
    GetMentorSuggestableSlotsAction
  )
  const [suggesting, , , suggestNewSlot] = useServerAction(SuggestNewSlotAction)

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

  const handleRespond = async (status: "accepted" | "rejected") => {
    if (!selectedRequest) return
    const res = await respondToRequest(selectedRequest.id, status)
    if (res?.success) {
      setSelectedRequest(null)
      await loadRequests()
      toast({
        title: status === "accepted" ? "Request accepted" : "Request rejected",
        duration: 3000
      })
    } else {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: res?.error ?? "Please try again.",
        duration: 3000
      })
    }
  }

  const handleSuggestClick = async () => {
    if (!selectedRequest) return
    setLoadingSlots(true)
    setSuggestDialogOpen(true)
    const res = await getSuggestableSlots({
      mentorId,
      afterDate: selectedRequest.session_date
    })
    if (res?.success && res.data) {
      setSlotOccurrences(res.data as SlotOccurrence[])
    }
    setLoadingSlots(false)
  }

  const handleOccurrenceToggle = (key: string) => {
    setSelectedOccurrenceKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSuggestSubmit = async () => {
    if (!selectedRequest || selectedOccurrenceKeys.length === 0) return
    const res = await suggestNewSlot({
      requestId: selectedRequest.id,
      slotIds: selectedOccurrenceKeys,
      suggestionMessage: suggestionMessage.trim() || undefined
    })
    if (res?.success) {
      setSelectedRequest(null)
      setSuggestDialogOpen(false)
      setSelectedOccurrenceKeys([])
      setSuggestionMessage("")
      await loadRequests()
      toast({ title: "Suggestion sent to mentee", duration: 3000 })
    } else {
      toast({
        variant: "destructive",
        title: "Failed to send suggestion",
        description: res?.error ?? "Please try again.",
        duration: 3000
      })
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedRequest(null)
      setSelectedOccurrenceKeys([])
      setSuggestionMessage("")
    }
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
            <button
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className="text-left rounded-lg border border-foreground/8 p-4 hover:bg-foreground/[0.02] transition-colors"
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
                        <Video className="h-3 w-3" />
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
                </div>
              </div>
            </button>
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

      {/* ── Request detail dialog ── */}
      <Dialog open={!!selectedRequest} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[440px] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Request</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Mentee mini profile */}
              <Link
                href={`/profile/${selectedRequest.mentee.unique_id}`}
                className="flex items-center gap-3 rounded-lg border border-foreground/8 p-3 hover:bg-foreground/[0.02] transition-colors"
              >
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={selectedRequest.mentee.profile_url || ""} />
                  <AvatarFallback>
                    {selectedRequest.mentee.first_name}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {selectedRequest.mentee.first_name}{" "}
                    {selectedRequest.mentee.last_name}
                  </p>
                  {selectedRequest.mentee.profile?.institute && (
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedRequest.mentee.profile.institute}
                    </p>
                  )}
                </div>
              </Link>

              {/* Topic */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Topic</p>
                <p className="text-sm flex items-start gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  {selectedRequest.topic}
                </p>
              </div>

              {/* Description */}
              {selectedRequest.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              {/* Slot info */}
              <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-foreground/10 bg-muted/40">
                {selectedRequest.session_type === "group" ? (
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Video className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {selectedRequest.session_type === "group" ? "Group" : "1-on-1"}
                <span className="text-muted-foreground ml-auto">
                  {formatSlot(selectedRequest)}
                </span>
              </div>

              {formatRecurrence(selectedRequest) && (
                <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-primary/20 bg-primary/5 text-primary">
                  <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                  {formatRecurrence(selectedRequest)}
                </div>
              )}

              {/* Actions based on status */}
              {selectedRequest.status === "pending" && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={responding}
                    onClick={() => handleRespond("rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={responding}
                    onClick={handleSuggestClick}
                  >
                    Suggest New Slot
                  </Button>
                  <Button
                    size="sm"
                    loading={responding}
                    onClick={() => setShowWorkspaceDialog(true)}
                  >
                    Accept
                  </Button>
                </div>
              )}

              {selectedRequest.status === "resubmitted" && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={responding}
                    onClick={() => handleRespond("rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowWorkspaceDialog(true)}
                  >
                    Accept
                  </Button>
                </div>
              )}

              {(selectedRequest.status === "accepted" ||
                selectedRequest.status === "rejected") && (
                <p
                  className={cn(
                    "text-sm font-medium text-right pt-2",
                    selectedRequest.status === "accepted"
                      ? "text-emerald-500"
                      : "text-destructive"
                  )}
                >
                  {selectedRequest.status === "accepted"
                    ? "Accepted"
                    : "Rejected"}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Suggest New Slot dialog (separate) ── */}
      <Dialog
        open={suggestDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSuggestDialogOpen(false)
            setSelectedOccurrenceKeys([])
            setSuggestionMessage("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Suggest New Slot</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Select one or more of your available slots to suggest to the
              mentee.
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {loadingSlots && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading slots…
                </p>
              )}
              {!loadingSlots && slotOccurrences.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No available slots after the requested date.
                </p>
              )}
              {slotOccurrences.map((occ) => {
                const selected = selectedOccurrenceKeys.includes(occ.key)
                return (
                  <button
                    key={occ.key}
                    onClick={() => handleOccurrenceToggle(occ.key)}
                    className={cn(
                      "flex items-center gap-3 text-left px-3 py-2.5 rounded-md border text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-foreground/10 hover:bg-foreground/[0.03]"
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded border shrink-0 flex items-center justify-center",
                        selected
                          ? "border-primary bg-primary"
                          : "border-foreground/30"
                      )}
                    >
                      {selected && (
                        <svg
                          className="h-2.5 w-2.5 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{formatOccurrence(occ)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {occ.session_type === "group" ? "Group" : "1-on-1"}
                        {occ.repeat_type !== "none" && ` · ${occ.repeat_type}`}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {slotOccurrences.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Message <span className="text-foreground/40">(optional)</span>
                </p>
                <Textarea
                  placeholder="e.g. This slot is taken, please choose from the options below."
                  value={suggestionMessage}
                  onChange={(e) => setSuggestionMessage(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSuggestDialogOpen(false)
                  setSelectedOccurrenceKeys([])
                  setSuggestionMessage("")
                }}
                disabled={suggesting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={suggesting}
                disabled={selectedOccurrenceKeys.length === 0}
                onClick={handleSuggestSubmit}
              >
                Send Suggestion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
