import React, { useState } from "react";
import { Calendar } from "../../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  attendees: number;
}

interface Props {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

function CelenderVeiw({ events }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <div className="flex flex-col sm:flex-row h-full">
      <div className="w-full sm:w-1/2 p-4 justify-items-center rounded-md border ">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className=""
        />
      </div>
      <div className="w-full sm:w-1/2 p-4">
        <h3 className="text-lg font-semibold mb-4">
          Events on {selectedDate?.toDateString()}
        </h3>
        <div className="space-y-4">
          {events
            .filter(
              (event) =>
                event.date.toDateString() === selectedDate?.toDateString()
            )
            .map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{event.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {event.location}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

export default CelenderVeiw;
