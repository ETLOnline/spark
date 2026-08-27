"use client"

import { useMemo, useState } from "react"
import { GraduationCap } from "lucide-react"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { RequestDetailsDialog } from "./RequestDetailsDialog"
import type {
  AdvisorRequestListItem,
  AdvisorViewerStatus
} from "@/src/server-actions/AdvisorRequest/AdvisorRequest"
import type { StudentRequestStatus } from "@/src/db/data-access/advisor-requests/query"

type StatusTab = "all" | AdvisorViewerStatus

type RequestStatus = AdvisorViewerStatus | StudentRequestStatus

export const STATUS_BADGE: Record<RequestStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600",
  accepted: "bg-emerald-500/15 text-emerald-500",
  rejected: "bg-red-500/15 text-red-500",
  already_assigned: "bg-foreground/10 text-muted-foreground",
  expired: "bg-foreground/10 text-muted-foreground",
  awaiting_approval: "bg-amber-500/15 text-amber-600"
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  already_assigned: "Already Assigned",
  expired: "Expired",
  awaiting_approval: "Awaiting Approval"
}

interface AdvisorRequestsScreenProps {
  requests: AdvisorRequestListItem[]
  canViewDetails: boolean
  canAccept: boolean
  canReject: boolean
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}

function formatSubmittedOn(createdAt: string | null) {
  if (!createdAt) return "—"
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  })
}

export function AdvisorRequestsScreen({
  requests,
  canViewDetails,
  canAccept,
  canReject
}: AdvisorRequestsScreenProps) {
  const [activeTab, setActiveTab] = useState<StatusTab>("all")
  const [selectedRequest, setSelectedRequest] =
    useState<AdvisorRequestListItem | null>(null)

  const filteredRequests = useMemo(() => {
    if (activeTab === "all") return requests
    return requests.filter((r) => r.viewerStatus === activeTab)
  }, [requests, activeTab])

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-3">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as StatusTab)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="awaiting_approval">Awaiting Approval</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="already_assigned">Already Assigned</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex flex-col gap-3 mt-3">
          {filteredRequests.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No requests in this category
            </p>
          )}

          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg border border-foreground/8 p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>
                    {getInitials(
                      request.requester.first_name,
                      request.requester.last_name
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {request.requester.first_name}{" "}
                      {request.requester.last_name}
                    </p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                      {request.domain.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    {request.fyp_title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted {formatSubmittedOn(request.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_BADGE[request.viewerStatus]}`}
                  >
                    {STATUS_LABEL[request.viewerStatus]}
                  </span>
                  {canViewDetails && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <RequestDetailsDialog
        request={selectedRequest}
        canAccept={canAccept}
        canReject={canReject}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null)
        }}
      />
    </div>
  )
}
