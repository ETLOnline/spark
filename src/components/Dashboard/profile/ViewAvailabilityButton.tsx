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

type Props = {
  mentorId: string
  viewerRp: number
}

export default function ViewAvailabilityButton({ mentorId, viewerRp }: Props) {
  const canView = viewerRp >= RP_THRESHOLD
  const shortfall = RP_THRESHOLD - viewerRp

  if (canView) {
    return (
      <Link href={`/profile/${mentorId}/availability`} className="w-full">
        <Button variant="outline" className="w-full mt-2" size="sm">
          <CalendarDays className="h-4 w-4 mr-2" />
          View Availability
        </Button>
      </Link>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="w-full mt-2 inline-block">
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
  )
}
