"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import moment from "moment-timezone"
import { CalendarDays, MessageSquare, Users, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetSessionRequestsForMentorByStatusAction,
  RespondToSessionRequestAction
} from "@/src/server-actions/Mentor/MentorActions"
import { toast } from "@/src/hooks/use-toast"
import { cn } from "@/src/lib/utils"
import { SelectSessionRequest } from "@/src/db/schema"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
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

type SessionRequestWithMentee = SelectSessionRequest & { mentee: MenteeInfo }

type StatusTab = "pending" | "accepted" | "rejected"

function formatSlot(request: SessionRequestWithMentee) {
  const date = moment(request.session_date, "YYYY-MM-DD").format(
    "dddd, MMM D, YYYY"
  )
  const start = moment(request.start_time, "HH:mm").format("h:mm A")
  const end = moment(request.end_time, "HH:mm").format("h:mm A")
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

      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
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

              {/* Requested slot + session type */}
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

              {/* Accept / Reject — only actionable while still pending */}
              {selectedRequest.status === "pending" ? (
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
                    loading={responding}
                    onClick={() => handleRespond("accepted")}
                  >
                    Accept
                  </Button>
                </div>
              ) : (
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
    </div>
  )
}
