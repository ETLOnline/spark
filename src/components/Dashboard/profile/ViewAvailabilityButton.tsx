import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

type Props = {
  mentorId: string
  viewerRp: number
  rpThresholdEnabled?: boolean
  rpThresholdValue?: string
}

export default function ViewAvailabilityButton({
  mentorId,
  viewerRp,
  rpThresholdEnabled = false,
  rpThresholdValue = ""
}: Props) {
  const { canAccess } = usePermissionChecker("global")
  if (!canAccess("mentorship.session.request")) return null

  return (
    <>
      {rpThresholdEnabled && (
        <p className="text-xs text-muted-foreground mt-2">
          Eligibility: {rpThresholdValue} RP required
        </p>
      )}
      <Link href={`/profile/${mentorId}/availability`} className="w-full">
        <Button
          variant="outline"
          className="w-full mt-1 h-auto min-h-8 whitespace-normal py-1.5"
          size="sm"
        >
          <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
          <span className="text-center">
            View Availability / Request Session
          </span>
        </Button>
      </Link>
    </>
  )
}
