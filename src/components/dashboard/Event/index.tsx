"use client";
import { useState } from "react";
import { CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import UpComingEvent from "./UpComingEvent";
import CelenderVeiw from "./CelenderVeiw";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  attendees: number;
}

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Web Development Workshop",
    description: "Learn the latest web development techniques and tools.",
    date: new Date("2023-05-15T14:00:00Z"),
    location: "Tech Hub, Downtown",
    attendees: 50,
  },
  {
    id: "2",
    title: "AI in Healthcare Conference",
    description: "Explore the applications of AI in modern healthcare.",
    date: new Date("2023-05-20T09:00:00Z"),
    location: "Medical Center Auditorium",
    attendees: 200,
  },
  {
    id: "3",
    title: "Open Source Contributor Day",
    description: "Contribute to open source projects and learn from experts.",
    date: new Date("2023-05-25T10:00:00Z"),
    location: "Community Center",
    attendees: 75,
  },
];

export function EventsScreen() {
  const [events, setEvents] = useState<Event[]>(sampleEvents);

  return (
    <div className="h-auto flex flex-col">
      <CardHeader className="pl-0">
        <CardTitle>Events</CardTitle>
      </CardHeader>
      <Tabs defaultValue="upcoming" className="flex-1 flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1">
            Calendar View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="flex-1 overflow-auto">
          <UpComingEvent events={events} setEvents={setEvents} />
        </TabsContent>
        <TabsContent value="calendar" className="flex-1">
          <CelenderVeiw events={events} setEvents={setEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
