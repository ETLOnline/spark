import React, { Dispatch, SetStateAction, useState } from "react"
import CreateEvent from "./CreateEvent"
import EventCard from "./EventCard"
import { SelectEvent } from "@/src/db/schema"
import { useAtomValue } from "jotai"
import { eventStore } from "@/src/store/event/eventStore"

interface Props {
  events: SelectEvent[]
  setEvents: Dispatch<SetStateAction<SelectEvent[]>>
}

function UpComingEvent({ events, setEvents }: Props) {
  const permissionChecker = useAtomValue(eventStore.permissionCheckerAtom)
  const canCreate = permissionChecker?.canAccess("event.create")
  const canView = permissionChecker?.canAccess("event.view")
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
