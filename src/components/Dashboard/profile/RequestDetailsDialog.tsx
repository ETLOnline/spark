"use client"

import { useState } from "react"
import { Download, FileText } from "lucide-react"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import type { AdvisorRequest } from "./AdvisorRequestsScreen"
import { STATUS_BADGE, STATUS_LABEL } from "./AdvisorRequestsScreen"
import { RejectRequestDialog } from "./RejectRequestDialog"

interface Props {
  request: AdvisorRequest | null
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

export function RequestDetailsDialog({ request, onOpenChange }: Props) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  return (
    <>
      <Dialog open={!!request} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>

          {request && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-lg border border-foreground/8 bg-muted/40 p-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>{request.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{request.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {request.submittedOn}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${STATUS_BADGE[request.status]}`}
                >
                  {STATUS_LABEL[request.status]}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Group Members</p>
                <div className="space-y-2">
                  {request.groupMembers.map((member) => (
                    <div
                      key={member.regNo}
                      className="flex items-center justify-between rounded-lg border border-foreground/8 bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground">
                        {member.regNo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <FieldRow
                  label="University Supervisor"
                  value={request.universitySupervisor}
                />
                <FieldRow label="FYP Title" value={request.fypTitle} />
                <FieldRow label="Domain" value={request.domain} />
              </div>

              <TextBlock label="Abstract" value={request.abstract} />
              <TextBlock
                label="Problem Statement"
                value={request.problemStatement}
              />

              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Tech Stack</p>
                <p className="text-sm text-muted-foreground rounded-lg border border-foreground/8 bg-muted/40 p-3">
                  {request.techStack}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Project Proposal</p>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-foreground/8 bg-muted/40 p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {request.proposalFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.proposalFile.size}
                      </p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </div>

              {request.status === "pending" && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="destructive"
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    Reject
                  </Button>
                  <Button>Accept</Button>
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
          studentName={request.studentName}
        />
      )}
    </>
  )
}
