import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { RP_THRESHOLD } from "@/src/utils/constants"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

type Props = {
  mentorId: string
  viewerRp: number
}

export default function ViewAvailabilityButton({ mentorId, viewerRp }: Props) {
  const { canAccess } = usePermissionChecker("global")
  if (!canAccess("session.request")) return null

  return (
    <>
      <p className="text-xs text-muted-foreground mt-2">
        Eligibility: {RP_THRESHOLD} RP required
      </p>
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
