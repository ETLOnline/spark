import React, { Dispatch, SetStateAction, useState } from "react";
import CreateEvent from "./CreateEvent";
import EventCard from "./EventCard";
import { SelectEvent } from "@/src/db/schema";

interface Props {
  events: SelectEvent[];
  setEvents: Dispatch<SetStateAction<SelectEvent[]>>;
}

function UpComingEvent({ events, setEvents }: Props) {
  const [formModalVisibility, setFormModalVisiblity] = useState(false)
  const [SelectedEvent, setSelectedEvent] = useState<SelectEvent | null>(null)


  return (
    <div className="grid justify-items-center mt-2">
      <CreateEvent selectedEvent={SelectedEvent} setSelectedEvent={setSelectedEvent} formModalVisibility={formModalVisibility} setFormModalVisibility={setFormModalVisiblity} events={events} setEvents={setEvents} />
      <div className="flex flex-wrap justify-between w-full gap-3">
        {events.map((event, i) => {
          return (
            <EventCard
              key={i}
              event={event}
              setFormModelVisibility={setFormModalVisiblity}
              setSelectedEvent={setSelectedEvent}
            />
          )
        }
        )}
      </div>
    </div>
  );
}

export default UpComingEvent;
