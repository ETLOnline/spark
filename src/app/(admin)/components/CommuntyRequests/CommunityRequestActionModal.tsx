import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { SelectCommunityRequest } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateCommunityRequestAction } from "@/src/server-actions/Community/CommunityRequests/CommunityRequests"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { RequestStatus } from "@/src/types/CommunityCreationRequest/CommunityCreationRequest"
import { Textarea } from "@/src/components/ui/textarea"
import { getCharacterCount, isValidInviteLink } from "@/src/utils/helpers"

interface CommunityRequestActionModalProps {
  selectedRequest: SelectCommunityRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isAcceptRequest: boolean
  setIsAcceptRequest: Dispatch<SetStateAction<boolean>>
  setIsRejectRequest: Dispatch<SetStateAction<boolean>>
  fetchRequests: () => void
  setIsDetailModalOpen: (open: boolean) => void
}

function CommunityRequestActionModal({
  selectedRequest,
  open,
  onOpenChange,
  isAcceptRequest,
  setIsAcceptRequest,
  setIsRejectRequest,
  fetchRequests,
  setIsDetailModalOpen
}: CommunityRequestActionModalProps) {
  const [inviteLink, setInviteLink] = useState("")
  const [Reason, setReason] = useState("")
  const [updateRequestLoading, , , UpdateRequest] = useServerAction(
    UpdateCommunityRequestAction
  )
  const { toast } = useToast()

  const HandleAcceptRequest = async () => {
    try {
      if (!inviteLink.trim() || !selectedRequest) return

      const link = isValidInviteLink(inviteLink)
      if (!link) {
        toast({
          title: "Error",
          description:
            "Invalid invite link. Please provide a valid invite link.",
          variant: "destructive"
        })
        return
      }

      const res = await UpdateRequest(
        selectedRequest?.id,
        RequestStatus.ACCEPTED
      )

      if (res?.success) {
        toast({
          title: "Success",
          description: "Community request accepted successfully.",
          duration: 3000
        })
        fetchRequests()
        onOpenChange(false)
        setInviteLink("")
        setIsAcceptRequest(false)
        onOpenChange(false)
        setIsDetailModalOpen(false)
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          "Failed to accept the community request. Please try again.",
        variant: "destructive"
      })
      return
    }
  }

  const HandleRejectRequest = async () => {
    try {
      if (!Reason.trim() || !selectedRequest) return

      const characterCount = getCharacterCount(Reason)
      console.log(characterCount)
      if (characterCount < 100) {
        toast({
          title: "Error",
          description:
            "Reason must be at least 100 characters long. Please try again.",
          variant: "destructive"
        })
        return
      }

      const res = await UpdateRequest(
        selectedRequest?.id,
        RequestStatus.REJECTED
      )

      if (res?.success) {
        toast({
          title: "Success",
          description: "Community request rejected successfully.",
          duration: 3000
        })
        fetchRequests()
        onOpenChange(false)
        setReason("")
        setIsRejectRequest(false)
        onOpenChange(false)
        setIsDetailModalOpen(false)
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          "Failed to reject the community request. Please try again.",
        variant: "destructive"
      })
      return
    }
  }

  useEffect(() => {
    if (!open) {
      setInviteLink("")
      setReason("")
      setIsAcceptRequest(false)
      setIsRejectRequest(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold leading-tight">
            {isAcceptRequest
              ? "Accept Community Request"
              : "Reject Community Request"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {isAcceptRequest
              ? "Provide the invite link for the newly created community. The requester will use this link to join."
              : "Share your reason for rejecting this request. The requester will see this explanation."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {isAcceptRequest ? "Invite Link" : "Rejection Reason"}
            </label>
            {isAcceptRequest ? (
              <Input
                value={inviteLink.trim()}
                onChange={(e) => setInviteLink(e.target.value.trim())}
                placeholder={"https://community.example.com/invite/..."}
                className="h-10"
              />
            ) : (
              <>
                <Textarea
                  value={Reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={"Reason for rejection"}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {getCharacterCount(Reason)} characters
                </p>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          {isAcceptRequest ? (
            <Button
              onClick={HandleAcceptRequest}
              disabled={!inviteLink || updateRequestLoading}
              loading={updateRequestLoading}
              className="flex-1"
            >
              Accept Request
            </Button>
          ) : (
            <Button
              onClick={HandleRejectRequest}
              disabled={!Reason.trim() || updateRequestLoading}
              loading={updateRequestLoading}
              variant="destructive"
              className="flex-1"
            >
              Reject Request
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CommunityRequestActionModal
