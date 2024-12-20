import React, { Dispatch, SetStateAction } from "react";
import CreateEvent, { Event } from "./CreateEvent";
import { sampleEvents } from ".";
import EventCard from "./EventCard";

interface Props {
  events: Event[];
  setEvents: Dispatch<SetStateAction<Event[]>>;
}

function UpComingEvent({ events, setEvents }: Props) {
  return (
    <div className="grid justify-items-center mt-3">
      <CreateEvent events={events} setEvents={setEvents} />
      <div className="flex flex-wrap justify-between">
        {sampleEvents.map(
          ({ id, title, description, date, location, attendees }, i) => {
            return (
              <EventCard
                key={i}
                id={id}
                title={title}
                description={description}
                date={date}
                location={location}
                attendees={attendees}
              />
            );
          }
        )}
      </div>
    </div>
  );
}

export default UpComingEvent;
