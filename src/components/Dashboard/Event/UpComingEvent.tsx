import React, { Dispatch, SetStateAction, useState } from "react";
import CreateEvent from "./CreateEvent";
import EventCard from "./EventCard";
import { SelectEvent } from "@/src/db/schema";
import { atom } from "jotai";

interface Props {
  events: SelectEvent[];
  setEvents: Dispatch<SetStateAction<SelectEvent[]>>;
}

function UpComingEvent({ events, setEvents }: Props) {


  return (
    <div className="grid justify-items-center mt-2">
      <CreateEvent events={events} setEvents={setEvents} />
      <div className="flex flex-wrap justify-between w-full gap-3">
        {events.map((event, i) => {
          return (
            <EventCard
              key={i}
              event={event}
            />
          )
        }
        )}
      </div>
    </div>
  );
}

export default UpComingEvent;
