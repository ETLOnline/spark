import { Card, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Progress } from "@/src/components/ui/progress"
import { useEventAttendees } from "@/src/hooks/useEventAttendees"
import { Calendar, Clock, MapPin, Users, Video } from "lucide-react"
import moment from "moment"
import { useEffect } from "react"

export function EventDetails({
  startDateTime,
  endDateTime,
  location,
  meeting_link,
  type,
  eventId
}: {
  startDateTime: string | undefined
  endDateTime: string | undefined
  location: string
  meeting_link: string
  type: string | undefined
  eventId: number | undefined
}) {
  const formattedStartDate = startDateTime
    ? moment(startDateTime).format("ddd, MMM DD, YYYY")
    : "N/A"
  const formattedEndDate = endDateTime
    ? moment(endDateTime).format("ddd, MMM DD, YYYY")
    : "N/A"
  const formattedStartTime = startDateTime
    ? moment(startDateTime).format("h:mm A")
    : "N/A"
  const formattedEndTime = endDateTime
    ? moment(endDateTime).format("h:mm A")
    : "N/A"
  const { attendees, loading, error } = useEventAttendees(eventId)

  useEffect(() => {
    console.log("location", location)
    console.log("location", meeting_link)
  }, [location])
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Label className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Event Details
        </Label>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 " />
            <span>
              {startDateTime && endDateTime
                ? `${formattedStartDate} - ${formattedEndDate}`
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 " />
            <span>
              {startDateTime && endDateTime
                ? `${formattedStartTime} - ${formattedEndTime}`
                : "N/A"}
            </span>
          </div>
          <div className="flex items-start flex-col gap-2 text-sm">
            {location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{location || "Location TBD"}</span>
              </div>
            )}

            {meeting_link && (
              <div className="flex items-center pl-[3px] gap-2 text-sm">
                <Video className="w-4 h-4" />
                {meeting_link ? (
                  <a
                    href={
                      meeting_link.startsWith("http")
                        ? meeting_link
                        : `https://${meeting_link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-full overflow-hidden whitespace-nowrap text-ellipsis hover:text-blue-400 hover:underline"
                  >
                    {meeting_link}
                  </a>
                ) : (
                  <span>Virtual Event</span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 text-sm items-center">
            <Users className="w-4 h-4 " />
            <div className="flex  w-1/2  items-center">
              <p className=" min-w-28">{`${attendees.length}/100 attending`}</p>
              <Progress className="h-3" value={attendees?.length} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
