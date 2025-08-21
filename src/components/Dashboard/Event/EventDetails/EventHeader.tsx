import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import Image from "next/image"
import { Video, MapPin, Presentation } from "lucide-react"
import { useEffect } from "react"

interface Props {
  eventType: string
  coverImage: string | undefined
}

export function EventHeader({ eventType, coverImage }: Props) {
  useEffect(() => {
    console.log("eventType", eventType)
  }, [eventType])

  const eventTypeLower = eventType?.toLowerCase()

  let badgeText = "In Person"
  let Icon = MapPin

  if (eventTypeLower === "virtual") {
    badgeText = "Virtual"
    Icon = Video
  } else if (eventTypeLower === "hybrid") {
    badgeText = "Hybrid"
    Icon = Presentation
  }

  return (
    <Card className="mb-6 min-h-60 relative overflow-hidden h-full">
      <Image
        src={coverImage || "/images/profile/background.svg"}
        alt="Event Cover Image "
        fill
        className="object-cover min-h-96"
      />

      <CardContent className="p-6 relative  flex h-full items-start">
        <div className="flex items-center gap-2 text-sm text-white">
          <Badge
            variant="outline"
            className="bg-gray-100 text-black flex gap-1"
          >
            <Icon className="h-4 w-4" />
            {badgeText}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
