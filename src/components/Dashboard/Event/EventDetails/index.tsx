"use client"
import { useEffect, useState } from "react"
import { AttendeesList } from "@/src/components/Dashboard/Event/EventDetails/AttendanceList"
import { EventAbout } from "@/src/components/Dashboard/Event/EventDetails/EventAbout"
import { EventDetails } from "@/src/components/Dashboard/Event/EventDetails/EventDetailsCom"
import { EventHeader } from "@/src/components/Dashboard/Event/EventDetails/EventHeader"
import { EventHero } from "@/src/components/Dashboard/Event/EventDetails/EventHero"
import { EventOrganizer } from "@/src/components/Dashboard/Event/EventDetails/EventOrganzier"
import { EventPricing } from "@/src/components/Dashboard/Event/EventDetails/EventPrice"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetEventByIdAction } from "@/src/server-actions/events/event"
import { SelectEvent } from "@/src/db/schema"
import { useHostUserInfo } from "@/src/hooks/useGetHostData"

interface Props {
  event_id: string
}

export default function EventsDetailsClient({ event_id }: Props) {
  const [isEventData, setIsEventData] = useState<SelectEvent | null>(null)

  const [loading, eventData, error, getEvent] =
    useServerAction(GetEventByIdAction)

  useEffect(() => {
    const getEventData = async () => {
      const eventId = Number(event_id)
      const res = await getEvent(eventId)

      if (res?.data) {
        setIsEventData(res?.data[0])
      }
    }

    getEventData()
  }, [event_id])
  const hostInfo = useHostUserInfo(isEventData?.host_id)

  const { location, meeting_link } = isEventData?.metadata
    ? JSON.parse(isEventData.metadata)
    : { location: "", meeting_link: "" }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <EventHeader
          coverImage={isEventData?.coverImage}
          eventType={isEventData?.type ?? "Event Type"}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EventHero
              title={isEventData?.title ?? "Event Title"}
              tags={isEventData?.tags ?? []}
            />
            <EventDetails
              startDateTime={isEventData?.start_date_time ?? ""}
              endDateTime={isEventData?.end_date_time ?? ""}
              location={location || ""}
              meeting_link={meeting_link || ""}
              type={isEventData?.type ?? ""}
              eventId={isEventData?.id}
            />
            <EventAbout description={isEventData?.description ?? ""} />
            <EventOrganizer hostName={hostInfo?.full_name || "host"} />
          </div>

          {/* Sidebar: Spans one column on large screens */}
          <div className="lg:col-span-1 space-y-6">
            <EventPricing
              eventEndTime={isEventData?.end_date_time}
              event_id={event_id}
            />

            <AttendeesList eventId={isEventData?.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
