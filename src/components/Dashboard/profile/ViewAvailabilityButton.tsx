import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"

const RP_THRESHOLD = 500

// Eligibility gate is temporarily disabled — every viewer can access a
// mentor's availability regardless of RP. Flip this back to true to
// re-enable the RP_THRESHOLD restriction below.
const ELIGIBILITY_RESTRICTION_ENABLED = false

type Props = {
  mentorId: string
  viewerRp: number
}

export default function ViewAvailabilityButton({ mentorId, viewerRp }: Props) {
  const canView = !ELIGIBILITY_RESTRICTION_ENABLED || viewerRp >= RP_THRESHOLD
  const shortfall = RP_THRESHOLD - viewerRp

  const eligibilityNote = (
    <p className="text-xs text-muted-foreground mt-2">
      Eligibility: {RP_THRESHOLD} RP required
    </p>
  )

  if (canView) {
    return (
      <>
        {eligibilityNote}
        <Link href={`/profile/${mentorId}/availability`} className="w-full">
          <Button variant="outline" className="w-full mt-1" size="sm">
            <CalendarDays className="h-4 w-4 mr-2" />
            View Availability
          </Button>
        </Link>
      </>
    )
  }

  return (
    <>
      {eligibilityNote}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-full mt-1 inline-block">
              <Button
                variant="outline"
                className="w-full pointer-events-none opacity-50"
                size="sm"
                disabled
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                View Availability
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Earn {shortfall} more RP to unlock this mentor</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}
