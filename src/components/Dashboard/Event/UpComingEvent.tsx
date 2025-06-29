import React, { Dispatch, SetStateAction, useState } from "react"
import CreateEvent from "./CreateEvent"
import EventCard from "./EventCard"
import { SelectEvent } from "@/src/db/schema"
import { useAtomValue } from "jotai"
import { eventStore } from "@/src/store/event/eventStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface Props {
  events: SelectEvent[]
  setEvents: Dispatch<SetStateAction<SelectEvent[]>>
}

function UpComingEvent({ events, setEvents }: Props) {
  const { permissionChecker } = usePermissionChecker("global")
  const canCreate = permissionChecker
    ? permissionChecker?.canAccess("event.create")
    : false
  const canView = permissionChecker
    ? permissionChecker?.canAccess("event.view")
    : false
  return (
    <div className="grid justify-items-center mt-2">
      {canCreate && <CreateEvent events={events} setEvents={setEvents} />}
      {canView && (
        <div className="flex flex-wrap justify-between w-full gap-3">
          {events.map((event, i) => {
            return <EventCard key={i} event={event} />
          })}
        </div>
      )}
    </div>
  )
}

export default UpComingEvent
