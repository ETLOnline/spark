import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import CreateEvent from "./CreateEvent"
import EventCard from "./EventCard"
import { SelectEvent } from "@/src/db/schema"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import NoDataCard from "../Channels/ChannelDetails/NoDataCard"
import { Group } from "lucide-react"

interface Props {
  events: SelectEvent[]
  setEvents: Dispatch<SetStateAction<SelectEvent[]>>
  setRefreshTrigger: Dispatch<SetStateAction<boolean>>
  getEventsLoading: boolean
}

function UpComingEvent({
  events,
  setEvents,
  setRefreshTrigger,
  getEventsLoading
}: Props) {
  const { permissionChecker } = usePermissionChecker("global")
  const canCreate = permissionChecker
    ? permissionChecker?.canAccess("events.create")
    : false
  const canView = permissionChecker
    ? permissionChecker?.canAccess("events.view")
    : false

  return (
    <div className="grid  pt-2   ">
      {canCreate && <CreateEvent events={events} setEvents={setEvents} />}
      {canView && (
        <div className="flex w-full justify-center gap-5  flex-wrap">
          {events.length > 0 ? (
            events.map((event, i) => (
              <EventCard
                setRefreshTrigger={setRefreshTrigger}
                key={i}
                event={event}
              />
            ))
          ) : (
            <NoDataCard
              icon={<Group className="h-16 w-16 text-muted-foreground mb-4" />}
              title="No Event found"
              description="Adjust your filters or try a different search term."
            />
          )}
        </div>
      )}
    </div>
  )
}

export default UpComingEvent
