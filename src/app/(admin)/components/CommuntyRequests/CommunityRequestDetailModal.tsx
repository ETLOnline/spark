import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Label } from "@/src/components/ui/label"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { SelectCommunityRequest } from "@/src/db/schema"
import { RequestStatus } from "@/src/types/CommunityCreationRequest/CommunityCreationRequest"
import { Check, X } from "lucide-react"
import React from "react"

interface CommunityRequestDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: SelectCommunityRequest | null
  handleAcceptRequest?: (
    request: SelectCommunityRequest,
    isAccept: boolean
  ) => void
  handleRejectRequest?: (
    request: SelectCommunityRequest,
    isReject: boolean
  ) => void
}

function CommunityRequestDetailModal({
  open,
  onOpenChange,
  request,
  handleAcceptRequest,
  handleRejectRequest
}: CommunityRequestDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Community Request</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(100vh-8rem)] w-full overflow-y-auto pr-3">
          <div className="space-y-6 ">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Badge
                variant={
                  request?.status === RequestStatus.PENDING
                    ? "outline"
                    : request?.status === RequestStatus.ACCEPTED
                      ? "default"
                      : "destructive"
                }
              >
                {request?.status}
              </Badge>
            </div>

            {/* University Information */}
            <section>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 border-b pb-2">
                  University Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* University Name */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    University Name
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.university_name || "N/A"}
                  </p>
                </div>

                {/* University Website */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    University Website
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.university_website || "N/A"}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Country/City
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.city || "N/A"}
                  </p>
                </div>

                {/* Official University Email */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Official University Email
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.official_university_email || "N/A"}
                  </p>
                </div>

                {/* est. students */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Estimated Number of Students
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.estimated_number_of_students || "N/A"}
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 border-b pb-2">
                Contact Person
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Person Name */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Contact Person Name
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.contact_person_name || "N/A"}
                  </p>
                </div>

                {/* designation */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Designation
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.designation || "N/A"}
                  </p>
                </div>

                {/* Contact Number */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Contact Number
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.contact_number || "N/A"}
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Details */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 border-b pb-2">
                Additional Details
              </h3>
              <div className="space-y-4">
                {/* description */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.description || "N/A"}
                  </p>
                </div>

                {/* reason for joining */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Intended Usage
                  </Label>
                  <p className="text-foreground mt-1">
                    {request?.intended_usage || "N/A"}
                  </p>
                </div>

                {/* Reason of Rejection */}
                {request?.status === RequestStatus.REJECTED ? (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Reason of Rejection
                    </Label>
                    <p className="text-foreground mt-1">
                      {request?.reason || "N/A"}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <DialogFooter>
            {request?.status === "pending" ? (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    handleAcceptRequest?.(request, true)
                  }}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    handleRejectRequest?.(request, true)
                  }}
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CommunityRequestDetailModal
