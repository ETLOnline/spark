"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Download, FileText } from "lucide-react"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { formatFileSize } from "@/src/utils/helpers"
import { AcceptAdvisorRequestAction } from "@/src/server-actions/AdvisorRequest/AdvisorRequest"
import type { AdvisorRequestListItem } from "@/src/server-actions/AdvisorRequest/AdvisorRequest"
import { STATUS_BADGE, STATUS_LABEL } from "./AdvisorRequestsScreen"
import { RejectRequestDialog } from "./RejectRequestDialog"

interface Props {
  request: AdvisorRequestListItem | null
  canAccept: boolean
  canReject: boolean
  onOpenChange: (open: boolean) => void
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-sm text-muted-foreground rounded-lg border border-foreground/8 bg-muted/40 p-3">
        {value}
      </p>
    </div>
  )
}

export function RequestDetailsDialog({
  request,
  canAccept,
  canReject,
  onOpenChange
}: Props) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [accepting, , , acceptRequest] = useServerAction(
    AcceptAdvisorRequestAction
  )

  async function handleAccept() {
    if (!request) return
    const result = await acceptRequest(request.id)
    if (result?.success) {
      router.refresh()
      onOpenChange(false)
    } else {
      toast({
        variant: "destructive",
        title: "Could not accept request",
        description:
          typeof result?.error === "string"
            ? result.error
            : "Something went wrong."
      })
    }
  }

  return (
    <>
      <Dialog open={!!request} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-2xl max-h-[85vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>

          {request && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-lg border border-foreground/8 bg-muted/40 p-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>
                    {`${request.requester.first_name[0] ?? ""}${request.requester.last_name[0] ?? ""}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {request.requester.first_name} {request.requester.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {request.created_at
                      ? new Date(request.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC"
                          }
                        )
                      : "—"}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${STATUS_BADGE[request.viewerStatus]}`}
                >
                  {STATUS_LABEL[request.viewerStatus]}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Group Members</p>
                <div className="space-y-2">
                  {request.group_members.map((member) => (
                    <div
                      key={member.registration_number}
                      className="flex items-center justify-between rounded-lg border border-foreground/8 bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground">
                        {member.registration_number}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <FieldRow
                  label="University Supervisor"
                  value={request.supervisor_name}
                />
                <FieldRow label="FYP Title" value={request.fyp_title} />
                <FieldRow label="Domain" value={request.domain.name} />
              </div>

              <TextBlock label="Abstract" value={request.abstract} />
              <TextBlock
                label="Problem Statement"
                value={request.problem_statement}
              />

              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Tech Stack</p>
                <p className="text-sm text-muted-foreground rounded-lg border border-foreground/8 bg-muted/40 p-3">
                  {request.tech_stack}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Project Proposal</p>
                {request.proposalFile ? (
                  <Link
                    href={request.proposalFile.file_path}
                    target="_blank"
                    className="flex items-center justify-between gap-3 rounded-lg border border-foreground/8 bg-muted/40 p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {request.proposalFile.file_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(request.proposalFile.file_size)}
                        </p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ) : request.proposal_link ? (
                  <Link
                    href={request.proposal_link}
                    target="_blank"
                    className="block break-all rounded-lg border border-foreground/8 bg-muted/40 p-3 text-sm text-primary"
                  >
                    {request.proposal_link}
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No proposal attached.
                  </p>
                )}
              </div>

              {request.viewerStatus === "pending" &&
                (canReject || canAccept) && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {canReject && (
                      <Button
                        variant="destructive"
                        onClick={() => setRejectDialogOpen(true)}
                      >
                        Reject
                      </Button>
                    )}
                    {canAccept && (
                      <Button onClick={handleAccept} disabled={accepting}>
                        {accepting ? "Accepting..." : "Accept"}
                      </Button>
                    )}
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {request && (
        <RejectRequestDialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          requestId={request.id}
          studentName={`${request.requester.first_name} ${request.requester.last_name}`}
          onRejected={() => {
            router.refresh()
            onOpenChange(false)
          }}
        />
      )}
    </>
  )
}
