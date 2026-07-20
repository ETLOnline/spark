import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Button } from "@/src/components/ui/button"

const RP_THRESHOLD = 500

type Props = {
  mentorId: string
  viewerRp: number
}

export default function ViewAvailabilityButton({ mentorId, viewerRp }: Props) {
  return (
    <>
      <p className="text-xs text-muted-foreground mt-2">
        Eligibility: {RP_THRESHOLD} RP required
      </p>
      <Link href={`/profile/${mentorId}/availability`} className="w-full">
        <Button variant="outline" className="w-full mt-1" size="sm">
          <CalendarDays className="h-4 w-4 mr-2" />
          View Availability
        </Button>
      </Link>
    </>
  )
}
