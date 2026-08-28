"use client"

import { useEffect, useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { SelectSpace } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useCanRequestAdvisor } from "@/src/hooks/useCanRequestAdvisor"
import { GetActiveAdvisorRequestForSpaceAction } from "@/src/server-actions/AdvisorRequest/AdvisorRequest"
import RequestAdvisorModal from "./RequestAdvisorModal"

interface Props {
  space: SelectSpace
  label?: string
  showIcon?: boolean
  variant?: "default" | "outline" | "secondary" | "ghost"
  onSubmitted?: () => void
}

/**
 * Self-contained "Request Advisor" action: checks whether the current user is
 * allowed to request an advisor for this space, whether one is already
 * active, and owns the request modal. Renders nothing if the user doesn't
 * have permission, so callers don't need to duplicate any of this checking.
 */
function RequestAdvisorButton({
  space,
  label = "Request Advisor",
  showIcon = true,
  variant = "outline",
  onSubmitted
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasActiveAdvisorRequest, setHasActiveAdvisorRequest] = useState(false)
  const [checkingActiveRequest, , , getActiveAdvisorRequest] = useServerAction(
    GetActiveAdvisorRequestForSpaceAction
  )

  const canSubmitRequest = useCanRequestAdvisor(space?.id, space?.is_FYP_enable)

  useEffect(() => {
    if (!space?.id || !canSubmitRequest) return

    getActiveAdvisorRequest(space.id).then((res) => {
      if (res?.success) setHasActiveAdvisorRequest(!!res.data)
    })
  }, [space?.id, canSubmitRequest])

  if (!canSubmitRequest) return null

  const handleSubmitted = () => {
    setHasActiveAdvisorRequest(true)
    onSubmitted?.()
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant={variant}
                onClick={() => setIsModalOpen(true)}
                disabled={hasActiveAdvisorRequest}
                loading={checkingActiveRequest}
              >
                {showIcon && <UserPlus className="w-4 h-4" />}
                {label}
              </Button>
            </span>
          </TooltipTrigger>
          {hasActiveAdvisorRequest && (
            <TooltipContent>
              This space already has an active advisor request.
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <RequestAdvisorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        spaceId={space.id}
        onSubmitted={handleSubmitted}
      />
    </>
  )
}

export default RequestAdvisorButton
